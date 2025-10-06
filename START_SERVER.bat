@echo off
echo ========================================
echo   AI EMOTION DETECTION - START SERVER
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Node.js detected
    echo Starting server with npx http-server...
    echo.
    echo Server will run at: http://localhost:8080
    echo Press Ctrl+C to stop
    echo.
    npx http-server -p 8080 -o
    goto :end
)

REM Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Python detected
    echo Starting server with Python...
    echo.
    echo Server will run at: http://localhost:8080
    echo Press Ctrl+C to stop
    echo.
    start http://localhost:8080
    python -m http.server 8080
    goto :end
)

REM Check if PHP is installed
where php >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] PHP detected
    echo Starting server with PHP...
    echo.
    echo Server will run at: http://localhost:8080
    echo Press Ctrl+C to stop
    echo.
    start http://localhost:8080
    php -S localhost:8080
    goto :end
)

echo [ERROR] No suitable server found!
echo.
echo Please install one of the following:
echo   - Node.js (recommended): https://nodejs.org/
echo   - Python: https://www.python.org/
echo   - PHP: https://www.php.net/
echo.
echo Or open index.html directly in Chrome/Edge browser
echo (Note: Some features may not work without a server)
echo.
pause

:end
