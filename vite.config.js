import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  // 新增端口配置，指定为5174
  server: {
    port: 5174, // 把默认的5173改成5174
    strictPort: true, // 可选：强制使用5174端口，如果被占用则报错（避免自动换端口）
  }
})