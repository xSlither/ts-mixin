@echo off

echo "Copying files in ./dist to ./build..."
xcopy /s /y /i "%~dp0\dist" "%~dp0\build"

echo "Copying package.json..."
COPY /Y "%~dp0\package.json" "%~dp0\build\package.json"

echo "Copying .npmignore..."
COPY /Y "%~dp0\.npmignore" "%~dp0\build\.npmignore"

echo "Copying LICENSE..."
COPY /Y "%~dp0\..\LICENSE" "%~dp0\build\LICENSE"

echo "Copying README..."
COPY /Y "%~dp0\..\README.md" "%~dp0\build\README.md"

echo "Package in BUILD directory is ready!"