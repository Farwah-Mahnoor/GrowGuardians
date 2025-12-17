@echo off
echo Starting GrowGuardians Backend with Python 3.10...
cd /d "%~dp0"
call venv310\Scripts\activate.bat
python app.py
