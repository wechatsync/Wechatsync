import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import yaml from '@modyfi/vite-plugin-yaml'
import { resolve } from 'path'
import { createRequire } from 'node:module'
import { copyFileSync, mkdirSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'fs'
import baseManifest from './manifest.json'

const manifest = baseManifest

// 复制静态文件并修改 manifest 的插件
function copyStaticFilesPlugin() {
  return {
    name: 'copy-static-files',
    writeBundle() {

      // 复制 rules 目录
      const rulesDir = resolve(__dirname, 'rules')
      const distRulesDir = resolve(__dirname, 'dist/rules')

      if (existsSync(rulesDir)) {
        if (!existsSync(distRulesDir)) {
          mkdirSync(distRulesDir, { recursive: true })
        }

        const files = readdirSync(rulesDir)
        for (const file of files) {
          copyFileSync(
            resolve(rulesDir, file),
            resolve(distRulesDir, file)
          )
          console.log(`[copy-static] Copied rules/${file}`)
        }
      }

      // 复制 reader 脚本（避免被 vite 转换为 ES modules）
      const readerDir = resolve(__dirname, 'public/lib')
      const distDir = resolve(__dirname, 'dist')

      if (existsSync(readerDir)) {
        const readerFiles = ['reader.js', 'Readability.js']
        for (const file of readerFiles) {
          const srcPath = resolve(readerDir, file)
          const destPath = resolve(distDir, file)
          if (existsSync(srcPath)) {
            copyFileSync(srcPath, destPath)
            console.log(`[copy-static] Copied ${file} to dist/`)
          }
        }
      }

      // 修改输出的 manifest.json，添加 reader 脚本到 content_scripts
      const manifestPath = resolve(__dirname, 'dist/manifest.json')
      if (existsSync(manifestPath)) {
        const manifestContent = JSON.parse(readFileSync(manifestPath, 'utf-8'))

        // 在 content_scripts 开头添加 reader 脚本
        // 不设置 world，使用默认的 ISOLATED world，与 extractor 共享全局变量
        const readerContentScript = {
          js: ['reader.js', 'Readability.js'],
          matches: ['http://*/*', 'https://*/*'],
          run_at: 'document_start'
        }

        // 添加到 content_scripts 数组开头
        manifestContent.content_scripts = [
          readerContentScript,
          ...manifestContent.content_scripts
        ]

        writeFileSync(manifestPath, JSON.stringify(manifestContent, null, 2))
        console.log('[copy-static] Updated manifest.json with reader scripts')
      }
    }
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '')
  const isDev = mode === 'development'
  return {
    plugins: [
      {
        name: 'worker-markdown-entities',
        enforce: 'pre',
        resolveId(source, importer) {
          // Markdown 解析也运行在 Service Worker；该依赖的 browser 入口依赖 document。
          if (source === 'decode-named-character-reference' && importer) {
            return createRequire(importer).resolve(source)
          }
        },
      },
      react(),
      yaml(),
      crx({ manifest }),
      copyStaticFilesPlugin(),
    ],
    define: {
      'import.meta.env.VITE_GA_MEASUREMENT_ID': JSON.stringify(env.VITE_GA_MEASUREMENT_ID || ''),
      'import.meta.env.VITE_GA_API_SECRET': JSON.stringify(env.VITE_GA_API_SECRET || ''),
      // 开发模式下覆盖 PROD 标志，让 logger 输出 debug 日志
      'import.meta.env.PROD': JSON.stringify(!isDev),
      'import.meta.env.DEV': JSON.stringify(isDev),
    },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@wechatsync/core': resolve(__dirname, '../core/src'),
    },
  },
  build: {
    // 开发模式: 不压缩，生成 sourcemap
    minify: isDev ? false : 'esbuild',
    sourcemap: isDev ? 'inline' : false,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html'),
        editor: resolve(__dirname, 'src/editor/index.html'),
        'sync-dialog': resolve(__dirname, 'src/sync-dialog/index.html'),
        preprocessor: resolve(__dirname, 'src/preprocessor/index.html'),
      },
    },
  },
}})
