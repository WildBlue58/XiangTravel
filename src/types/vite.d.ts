declare module "@tailwindcss/vite" {
  import { Plugin } from "vite";
  const tailwindcss: () => Plugin;
  export default tailwindcss;
}

declare module "unplugin-vue-components/vite" {
  import { Plugin } from "vite";
  interface Options {
    resolvers?: any[];
  }
  const Components: (options?: Options) => Plugin;
  export default Components;
}

declare module "@vant/auto-import-resolver" {
  interface VantResolverOptions {
    importStyle?: boolean | "css" | "less";
  }
  const VantResolver: (options?: VantResolverOptions) => any;
  export { VantResolver };
}
