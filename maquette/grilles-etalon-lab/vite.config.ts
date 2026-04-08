import fs from "node:fs";
import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, type Connect, type Plugin } from "vite";

/** Dossier PNG ministériels (hors racine Vite — le glob `import.meta.glob` ne les voit pas). */
const maquetteImgDir = path.resolve(__dirname, "../img");

function serveMaquetteImg(): Plugin {
  const middleware: Connect.NextHandleFunction = (req, res, next) => {
    const raw = req.url?.split("?")[0] ?? "";
    if (!raw.startsWith("/maquette-img/")) {
      next();
      return;
    }

    const decoded = decodeURIComponent(raw.slice("/maquette-img/".length));
    const name = path.basename(decoded);
    if (!name.endsWith(".png") || name !== decoded) {
      next();
      return;
    }

    const rootResolved = path.resolve(maquetteImgDir);
    const file = path.resolve(rootResolved, name);
    const rel = path.relative(rootResolved, file);
    if (!rel || rel.startsWith("..") || path.isAbsolute(rel)) {
      next();
      return;
    }

    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
      res.statusCode = 404;
      res.end();
      return;
    }

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=3600");
    const stream = fs.createReadStream(file);
    stream.on("error", () => {
      if (!res.headersSent) res.statusCode = 500;
      res.end();
    });
    stream.pipe(res);
  };

  return {
    name: "serve-maquette-img",
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

/** Lab : réutilise les composants grilles du dépôt (`components/tae/grilles/`). */
export default defineConfig({
  plugins: [react(), serveMaquetteImg()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../.."),
    },
  },
  server: {
    fs: {
      allow: [path.resolve(__dirname, "../..")],
    },
  },
});
