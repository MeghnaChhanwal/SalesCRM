import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";

  const cspMetaTag = isDev
    ? `
      <meta http-equiv="Content-Security-Policy" content="
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval';
        style-src 'self' 'unsafe-inline';
      ">
    </head>`
    : `
      <meta http-equiv="Content-Security-Policy" content="
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval';
        style-src 'self' 'unsafe-inline';
        connect-src https://salescrmapp.onrender.com;
      ">
    </head>`;

  return {
    plugins: [
      react(),
      {
        name: "inject-csp-meta",
        transformIndexHtml(html) {
          return html.replace("</head>", cspMetaTag);
        },
      },
    ],
  };
});
