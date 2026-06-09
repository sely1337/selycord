@echo off
:: Wrapper .bat pour lancer Selycord-install.ps1 facilement (double-clic)
title Selycord — Installation
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Selycord-install.ps1"
if %errorlevel% neq 0 pause
