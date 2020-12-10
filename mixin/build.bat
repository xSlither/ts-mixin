
@echo off

echo "Copying Index Declarations File..."
COPY /Y "%~dp0\src\index.d.ts" "%~dp0\dist\index.d.ts"

echo "Compiling Project..."
powershell -ExecutionPolicy Bypass -File %TSC_DIR%

echo "Build Complete!"