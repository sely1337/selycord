@echo off
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -Command ^
"$dp = Join-Path $env:LOCALAPPDATA 'Discord'; ^
$la = Get-ChildItem $dp -Filter 'app-*' | Sort-Object Name -Descending | Select-Object -First 1; ^
$out = @(); ^
if ($la) { ^
    $id = Join-Path $la.FullName 'resources\app'; ^
    $out += 'Discord version: ' + $la.Name; ^
    $out += 'InjectDir: ' + $id; ^
    $out += 'Dir exists: ' + (Test-Path $id); ^
    $ix = Join-Path $id 'index.js'; ^
    $pk = Join-Path $id 'package.json'; ^
    $out += 'index.js exists: ' + (Test-Path $ix); ^
    $out += 'package.json exists: ' + (Test-Path $pk); ^
    if (Test-Path $ix) { $out += ''; $out += '=== index.js ==='; $out += Get-Content $ix } ^
} else { $out += 'Discord not found' }; ^
$out | Out-File -FilePath '%~dp0debug_result.txt' -Encoding utf8"
echo Tamamlandi. debug_result.txt okunuyor...
type "%~dp0debug_result.txt"
pause