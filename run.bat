@echo off
cd /d "%~dp0"
echo ============================================
echo  Secure Apportionment System v0.1.0
echo ============================================
echo.
echo Example commands:
echo.
echo   ApportionmentSys.exe --seats 100 sample_basic.csv
echo   ApportionmentSys.exe --seats 25 sample_alabama_paradox.csv
echo   ApportionmentSys.exe --seats 26 sample_alabama_paradox.csv
echo   ApportionmentSys.exe --seats 60 sample_strategic_voting.csv
echo   ApportionmentSys.exe --seats 598 sample_coalition.csv
echo.
set /p CMD=Enter command (or press Enter to exit): 
if "%CMD%"=="" goto end
%CMD%
echo.
:end
pause
