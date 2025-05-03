@echo off
echo -----------------------------------------
echo Setting up dependencies for your React app
echo -----------------------------------------

REM Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed.
    echo Please follow the instructions in the README to install Node.js.
    exit /b 1
)
echo Node.js is installed.

REM Check if npm is installed
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: npm is not installed.
    echo npm comes bundled with Node.js. Please ensure Node.js is installed correctly.
    exit /b 1
)
echo npm is installed.

echo.
echo Navigating to the application folder...
cd hackupc-app
if %errorlevel% neq 0 (
    echo Error: Could not navigate to the 'hackupc-app' folder.
    exit /b 1
)

echo Installing project dependencies using npm...
npm install
if %errorlevel% neq 0 (
    echo.
    echo Error: Failed to install dependencies.
    echo Please check the output above for more information.
    exit /b 1
)

echo.
echo -----------------------------------------
echo Dependencies installed successfully!
echo.
echo To run the app locally use
echo npm start
echo -----------------------------------------

exit /b 0