@echo off
title bkmrX Baslatici
color 0A

echo ========================================================
echo        bkmrX - Local X (Twitter) Bookmark Organizer
echo ========================================================
echo.

:: Node.js kontrolu
node -v >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [HATA] Node.js bilgisayarinizda yuklu degil!
    echo Lutfen acilan sayfadan Node.js (LTS versiyonu) indirip kurun.
    echo Kurulum bittikten sonra bu pencereyi kapatip tekrar acin.
    pause
    start https://nodejs.org/
    exit /b
)

echo [1/4] Gerekli paketler kontrol ediliyor/yukleniyor...
echo (Ilk acilista bu islem internet hiziniza bagli olarak 1-3 dakika surebilir)
call npm install better-sqlite3@latest --no-fund --no-audit >nul 2>&1
call npm install --no-fund --no-audit >nul 2>&1

echo.
echo [2/4] Veritabani ayarlaniyor...
call npm run db:push >nul 2>&1

echo.
echo [3/4] Tarayici hazirlaniyor...
:: Arka planda 5 saniye bekleyip tarayiciyi acacak kucuk bir islem baslatiyoruz
start /B cmd /c "timeout /t 5 /nobreak >nul & start http://localhost:3000"

echo.
echo [4/4] bkmrX baslatiliyor! Lutfen bekleyin...
echo.
echo ========================================================
echo LUTFEN BU SIYAH PENCEREYI UYGULAMAYI KULLANIRKEN KAPATMAYIN.
echo Isiniz bitince pencereyi (X) isaretinden kapatabilirsiniz.
echo ========================================================
echo.

call npm run dev
