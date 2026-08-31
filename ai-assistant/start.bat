@echo off
echo ========================================
echo    Local AI Assistant - Startup Script
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed or not in PATH.
    echo Please install Python from https://python.org
    pause
    exit /b 1
)

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt
echo.

REM Start the server
echo Starting AI Assistant server...
echo Open your browser and go to: http://127.0.0.1:8000
echo Press Ctrl+C to stop the server.
echo.
python app.py

pause
