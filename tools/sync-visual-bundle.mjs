/**
 * Synchronize the visual-only sources into the shipped DSH module wrapper.
 * The original complete build requires an unpublished monorepo preset.
 * This intentionally updates only Aqua CSS and the DOM seam stamper; it
 * preserves the existing runtime, settings API repairs and bundled fonts.
 *
 * Node >= 22.13. Usage: node tools/sync-visual-bundle.mjs [--check]
 */
import { readFile, writeFile } from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'
import assert from 'node:assert/strict'

const root = new URL('../', import.meta.url)
const bundlePath = new URL('lib/client.js', root)
const original = await readFile(bundlePath, 'utf8')
const css = await readFile(new URL('src/client/aqua.module.css', root), 'utf8')
const seam = await readFile(new URL('src/client/seam-stamper.ts', root), 'utf8')
const cssPattern = /const css\$1 = "(?:[^"\\]|\\.)*";\r?\n(?=\t\tconst tagId\$1 = "dsh-client-ui-aqua\/aqua\.module\.css";)/
assert.equal([...original.matchAll(new RegExp(cssPattern, 'g'))].length, 1,
  'Expected exactly one Aqua CSS block in the DSH bundle')
let next = original.replace(cssPattern, () => 'const css$1 = ' + JSON.stringify(css) + ';\n')

const marker = '\t\t//#region src/client/seam-stamper.ts'
const begin = next.indexOf(marker)
assert.ok(begin >= 0, 'Missing seam-stamper region')
const end = next.indexOf('\t\t//#endregion', begin)
assert.ok(end > begin, 'Missing seam-stamper region end')
const js = stripTypeScriptTypes(seam, { mode: 'transform' })
  .replace(/^export /gm, '').trim()
const region = marker + '\n' + js.split(/\r?\n/)
  .map(line => line.trimEnd() ? '\t\t' + line.trimEnd() : '').join('\n') + '\n'
next = next.slice(0, begin) + region + next.slice(end)

if (process.argv.includes('--check')) {
  assert.equal(next, original, 'Visual bundle is stale; run npm run sync:visual')
  console.log('Visual sources and lib/client.js are synchronized.')
} else {
  await writeFile(bundlePath, next, 'utf8')
  console.log('Updated Aqua CSS and seam stamper in lib/client.js.')
}
