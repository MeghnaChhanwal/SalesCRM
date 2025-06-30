import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const connectSrc = env.VITE_CSP_CONNECT_SRC || "*"; // allow all origins

  return {
    plugins: [
      react(),

      {
        name: "inject-csp-meta",
        transformIndexHtml(html) {
          return html.replace(
            "</head>",
            `
  <meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    connect-src ${connectSrc};
  ">
</head>`
          );
        },
      },
    ],
  };
});
