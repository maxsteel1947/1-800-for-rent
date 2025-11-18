# start-dev.ps1 — starts server and client in separate PowerShell windows
# Usage: Right-click -> Run with PowerShell, or from PowerShell: .\start-dev.ps1

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
$server = Join-Path $root 'server'
$client = Join-Path $root 'client'

Write-Host "Starting backend in a new PowerShell window..."
Start-Process -FilePath powershell -ArgumentList "-NoExit","-Command","cd '$server'; npm install; npm run seed; npm start"

Start-Sleep -Milliseconds 500
Write-Host "Starting frontend in a new PowerShell window..."
Start-Process -FilePath powershell -ArgumentList "-NoExit","-Command","cd '$client'; npm install; npm run dev"

Write-Host "Launched server and client. Check the new windows for logs."
