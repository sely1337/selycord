
@echo off
chcp 65001 &gt;nul
echo ============================================
echo   Selycord Installer Build Scripti
echo ============================================
echo.

REM Klasöre git
cd installer-src
echo Installer klasörüne gidildi: %cd%
echo.

REM Eski dosyaları temizle
echo Eski build dosyaları temizleniyor...
if exist ..\release\installer (
    rmdir /s /q ..\release\installer
    echo Temizlendi!
)
echo.

REM Bağımlılıkları yükle
echo Bağımlılıklar yükleniyor...
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo Hata: Bağımlılıklar yüklenemedi!
    pause
    exit /b 1
)
echo.

REM Installer'ı build et
echo Installer build ediliyor...
call npm run dist
if %errorlevel% neq 0 (
    echo Hata: Build başarısız!
    pause
    exit /b 1
)
echo.

REM Build klasörünü aç
echo Build tamamlandı! Çıktı klasörü açılıyor...
explorer ..\release\installer
echo.

REM Git işlemleri (opsiyonel)
echo ============================================
echo   Git ile güncelleme
echo ============================================
echo.
cd ..
set /p commitMsg="Commit mesajı gir (boş bırakabilirsin): "
if "%commitMsg%"=="" set commitMsg="Update installer"

echo Değişiklikler ekleniyor...
git add installer-src\package.json
git add -u
git commit -m "%commitMsg%"
if %errorlevel% neq 0 (
    echo Commit başarısız! (Zaten hiç değişiklik yok olabilir)
) else (
    echo.
    set /p pushNow="GitHub'a pushlansın mı? (E/H): "
    if /i "%pushNow%"=="E" (
        git push
        if %errorlevel% neq 0 (
            echo Push başarısız!
        ) else (
            echo Başarılı! Installer güncellendi!
        )
    )
)

echo.
echo ============================================
echo   İşlem tamamlandı!
echo ============================================
pause
