import esbuild from "esbuild";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const dist = path.join(root, "dist");
fs.mkdirSync(dist, { recursive: true });

// Copy static assets
fs.copyFileSync(path.join(root, "public", "manifest.json"), path.join(dist, "manifest.json"));
fs.copyFileSync(path.join(root, "public", "popup.html"), path.join(dist, "popup.html"));
fs.copyFileSync(path.join(root, "public", "sidepanel.html"), path.join(dist, "sidepanel.html"));

await esbuild.build({
  entryPoints: {
    background: path.join(root, "src", "background.ts"),
    content: path.join(root, "src", "content.ts"),
    popup: path.join(root, "src", "ui", "popup.ts"),
    sidepanel: path.join(root, "src", "ui", "sidepanel.ts")
  },
  bundle: true,
  format: "esm",
  platform: "browser",
  target: ["chrome120"],
  outdir: dist,
  sourcemap: true
});
