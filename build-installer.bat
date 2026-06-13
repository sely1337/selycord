
@echo off
echo ============================================
echo   Selycord Installer Build Script
echo ============================================
echo.

REM Go to installer folder
cd installer-src
echo Installer folder: %cd%
echo.

REM Clean old files
echo Cleaning old build files...
if exist ..\release\installer (
    rmdir /s /q ..\release\installer
    echo Cleaned!
)
echo.

REM Install dependencies
echo Installing dependencies...
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo ERROR: Dependencies failed to install!
    pause
    exit /b 1
)
echo.

REM Build installer
echo Building installer...
call npm run dist
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)
echo.

REM Open output folder
echo Build complete! Opening output folder...
explorer ..\release\installer
echo.

REM Git operations
echo ============================================
echo   Git Update
echo ============================================
echo.
cd ..
set /p commitMsg="Enter commit message (or leave empty): "
if "%commitMsg%"=="" set commitMsg="Update installer"

echo Adding changes...
git add installer-src\package.json
git add -u
git commit -m "%commitMsg%"
if %errorlevel% neq 0 (
    echo Commit failed (maybe no changes?)
) else (
    echo.
    set /p pushNow="Push to GitHub? (Y/N): "
    if /i "%pushNow%"=="Y" (
        git push
        if %errorlevel% neq 0 (
            echo Push failed!
        ) else (
            echo Success! Installer updated!
        )
    )
)

echo.
echo ============================================
echo   Done!
echo ============================================
pause
