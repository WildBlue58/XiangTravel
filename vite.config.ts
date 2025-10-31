import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import tailwindcss from "@tailwindcss/vite";
import Components from "unplugin-vue-components/vite";
import { VantResolver } from "@vant/auto-import-resolver";

// 修复Vant bem变量冲突的插件
function fixVantBemConflict() {
  return {
    name: "fix-vant-bem-conflict",
    enforce: "post" as const,
    generateBundle(_options: any, bundle: any) {
      Object.keys(bundle).forEach((fileName) => {
        const chunk = bundle[fileName];
        if (chunk.type === "chunk" && chunk.code) {
          let modified = false;
          let code = chunk.code;

          // 找到所有的 createNamespace 调用并为每个bem创建唯一名称
          const namespaces: { namespace: string; uniqueName: string }[] = [];

          // 第一步：收集所有的namespace并生成唯一名称
          code = code.replace(
            /const\s+\[([^,]+),\s*bem\]\s*=\s*createNamespace\(["']([^"']+)["']\)/g,
            (_match: string, nameVar: string, namespace: string) => {
              const uniqueBemName = `bem$${namespace.replace(
                /[^a-zA-Z0-9]/g,
                "_"
              )}`;
              namespaces.push({ namespace, uniqueName: uniqueBemName });
              modified = true;
              return `const [${nameVar}, ${uniqueBemName}] = createNamespace("${namespace}")`;
            }
          );

          if (modified) {
            chunk.code = code;
            console.log(
              `✓ Fixed ${namespaces.length} bem declarations in ${fileName}`
            );
          }
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    Components({
      resolvers: [VantResolver()],
    }),
    fixVantBemConflict() as any,
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@components": resolve(__dirname, "src/components"),
      "@views": resolve(__dirname, "src/views"),
      "@assets": resolve(__dirname, "src/assets"),
      "@router": resolve(__dirname, "src/router"),
      "@store": resolve(__dirname, "src/store"),
      "@api": resolve(__dirname, "src/api"),
      "@hooks": resolve(__dirname, "src/hooks"),
      "@types": resolve(__dirname, "src/types"),
      "@lib": resolve(__dirname, "src/lib"),
    },
  },
  build: {
    target: "esnext",
    minify: false,
    rollupOptions: {
      output: {
        // 移除手动chunk分割，让Vite自动处理
        // 这样可以避免多个Vant组件的bem变量在同一个文件中冲突
        manualChunks: undefined,
      },
    },
  },
});
