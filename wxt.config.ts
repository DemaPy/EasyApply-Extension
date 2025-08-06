import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { defineConfig } from "wxt";
console.log(path.resolve(__dirname, "./entrypoints"));

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    version: "1.0.0",
    name: "EasyApply",
    permissions: ['tabs', 'scripting', 'storage'],
    host_permissions: ['<all_urls>']
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
