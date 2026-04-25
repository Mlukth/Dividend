import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import fs from 'fs'

function fileMovePlugin() {
  return {
    name: 'file-move-plugin',
    configureServer(server) {
      // 文件移动
      server.middlewares.use('/api/move-files', (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; res.end(); return }
        let body = ''
        req.on('data', c => { body += c })
        req.on('end', () => {
          try {
            const { moves } = JSON.parse(body)
            const results = []
            for (const move of moves) {
              const srcFull = path.resolve(__dirname, 'src/views', `${move.sourcePath}.vue`)
              const targetDir = path.resolve(__dirname, 'src/views', move.targetFolder)
              const destFull = path.join(targetDir, `${path.basename(move.sourcePath)}.vue`)
              if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true })
              if (fs.existsSync(srcFull)) { fs.renameSync(srcFull, destFull); results.push({ success: true, sourcePath: move.sourcePath, targetFolder: move.targetFolder }) }
              else results.push({ success: false, error: 'Source file not found' })
            }
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: true, results }))
          } catch (err) { res.statusCode = 500; res.end(JSON.stringify({ error: err.message })) }
        })
      })

      // file-stats
      server.middlewares.use('/api/file-stats', (req, res) => {
        if (req.method !== 'GET') { res.statusCode = 405; res.end(); return }
        const viewsDir = path.resolve(__dirname, 'src/views')
        const stats = {}
        function walk(dir, base) {
          for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name)
            const rel = base ? `${base}/${entry.name}` : entry.name
            if (entry.isDirectory()) walk(full, rel)
            else if (entry.isFile() && entry.name.endsWith('.vue')) {
              const s = fs.statSync(full)
              stats[rel.replace(/\\/g, '/').replace(/\.vue$/, '')] = { mtime: s.mtime.getTime(), size: s.size }
            }
          }
        }
        walk(viewsDir, '')
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(stats))
      })

      // file-content
      server.middlewares.use('/api/file-content', (req, res) => {
        if (req.method !== 'GET') { res.statusCode = 405; res.end(); return }
        const url = new URL(req.url, `http://${req.headers.host}`)
        const p = url.searchParams.get('path')
        if (!p) { res.statusCode = 400; res.end(); return }
        const safe = path.normalize(p).replace(/^(\.\.[\/\\])+/, '')
        const full = path.resolve(__dirname, 'src/views', `${safe}.vue`)
        if (!full.startsWith(path.resolve(__dirname, 'src/views'))) { res.statusCode = 403; res.end(); return }
        try {
          if (fs.existsSync(full)) res.end(fs.readFileSync(full, 'utf-8'))
          else { res.statusCode = 404; res.end('File not found') }
        } catch (e) { res.statusCode = 500; res.end(e.message) }
      })

      // Markdown 文档
      const MD_BASE = path.resolve(__dirname, 'src/views/小工具研发部(vue版本)/vue_little_tool_markdown')
      const MD_RELATED = path.join(MD_BASE, '关联文档')
      const MD_REQUIREMENT = path.join(MD_BASE, '需求文档')
      ;[MD_BASE, MD_RELATED, MD_REQUIREMENT].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }) })

      const parseBody = (req) => new Promise((resolve) => {
        let body = ''
        req.on('data', c => { body += c })
        req.on('end', () => { try { resolve(JSON.parse(body)) } catch { resolve({}) } })
      })

      const isValidDocName = (name) => /^[\w\u4e00-\u9fa5_-]+$/.test(name)

      server.middlewares.use('/api/markdown-doc', async (req, res) => {
        const url = new URL(req.url, `http://${req.headers.host}`)
        const action = url.searchParams.get('action')
        const subdir = url.searchParams.get('subdir') || ''
        if (!['关联文档', '需求文档', ''].includes(subdir)) { res.statusCode = 400; res.end('invalid subdir'); return }
        const targetDir = subdir ? path.join(MD_BASE, subdir) : MD_BASE

        if (req.method === 'GET' && action === 'list') {
          try {
            const files = fs.readdirSync(targetDir).filter(f => f.endsWith('.md')).map(f => f.replace(/\.md$/, ''))
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: true, data: files }))
          } catch (e) { res.statusCode = 500; res.end(JSON.stringify({ error: e.message })) }
          return
        }

        if (req.method === 'GET' && action === 'search') {
          const prefix = url.searchParams.get('prefix')
          if (!prefix) { res.statusCode = 400; res.end(); return }
          const safePrefix = prefix.replace(/[^\w\u4e00-\u9fa5-]/g, '')
          try {
            const files = fs.readdirSync(targetDir)
            const matched = files.filter(f => f.replace(/\.md$/, '').startsWith(safePrefix)).map(f => f.replace(/\.md$/, ''))
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: true, data: matched }))
          } catch (e) { res.statusCode = 500; res.end(JSON.stringify({ error: e.message })) }
          return
        }

        if (req.method === 'GET' && action === 'read') {
          const name = url.searchParams.get('name')
          if (!name || !isValidDocName(name)) { res.statusCode = 400; res.end(); return }
          const filePath = path.join(targetDir, `${name}.md`)
          try {
            const content = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : ''
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: true, data: { name, content } }))
          } catch (e) { res.statusCode = 500; res.end(JSON.stringify({ error: e.message })) }
          return
        }

        if (req.method === 'POST' && action === 'save') {
          const body = await parseBody(req)
          const { name, content } = body
          if (!name || !isValidDocName(name)) { res.statusCode = 400; res.end(); return }
          try {
            fs.writeFileSync(path.join(targetDir, `${name}.md`), content || '', 'utf-8')
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: true }))
          } catch (e) { res.statusCode = 500; res.end(JSON.stringify({ error: e.message })) }
          return
        }

        if (req.method === 'DELETE' && action === 'delete') {
          const name = url.searchParams.get('name')
          if (!name || !isValidDocName(name)) { res.statusCode = 400; res.end(); return }
          const filePath = path.join(targetDir, `${name}.md`)
          try {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: true }))
          } catch (e) { res.statusCode = 500; res.end(JSON.stringify({ error: e.message })) }
          return
        }

        res.statusCode = 400
        res.end('unknown action')
      })
    }
  }
}

export default defineConfig({
  plugins: [vue(), fileMovePlugin()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: { port: 5174, strictPort: true }
})