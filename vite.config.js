import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import fs from 'fs'

// 自定义插件：处理文件移动 API
function fileMovePlugin() {
  return {
    name: 'file-move-plugin',
    configureServer(server) {
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
              // 源文件完整路径（相对于 views 目录）
              const srcFull = path.resolve(__dirname, 'src/views', `${sourcePath}.vue`)
              // 目标文件夹完整路径
              const targetDir = path.resolve(__dirname, 'src/views', targetFolder)
              const fileName = path.basename(sourcePath)
              const destFull = path.join(targetDir, `${fileName}.vue`)

              // 确保目标文件夹存在
              if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true })
              }

              // 移动文件
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