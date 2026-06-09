$dp = Join-Path $env:LOCALAPPDATA "Discord"
if (-not (Test-Path $dp)) { Write-Host "Discord klasoru bulunamadi: $dp"; exit }

$la = Get-ChildItem $dp -Filter "app-*" | Sort-Object Name -Descending | Select-Object -First 1
if (-not $la) { Write-Host "app-* klasoru bulunamadi icinde: $dp"; exit }

$id = Join-Path $la.FullName "resources\app"
Write-Host "Discord versiyonu : $($la.Name)"
Write-Host "Inject klasoru    : $id"
Write-Host "Klasor mevcut     : $(Test-Path $id)"

$ix = Join-Path $id "index.js"
$pk = Join-Path $id "package.json"
Write-Host "index.js mevcut   : $(Test-Path $ix)"
Write-Host "package.json mevcut: $(Test-Path $pk)"

if (Test-Path $ix) {
    Write-Host ""
    Write-Host "=== index.js icerigi ==="
    Get-Content $ix
}

if (Test-Path $pk) {
    Write-Host ""
    Write-Host "=== package.json icerigi ==="
    Get-Content $pk
}