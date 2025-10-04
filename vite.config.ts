import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import tailwindcss from "@tailwindcss/vite";
import Components from "unplugin-vue-components/vite";
import { VantResolver } from "@vant/auto-import-resolver";

// Rollup插件：修复Vant bem变量冲突
function fixVantBemConflict() {
  return {
    name: "fix-vant-bem-conflict",
    generateBundle(_options: any, bundle: any) {
      // 遍历所有生成的chunk
      Object.keys(bundle).forEach((fileName) => {
        const chunk = bundle[fileName];
        if (chunk.type === "chunk" && chunk.code) {
          let counter = 0;
          // 使用正则表达式查找并替换重复的bem声明
          // 将 const [name, bem] 替换为 const [name_N, bem_N]
          chunk.code = chunk.code.replace(
            /const\s+\[(\w+),\s*bem\]\s*=\s*createNamespace/g,
            (match: string, nameVar: string) => {
              counter++;
              if (counter === 1) {
                return match; // 保留第一个不变
              }
              return `const [${nameVar}_${counter}, bem_${counter}] = createNamespace`;
            }
          );

          // 同时替换对应的bem使用
          let bemCounter = 1;
          chunk.code = chunk.code.replace(/\bbem\(/g, () => {
            bemCounter++;
            if (bemCounter === 2) return "bem(";
            return `bem_${bemCounter - 1}(`;
          });
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
        manualChunks: undefined,
      },
      plugins: [fixVantBemConflict() as any],
    },
  },
});
