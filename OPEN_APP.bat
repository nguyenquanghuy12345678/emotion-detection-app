@echo off
echo ========================================
echo   QUICK START - Open in Browser
echo ========================================
echo.
echo Opening emotion-detection-app in your default browser...
echo.
echo NOTE: If you see CORS errors in the console (F12),
echo please use START_SERVER.bat instead.
echo.

start "" "index.html"

echo.
echo App opened! Check your browser.
echo.
echo Troubleshooting:
echo - Allow camera permissions when prompted
echo - Check F12 Console for any errors
echo - If models won't load, check internet connection
echo.
pause
