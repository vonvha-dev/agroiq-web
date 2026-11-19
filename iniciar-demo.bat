@echo off
rem Plan B offline de la feria (D12): construye y sirve AgroIQ en http://localhost:4173 sin internet.
rem Requiere Node.js y haber ejecutado "npm ci" una vez (con internet) en esta carpeta.
cd /d "%~dp0"
if not exist node_modules (
  echo Falta node_modules. Ejecuta "npm ci" una vez con internet antes de la feria.
  pause
  exit /b 1
)
echo Iniciando AgroIQ en http://localhost:4173 ... (cierra esta ventana para detenerlo)
call npm run demo:local -- --open
pause
