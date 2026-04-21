import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import fs from 'fs'

// 自定义插件：处理文件移动 API + 文件元数据接口 + 原始文件内容接口
function fileMovePlugin() {
  return {
    name: 'file-move-plugin',
    configureServer(server) {
      // 文件移动接口
      server.middlewares.use('/api/move-files', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method Not Allowed')
          return
        }

        let body = ''
        req.on('data', chunk => { body += chunk })
        req.on('end', () => {
          try {
            const { moves } = JSON.parse(body)
            const results = []
            
            for (const move of moves) {
              const { sourcePath, targetFolder } = move
              const srcFull = path.resolve(__dirname, 'src/views', `${sourcePath}.vue`)
              const targetDir = path.resolve(__dirname, 'src/views', targetFolder)
              const fileName = path.basename(sourcePath)
              const destFull = path.join(targetDir, `${fileName}.vue`)

              if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true })
              }

              if (fs.existsSync(srcFull)) {
                fs.renameSync(srcFull, destFull)
                results.push({ success: true, sourcePath, targetFolder })
              } else {
                results.push({ success: false, error: 'Source file not found', sourcePath })
              }
            }

            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: true, results }))
          } catch (err) {
            res.statusCode = 500
            res.end(JSON.stringify({ success: false, error: err.message }))
          }
        })
      })

      // 文件元数据接口
      server.middlewares.use('/api/file-stats', (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405
          res.end('Method Not Allowed')
          return
        }

        const viewsDir = path.resolve(__dirname, 'src/views')
        const stats = {}

        function walkDir(dir, basePath = '') {
          const entries = fs.readdirSync(dir, { withFileTypes: true })
          for (const entry of entries) {
            const fullPath = path.join(dir, entry.name)
            const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name
            if (entry.isDirectory()) {
              walkDir(fullPath, relativePath)
            } else if (entry.isFile() && entry.name.endsWith('.vue')) {
              const stat = fs.statSync(fullPath)
              const key = relativePath.replace(/\\/g, '/').replace(/\.vue$/, '')
              stats[key] = {
                mtime: stat.mtime.getTime(),
                size: stat.size
              }
            }
          }
        }

        walkDir(viewsDir)
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(stats))
      })

      // 新增：获取原始文件内容接口（返回纯净源码）
      server.middlewares.use('/api/file-content', (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405
          res.end('Method Not Allowed')
          return
        }

        const url = new URL(req.url, `http://${req.headers.host}`)
        const filePath = url.searchParams.get('path')
        if (!filePath) {
          res.statusCode = 400
          res.end('Missing path parameter')
          return
        }

        // 安全校验：只允许访问 views 目录下的 .vue 文件
        const safePath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '')
        const fullPath = path.resolve(__dirname, 'src/views', `${safePath}.vue`)
        
        // 确保路径在 views 目录内
        const viewsDir = path.resolve(__dirname, 'src/views')
        if (!fullPath.startsWith(viewsDir)) {
          res.statusCode = 403
          res.end('Forbidden')
          return
        }

        try {
          if (fs.existsSync(fullPath)) {
            const content = fs.readFileSync(fullPath, 'utf-8')
            res.setHeader('Content-Type', 'text/plain; charset=utf-8')
            res.end(content)
          } else {
            res.statusCode = 404
            res.end('File not found')
          }
        } catch (err) {
          res.statusCode = 500
          res.end(err.message)
        }
      })
    }
  }
}

export default defineConfig({
  plugins: [vue(), fileMovePlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5174,
    strictPort: true
  }
})