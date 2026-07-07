# AnythingLLM Windows Local Installation Guide

This package provides a fully automated PowerShell script to install and deploy [AnythingLLM](https://github.com/Procurement9/anything-llm) locally on a Windows machine.

## What This Script Does

1. **Checks Prerequisites**: Ensures Git, Node.js, and Yarn are installed.
2. **Clones Repository**: Clones your specific fork (`Procurement9/anything-llm`) to `C:\AnythingLLM`.
3. **Configures Environment**: Copies all `.env.example` files and generates secure random JWT and signature keys.
4. **Installs Dependencies**: Runs `yarn install` for the server, collector, and frontend.
5. **Sets up Database**: Initializes the local SQLite database via Prisma.
6. **Builds UI**: Compiles the React frontend and moves it to the server's public directory to serve as a unified desktop application experience in the browser.
7. **Creates Launchers**: Generates a `Start-AnythingLLM.bat` script and places a convenient shortcut directly on your Desktop.

## Prerequisites

Before running the script, ensure you have the following installed on your Windows machine:
- [Git for Windows](https://git-scm.com/download/win)
- [Node.js (v18 or higher)](https://nodejs.org/en/download/)

## Installation Instructions

1. Download the `Install-AnythingLLM.ps1` script to your Windows machine.
2. Open the Start Menu, type `PowerShell`, right-click **Windows PowerShell**, and select **Run as Administrator**.
3. Navigate to the folder where you downloaded the script. For example:
   ```powershell
   cd C:\Users\YourName\Downloads
   ```
4. Run the script:
   ```powershell
   .\Install-AnythingLLM.ps1
   ```
   *(Note: If you receive an execution policy error, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first, then run the script again).*
5. Wait for the installation to complete. It will take a few minutes to download dependencies and build the frontend.

## How to Run AnythingLLM

Once installation is complete:
1. Go to your Desktop.
2. Double-click the new **AnythingLLM** shortcut.
3. A command prompt window will open to start the background services (Server and Collector).
4. After 10 seconds, your default web browser will automatically open to `http://localhost:3001`.
5. You can now configure your LLM providers, vector databases, and workspaces through the UI.

To stop the application, simply close the command prompt window that opened when you launched the shortcut.
