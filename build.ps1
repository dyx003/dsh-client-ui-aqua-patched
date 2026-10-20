# Synchronize this patch's CSS and DOM seams into the existing DSH bundle.
# This is a visual-only build, not a replacement for the original monorepo
# build of all TypeScript sources. Node >= 22.13 is required.
param([switch]$Check)

$ErrorActionPreference = 'Stop'
Push-Location $PSScriptRoot
try {
    if ($Check) {
        node tools/sync-visual-bundle.mjs --check
    } else {
        node tools/sync-visual-bundle.mjs
    }
    if ($LASTEXITCODE -ne 0) { throw 'Visual bundle synchronization failed.' }
    node --check lib/client.js
    if ($LASTEXITCODE -ne 0) { throw 'Bundled client syntax check failed.' }
} finally {
    Pop-Location
}
