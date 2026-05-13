@echo off
:: Kill anything on 5174 then start dev server
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5174.*LISTENING') do (
  echo Killing PID %%a on port 5174...
  taskkill //PID %%a //F >nul 2>&1
)
npm run dev
