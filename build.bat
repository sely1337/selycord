@echo off
title Selycord - Build
cd /d "%~dp0"

echo.
echo  ================================
echo        Selycord - Build
echo  ================================
echo.

:: Node kontrolu
where node >nul 2>&1
if errorlevel 1 (
    echo  [HATA] Node.js bulunamadi. https://nodejs.org adresinden yukleyin.
    pause
    exit /b 1
)

:: pnpm kontrolu
where pnpm >nul 2>&1
if errorlevel 1 (
    echo  [BILGI] pnpm bulunamadi, kuruluyor...
    call npm install -g pnpm
    if errorlevel 1 (
        echo  [HATA] pnpm kurulumu basarisiz.
        pause
        exit /b 1
    )
)

:: Bagimliliklari yukle
if not exist "node_modules" (
    echo  [1/3] Bagimliliklar yukleniyor...
    call pnpm install
    if errorlevel 1 (
        echo  [HATA] pnpm install basarisiz.
        pause
        exit /b 1
    )
    echo  [1/3] Bagimliliklar yuklendi.
) else (
    echo  [1/3] Bagimliliklar zaten mevcut.
)

:: Ana build - Vencord standalone paket (src/Vencord.ts + tum pluginler)
echo.
echo  [2/3] Ana Selycord paketi derleniyor (standalone)...
call pnpm run buildStandalone
if errorlevel 1 (
    echo  [HATA] buildStandalone basarisiz.
    pause
    exit /b 1
)
echo  [2/3] Standalone paket tamamlandi.

:: Desktop build - Electron main/preload/renderer
echo.
echo  [3/3] Desktop (Electron) derleniyor...
call pnpm run buildDesktop
if errorlevel 1 (
    echo  [HATA] buildDesktop basarisiz.
    pause
    exit /b 1
)
echo  [3/3] Desktop derleme tamamlandi.

echo.
echo  ================================
echo   Build basarili!
echo   Cikti: dist\
echo  ================================
echo.

:: patcher.js dogrulama
if not exist "dist\desktop\patcher.js" (
    echo  [HATA] dist\desktop\patcher.js olusturulamadi. Inject atlanadi.
    pause
    exit /b 1
)

:: Discord inject
echo  Discord'a inject ediliyor...
node scripts/inject.mjs
if errorlevel 1 (
    echo  [HATA] inject.mjs basarisiz.
    pause
    exit /b 1
)

echo.
echo  ============================================
echo   Build + Inject basariyla tamamlandi!
echo.
echo   Discord'u tamamen kapatip yeniden baslatiniz.
echo  ============================================
echo.

:: Cikti klasorunu ac
if exist "dist" explorer dist

pause