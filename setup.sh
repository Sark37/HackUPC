#!/bin/bash

echo "-----------------------------------------"
echo "Setting up dependencies for your React app"
echo "-----------------------------------------"

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "Error: Node.js is not installed."
    echo "Please follow the instructions in the README to install Node.js."
    exit 1
fi
echo "Node.js is installed."

# Check if npm is installed
if ! command -v npm &> /dev/null
then
    echo "Error: npm is not installed."
    echo "npm comes bundled with Node.js. Please ensure Node.js is installed correctly."
    exit 1
fi
echo "npm is installed."

echo ""
echo "Navigating to the application folder..."
cd hackupc-app

if [ $? -ne 0 ]; then
    echo "Error: Could not navigate to the 'hackupc-app' folder."
    exit 1
fi

echo "Installing project dependencies using npm..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "Dependencies installed successfully!"
    echo "You can now navigate back to the root and run the application using 'npm start' or 'yarn start' from within the 'hackupc-app' folder."
else
    echo ""
    echo "Error: Failed to install dependencies."
    echo "Please check the output above for more information."
    exit 1
fi

echo "-----------------------------------------"
echo "Setup complete!"
echo ""
echo "To run the app locally use"
echo "npm start"
echo "-----------------------------------------"
