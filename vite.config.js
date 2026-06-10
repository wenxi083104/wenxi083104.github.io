import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';

// 递归复制目录的辅助函数
function copyDir(src, dest) {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }
  const entries = readdirSync(src);
  for (const entry of entries) {
    const srcPath = resolve(src, entry);
    const destPath = resolve(dest, entry);
    const stat = statSync(srcPath);
    if (stat.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

export default defineConfig({
  // 项目根目录
  root: '.',
  
  // 构建输出目录
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    
    // 代码压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // 保留 console.log（调试用）
        drop_debugger: true,
        pure_funcs: ['console.debug']
      },
      format: {
        comments: false // 移除注释
      }
    },
    
    // CSS 压缩
    cssMinify: true,
    
    // 文件命名
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        portfolio: resolve(__dirname, 'portfolio.html'),
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    
    // 目标浏览器兼容性
    target: 'es2015',
    
    // 启用 source map（生产环境可关闭）
    sourcemap: false
  },
  
  // 构建完成后复制其他静态页面
  plugins: [
    {
      name: 'copy-static-pages',
      closeBundle() {
        // 复制 portfolio.html 到 dist 根目录
        const pages = ['portfolio.html'];
        for (const page of pages) {
          const src = resolve(__dirname, page);
          const dest = resolve(__dirname, 'dist', page);
          if (existsSync(src)) {
            copyFileSync(src, dest);
            console.log(`Copied ${page} to dist/`);
          }
        }
      }
    }
  ],
  
  // 开发服务器配置
  server: {
    port: 3000,
    open: true,
    cors: true
  },
  
  // 预览服务器配置
  preview: {
    port: 4173
  },
  
  // CSS 配置
  css: {
    devSourcemap: true
  }
});