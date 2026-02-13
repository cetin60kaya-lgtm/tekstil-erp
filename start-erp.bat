@echo off
echo ERP SISTEMI BASLIYOR...

start cmd /k "cd /d C:\ERP\erp-backend && npm run start:dev"
timeout /t 5
start cmd /k "cd /d C:\ERP\erp-web && npm run dev"

echo ERP ACILDI
