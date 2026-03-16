@echo off
echo ============================================
echo  Secure Apportionment System v0.1.0
echo ============================================
echo.
echo Usage: drag a CSV file onto this window
echo        or type the command manually below
echo.
echo Example:
echo   ApportionmentSys.exe --seats 100 sample_basic.csv
echo.
echo Available sample files:
echo   sample_basic.csv
echo   sample_alabama_paradox.csv
echo   sample_arrow.csv
echo   sample_coalition.csv
echo   sample_runoff_round1.csv
echo   sample_runoff_round2.csv
echo.
set /p CMD=Enter command (or press Enter to exit): 
if "%CMD%"=="" exit
%CMD%
echo.
pause
