@echo off
color 0A
echo ========================================
echo   EMOTION DETECTION - FINAL TEST
echo ========================================
echo.
echo [INFO] Da sua loi TensorFlow backend!
echo [INFO] Chuan bi kiem tra lai...
echo.
timeout /t 2 /nobreak >nul

echo [STEP 1] Kiem tra file da sua...
echo.
if exist "js\app.js" (
    echo [OK] js\app.js - Co san
) else (
    echo [ERROR] js\app.js - Khong tim thay!
    goto error
)

if exist "diagnostic.html" (
    echo [OK] diagnostic.html - Co san
) else (
    echo [ERROR] diagnostic.html - Khong tim thay!
    goto error
)

if exist "index.html" (
    echo [OK] index.html - Co san
) else (
    echo [ERROR] index.html - Khong tim thay!
    goto error
)

echo.
echo [STEP 2] Mo diagnostic.html de test...
echo.
timeout /t 2 /nobreak >nul

start "" "diagnostic.html"

echo [OK] Da mo diagnostic.html
echo.
echo ========================================
echo   HUONG DAN KIEM TRA:
echo ========================================
echo.
echo 1. Trong trinh duyet, click nut:
echo    "Chay Kiem Tra Day Du"
echo.
echo 2. Doi 3-5 giay...
echo.
echo 3. Kiem tra ket qua:
echo    - Tiny Face Detector: [✅ Da tai]
echo    - Face Expression:    [✅ Da tai]
echo.
echo 4. Neu TAT CA deu OK:
echo    [✅] Chay OPEN_APP.bat hoac START_SERVER.bat
echo.
echo 5. Neu van loi:
echo    [❌] Xem Console (F12) va doc TROUBLESHOOTING.md
echo.
echo ========================================
echo.
echo Ban co muon mo ung dung chinh khong?
echo.
choice /C YN /M "Nhan Y de mo app, N de thoat"

if errorlevel 2 goto end
if errorlevel 1 goto openapp

:openapp
echo.
echo [INFO] Dang mo ung dung chinh...
start "" "index.html"
echo [OK] Da mo! Kiem tra trinh duyet!
echo.
goto end

:error
echo.
echo [ERROR] Thieu file! Vui long kiem tra lai!
echo.
pause
exit /b 1

:end
echo.
echo [INFO] Hoan thanh!
echo.
echo Docs tham khao:
echo - FIXED_AND_READY.md (Huong dan chi tiet)
echo - BUGFIX_TENSORFLOW.md (Giai thich loi)
echo - TROUBLESHOOTING.md (Khac phuc su co)
echo.
pause
