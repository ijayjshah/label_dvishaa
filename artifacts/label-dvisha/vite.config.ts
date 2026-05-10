import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const replitPlugins =
  process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined
    ? [
        (
          await import("@replit/vite-plugin-cartographer")
        ).cartographer({
          root: path.resolve(import.meta.dirname, ".."),
        }),
        (await import("@replit/vite-plugin-dev-banner")).devBanner(),
      ]
    : [];

const repoRoot = path.resolve(import.meta.dirname, "../..");

export default defineConfig(({ command, mode }) => {
  const needsRuntimeEnv = command === "serve";
  const fileEnv = loadEnv(mode, repoRoot, "");

  const rawPort =
    fileEnv.FRONTEND_PORT ??
    fileEnv.PORT ??
    process.env.FRONTEND_PORT ??
    process.env.PORT;
  if (needsRuntimeEnv && !rawPort) {
    throw new Error(
      "FRONTEND_PORT or PORT environment variable is required but was not provided (set in repo-root .env or the environment).",
    );
  }

  const port = rawPort ? Number(rawPort) : 5173;
  if (needsRuntimeEnv && (Number.isNaN(port) || port <= 0)) {
    throw new Error(`Invalid FRONTEND_PORT/PORT value: "${rawPort}"`);
  }

  const basePath = fileEnv.BASE_PATH ?? process.env.BASE_PATH;
  if (needsRuntimeEnv && !basePath) {
    throw new Error(
      "BASE_PATH environment variable is required but was not provided (set in repo-root .env or the environment).",
    );
  }

  const base = basePath ?? "/";

  const apiTarget =
    fileEnv.API_SERVER_URL ??
    process.env.API_SERVER_URL ??
    `http://127.0.0.1:${fileEnv.API_PORT ?? process.env.API_PORT ?? "3001"}`;

  return {
    envDir: repoRoot,
    base,
    plugins: [
      react(),
      tailwindcss(),
      runtimeErrorOverlay(),
      ...replitPlugins,
    ],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
        "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
      },
      dedupe: ["react", "react-dom"],
    },
    root: path.resolve(import.meta.dirname),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
    },
    server: {
      port,
      strictPort: false,
      host: "0.0.0.0",
      allowedHosts: true,
      fs: {
        strict: true,
      },
      proxy: needsRuntimeEnv
        ? {
            "/api": {
              target: apiTarget,
              changeOrigin: true,
            },
          }
        : undefined,
    },
    preview: {
      port,
      host: "0.0.0.0",
      allowedHosts: true,
    },
  };
});
