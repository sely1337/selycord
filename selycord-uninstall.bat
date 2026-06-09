@echo off
:: Wrapper .bat pour lancer Selycord-uninstall.ps1 facilement (double-clic)
title Selycord — Désinstallation
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Selycord-uninstall.ps1"
if %errorlevel% neq 0 pause
