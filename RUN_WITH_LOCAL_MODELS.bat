@echo off
color 0A
echo ========================================
echo   MODELS LOCAL - BAT BUOC DUNG SERVER!
echo ========================================
echo.
echo [QUAN TRONG] Models da duoc tai ve local!
echo [QUAN TRONG] PHAI chay voi HTTP Server!
echo.
echo Dang tim server...
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Tim thay Node.js
    echo [INFO] Dang khoi dong server voi npx http-server...
    echo.
    echo ============================================
    echo   Server: http://localhost:8080
    echo   Nhan Ctrl+C de dung
    echo ============================================
    echo.
    timeout /t 2 /nobreak >nul
    start http://localhost:8080
    npx http-server -p 8080
    goto end
)

REM Check Python
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Tim thay Python
    echo [INFO] Dang khoi dong server voi Python...
    echo.
    echo ============================================
    echo   Server: http://localhost:8080
    echo   Nhan Ctrl+C de dung
    echo ============================================
    echo.
    timeout /t 2 /nobreak >nul
    start http://localhost:8080
    python -m http.server 8080
    goto end
)

REM Check PHP
where php >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Tim thay PHP
    echo [INFO] Dang khoi dong server voi PHP...
    echo.
    echo ============================================
    echo   Server: http://localhost:8080
    echo   Nhan Ctrl+C de dung
    echo ============================================
    echo.
    timeout /t 2 /nobreak >nul
    start http://localhost:8080
    php -S localhost:8080
    goto end
)

echo [ERROR] Khong tim thay server nao!
echo.
echo Vui long cai dat:
echo   - Node.js (khuyen nghi): https://nodejs.org/
echo   - Python: https://www.python.org/
echo   - PHP: https://www.php.net/
echo.
echo LUU Y: Khong the mo file HTML truc tiep!
echo        Models local can server de tranh loi CORS!
echo.
pause
goto end

:end
