@echo off
title Selycord - Discord Reinject
cd /d "%~dp0"

echo.
echo  ================================
echo       Selycord - Discord Inject
echo  ================================
echo.

:: patcher.js dogrulama
if not exist "dist\desktop\patcher.js" (
    echo  [HATA] dist\desktop\patcher.js bulunamadi.
    echo  Once build.bat calistirin.
    echo.
    pause
    exit /b 1
)
echo  [OK] dist\desktop\patcher.js mevcut.

:: Discord'u kapat
echo.
echo  Discord kapatiliyor...
taskkill /F /IM Discord.exe >nul 2>&1
taskkill /F /IM DiscordPTB.exe >nul 2>&1
taskkill /F /IM DiscordCanary.exe >nul 2>&1
echo  [OK] Discord kapatildi.

:: app.asar kilidinin kalkmasi icin kisa bekleme (2 sn)
powershell -command "Start-Sleep -Seconds 2"

:: Once uninject - "zaten inject edilmis" hatasini onlemek icin
echo.
echo  Onceki inject temizleniyor...
"C:\Program Files\nodejs\node.exe" scripts/uninject.mjs >nul 2>&1
echo  [OK] Uninject tamamlandi.

:: Discord inject
echo.
echo  Inject ediliyor...
"C:\Program Files\nodejs\node.exe" scripts/inject.mjs
if errorlevel 1 (
    echo  [HATA] inject.mjs basarisiz.
    pause
    exit /b 1
)
echo  [OK] Inject basariyla tamamlandi.

:: Discord'u yeniden baslat (stable, PTB veya Canary - hangisi kuruluysa)
echo.
echo  Discord baslatiliyor...
set "DC_EXE="

if exist "%LOCALAPPDATA%\Discord\Update.exe" (
    set "DC_EXE=%LOCALAPPDATA%\Discord\Update.exe"
    set "DC_ARG=--processStart Discord.exe"
)
if not defined DC_EXE (
    if exist "%LOCALAPPDATA%\DiscordPTB\Update.exe" (
        set "DC_EXE=%LOCALAPPDATA%\DiscordPTB\Update.exe"
        set "DC_ARG=--processStart DiscordPTB.exe"
    )
)
if not defined DC_EXE (
    if exist "%LOCALAPPDATA%\DiscordCanary\Update.exe" (
        set "DC_EXE=%LOCALAPPDATA%\DiscordCanary\Update.exe"
        set "DC_ARG=--processStart DiscordCanary.exe"
    )
)

if defined DC_EXE (
    start "" "%DC_EXE%" %DC_ARG%
    echo  [OK] Discord baslatildi.
) else (
    echo  [UYARI] Discord kurulum yolu bulunamadi. Discord'u elle baslatiniz.
)

echo.
echo  ================================
echo   Reinject basariyla tamamlandi!
echo  ================================
echo.
pause