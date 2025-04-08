# JobMate Full Stack Startup Script for PowerShell

# Function for colored output
function Write-ColorOutput {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [Parameter(Mandatory=$true)]
        [string]$Color
    )
    $originalColor = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $Color
    Write-Output $Message
    $host.UI.RawUI.ForegroundColor = $originalColor
}

Write-ColorOutput "===== JobMate Full Stack Startup Script =====" "Cyan"

# Check that we're in the root directory by verifying subdirectories exist
if (-not ((Test-Path -Path "jobmate_backend" -PathType Container) -and (Test-Path -Path "jobmate-ui" -PathType Container))) {
    Write-ColorOutput "Error: Expected directories 'jobmate_backend' and 'jobmate-ui' not found." "Red"
    Write-ColorOutput "Please run this script from the JOBMATE root directory." "Red"
    exit 1
}

# Create an ArrayList to store processes
$global:processes = New-Object System.Collections.ArrayList

# Function to handle backend startup
function Start-Backend {
    Write-ColorOutput "===== Starting JobMate Backend =====" "Green"

    # Navigate to backend directory
    Push-Location -Path "jobmate_backend"

    # Check if virtual environment exists, create it if it doesn't
    if (-not (Test-Path -Path "..\venv" -PathType Container)) {
        Write-ColorOutput "Creating virtual environment..." "Yellow"
        python3.11 -m venv ..\venv
        Write-ColorOutput "Virtual environment created!" "Green"
    }

    # Activate virtual environment
    Write-ColorOutput "Activating virtual environment..." "Yellow"
    & ..\venv\Scripts\Activate.ps1
    Write-ColorOutput "Virtual environment activated!" "Green"

    # Install dependencies if requirements.txt exists
    if (Test-Path -Path "..\requirements.txt" -PathType Leaf) {
        Write-ColorOutput "Installing backend dependencies..." "Yellow"
        pip install -r ..\requirements.txt
        Write-ColorOutput "Backend dependencies installed!" "Green"
    } else {
        Write-ColorOutput "Warning: requirements.txt not found. Skipping dependency installation." "Red"
    }

    # Ask user which database to use
    Write-ColorOutput "Which database would you like to use?" "Yellow"
    Write-ColorOutput "1) SQLite (default, lightweight)" "White"
    Write-ColorOutput "2) PostgreSQL (needs PostgreSQL server running)" "White"
    $dbChoice = Read-Host "Choose option [1/2] (default: 1)"
    
    # Set environment variable based on choice
    if ($dbChoice -eq "2") {
        Write-ColorOutput "Using PostgreSQL database..." "Yellow"
        # No need to set pg environment variable - using PostgreSQL by default
        $env:pg = $null
    } else {
        Write-ColorOutput "Using SQLite database..." "Yellow"
        $env:pg = "1"
    }

    # Make and apply migrations
    Write-ColorOutput "Creating migrations..." "Yellow"
    python manage.py makemigrations
    Write-ColorOutput "Migrations created!" "Green"

    Write-ColorOutput "Creating resumes app migrations..." "Yellow"
    python manage.py makemigrations resumes
    Write-ColorOutput "Resumes app migrations created!" "Green"

    Write-ColorOutput "Applying migrations..." "Yellow"
    python manage.py migrate
    Write-ColorOutput "Migrations applied!" "Green"

    # Run the server
    Write-ColorOutput "Starting Django server..." "Yellow"
    Write-ColorOutput "Backend is running at: http://127.0.0.1:8000/" "Green"
    
    # Start the Django server in a new process
    $backendProcess = Start-Process -FilePath "python" -ArgumentList "manage.py", "runserver" -PassThru -NoNewWindow
    [void]$global:processes.Add($backendProcess)
    Write-ColorOutput "Backend started with PID: $($backendProcess.Id)" "Green"
    
    # Return to original directory
    Pop-Location
}

# Function to handle frontend startup
function Start-Frontend {
    Write-ColorOutput "===== Starting JobMate Frontend =====" "Green"
    
    # Change to frontend directory
    Push-Location -Path "jobmate-ui"
    
    # Check for package.json to determine if this is a Vite or standard React project
    $packageJsonPath = Join-Path -Path (Get-Location) -ChildPath "package.json"
    $viteConfigPath = Join-Path -Path (Get-Location) -ChildPath "vite.config.js"
    $isVite = Test-Path -Path $viteConfigPath
    
    # Install dependencies if needed
    Write-ColorOutput "Installing frontend dependencies..." "Yellow"
    npm install
    Write-ColorOutput "Frontend dependencies installed!" "Green"
    
    # Determine the correct command and port
    $npmCommand = if ($isVite) { "dev" } else { "start" }
    $frontendPort = if ($isVite) { "5173" } else { "3000" }
    
    # Start the frontend
    Write-ColorOutput "Starting React development server..." "Yellow"
    Write-ColorOutput "Frontend will be available at: http://localhost:$frontendPort/" "Green"
    
    # Start the React server in a new process
    $frontendProcess = Start-Process -FilePath "npm" -ArgumentList "run", $npmCommand -PassThru -NoNewWindow
    [void]$global:processes.Add($frontendProcess)
    Write-ColorOutput "Frontend started with PID: $($frontendProcess.Id)" "Green"
    
    # Return to original directory
    Pop-Location
}

# Function to clean up on exit
function Cleanup {
    Write-ColorOutput "Cleaning up..." "Yellow"
    
    foreach ($process in $global:processes) {
        if ($process -ne $null -and -not $process.HasExited) {
            Write-ColorOutput "Stopping process with PID: $($process.Id)..." "Yellow"
            try {
                Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
            } catch {
                Write-ColorOutput "Could not stop process with PID: $($process.Id)" "Red"
            }
        }
    }
    
    # Deactivate virtual environment if active
    if ($env:VIRTUAL_ENV -ne $null) {
        deactivate
    }
    
    Write-ColorOutput "All processes stopped. Thanks for using JobMate!" "Green"
}

# Set up cleanup on script exit
try {
    # Start backend and frontend
    Start-Backend
    Start-Frontend

    # Display helpful information
    Write-ColorOutput "`n===== JobMate is now running! =====" "Cyan"
    Write-ColorOutput "Backend API: http://127.0.0.1:8000/" "Yellow"
    
    # Check for Vite configuration to determine the port
    if (Test-Path -Path "jobmate-ui\vite.config.js") {
        Write-ColorOutput "Frontend UI: http://localhost:5173/" "Yellow"
    } else {
        Write-ColorOutput "Frontend UI: http://localhost:3000/" "Yellow"
    }
    
    Write-ColorOutput "Press Ctrl+C to stop both servers" "Red"

    # Keep script running until user presses Ctrl+C
    while ($true) {
        Start-Sleep -Seconds 1
    }
}
catch {
    Write-ColorOutput "An error occurred: $_" "Red"
}
finally {
    # Clean up when the script is interrupted
    Cleanup
}