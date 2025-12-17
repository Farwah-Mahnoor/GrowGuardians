# Start GrowGuardians Backend with Python 3.10
Write-Host "Starting GrowGuardians Backend with Python 3.10..." -ForegroundColor Green
Set-Location $PSScriptRoot
.\venv310\Scripts\Activate.ps1
Write-Host "Virtual environment activated!" -ForegroundColor Green
Write-Host "Python version:" -ForegroundColor Cyan
python --version
Write-Host "`nStarting Flask server..." -ForegroundColor Green
python app.py
