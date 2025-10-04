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
      let totalReplacements = 0;
      // 遍历所有生成的chunk
      Object.keys(bundle).forEach((fileName) => {
        const chunk = bundle[fileName];
        if (chunk.type === "chunk" && chunk.code) {
          let replacements = 0;
          // 策略：将所有 const [name, bem] 声明改为 var [name, bem]
          // var 允许重复声明，不会报错
          chunk.code = chunk.code.replace(
            /const\s+\[(\w+),\s*bem\]\s*=\s*createNamespace/g,
            (match: string) => {
              replacements++;
              totalReplacements++;
              // 将 const 改为 var
              return match.replace(/^const\s+/, "var ");
            }
          );
          if (replacements > 0) {
            console.log(
              `✓ Fixed ${replacements} bem declarations in ${fileName}`
            );
          }
        }
      });
      console.log(`✓ Total bem declarations fixed: ${totalReplacements}`);
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
