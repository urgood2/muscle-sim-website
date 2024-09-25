@echo off
:: Get the current date in MM-DD-YYYY format
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (
    set monthNum=%%a
    set day=%%b
    set year=%%c
)

:: Convert the month number to a four-letter month abbreviation
set month=
if %monthNum%==01 set month=Jan
if %monthNum%==02 set month=Feb
if %monthNum%==03 set month=Mar
if %monthNum%==04 set month=Apr
if %monthNum%==05 set month=May
if %monthNum%==06 set month=Jun
if %monthNum%==07 set month=Jul
if %monthNum%==08 set month=Aug
if %monthNum%==09 set month=Sep
if %monthNum%==10 set month=Oct
if %monthNum%==11 set month=Nov
if %monthNum%==12 set month=Dec

:: Format the file name as MMMM-DD-YYYY.md
set filename=%month%-%day%-%year%.md

:: Run the hugo command to create the new post
hugo new content/post/%filename%
