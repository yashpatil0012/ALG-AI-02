# Startup script for DocIntel AI
Write-Host "=========================================" -ForegroundColor Red
Write-Host "  DocIntel AI — Algothon'26 Hackathon MVP" -ForegroundColor White
Write-Host "=========================================" -ForegroundColor Red

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "[1/2] Starting FastAPI Backend on http://localhost:8000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit -Command Set-Location '$ScriptDir\backend'; & '.\venv\Scripts\python.exe' run.py"

Write-Host "[2/2] Starting Next.js Frontend on http://localhost:3000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit -Command Set-Location '$ScriptDir\frontend'; npm run dev"

Write-Host ""
Write-Host "✓ Both services launched! Open http://localhost:3000 in your browser." -ForegroundColor Yellow
