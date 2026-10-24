import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
test("multiple report routes share one real renderer, including simultaneous first requests", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "woodhouse-renderer-"));
  try {
    const out = await build({
      stdin: {
        contents: `import {ensureReportRenderer} from './src/data/report-renderer.ts';import {Resvg} from '@resvg/resvg-wasm';await Promise.all([ensureReportRenderer(),ensureReportRenderer(),ensureReportRenderer()]);await ensureReportRenderer();const renderer=new Resvg('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#080d19"/></svg>');const image=renderer.render();const png=image.asPng();console.log(JSON.stringify({signature:[...png.slice(0,8)],width:image.width,height:image.height}));image.free();renderer.free();`,
        resolveDir: process.cwd(),
        sourcefile: "report-renderer-check.mjs",
        loader: "js"
      },
      bundle: true,
      platform: "node",
      format: "esm",
      target: "node22",
      loader: { ".wasm": "binary" },
      write: false
    });
    const script = path.join(dir, "check.mjs");
    await writeFile(script, out.outputFiles[0].contents);
    const result = JSON.parse(execFileSync(process.execPath, [script], { encoding: "utf8" }));
    assert.deepEqual(result, {
      signature: [137, 80, 78, 71, 13, 10, 26, 10],
      width: 1200,
      height: 630
    });
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
