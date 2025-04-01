#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}===== JobMate Full Stack Startup Script =====${NC}"

# Check that we're in the root directory by verifying subdirectories exist
if [ ! -d "jobmate_backend" ] || [ ! -d "jobmate-ui" ]; then
    echo -e "${RED}Error: Expected directories 'jobmate_backend' and 'jobmate-ui' not found.${NC}"
    echo -e "${RED}Please run this script from the JOBMATE root directory.${NC}"
    exit 1
fi

# Function to handle backend startup
start_backend() {
    echo -e "${GREEN}===== Starting JobMate Backend =====${NC}"

    # Navigate to backend directory
    cd jobmate_backend

    # Check if virtual environment exists, create it if it doesn't
    if [ ! -d "../venv" ]; then
        echo -e "${YELLOW}Creating virtual environment...${NC}"
        python3 -m venv ../venv
        echo -e "${GREEN}Virtual environment created!${NC}"
    fi

    # Activate virtual environment
    echo -e "${YELLOW}Activating virtual environment...${NC}"
    source ../venv/bin/activate
    echo -e "${GREEN}Virtual environment activated!${NC}"

    # Install dependencies if requirements.txt exists
    if [ -f "../requirements.txt" ]; then
        echo -e "${YELLOW}Installing backend dependencies...${NC}"
        pip install -r ../requirements.txt
        echo -e "${GREEN}Backend dependencies installed!${NC}"
    else
        echo -e "${RED}Warning: requirements.txt not found. Skipping dependency installation.${NC}"
    fi

    # Ask user which database to use
    echo -e "${YELLOW}Which database would you like to use?${NC}"
    echo -e "1) SQLite (default, lightweight)"
    echo -e "2) PostgreSQL (needs PostgreSQL server running)"
    read -p "Choose option [1/2] (default: 1): " db_choice
    
    # Set environment variable based on choice
    if [ "$db_choice" = "2" ]; then
        echo -e "${YELLOW}Using PostgreSQL database...${NC}"
        # No need to set pg environment variable - using PostgreSQL by default
    else
        echo -e "${YELLOW}Using SQLite database...${NC}"
        export pg=1
    fi

    # Make and apply migrations
    echo -e "${YELLOW}Creating migrations...${NC}"
    python manage.py makemigrations
    echo -e "${GREEN}Migrations created!${NC}"

    echo -e "${YELLOW}Creating resumes app migrations...${NC}"
    python manage.py makemigrations resumes
    echo -e "${GREEN}Resumes app migrations created!${NC}"

    echo -e "${YELLOW}Applying migrations...${NC}"
    python manage.py migrate
    echo -e "${GREEN}Migrations applied!${NC}"

    # Run the server in background
    echo -e "${YELLOW}Starting Django server...${NC}"
    echo -e "${GREEN}Backend is running at: ${YELLOW}http://127.0.0.1:8000/${NC}"
    python manage.py runserver &
    BACKEND_PID=$!
    echo -e "${GREEN}Backend started with PID: ${BACKEND_PID}${NC}"
    echo $BACKEND_PID > ../.backend_pid
    
    # Return to root directory
    cd ..
}

# Function to handle frontend startup
start_frontend() {
    echo -e "${GREEN}===== Starting JobMate Frontend =====${NC}"
    
    # Change to frontend directory
    cd jobmate-ui
    
    # Check if this is a Vite project
    IS_VITE=false
    if [ -f "vite.config.js" ] || [ -f "vite.config.ts" ]; then
        IS_VITE=true
    fi
    
    # Install dependencies if needed
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    npm install
    echo -e "${GREEN}Frontend dependencies installed!${NC}"
    
    # Determine the correct command and port
    if [ "$IS_VITE" = true ]; then
        NPM_COMMAND="dev"
        FRONTEND_PORT="5173"
    else
        NPM_COMMAND="start"
        FRONTEND_PORT="3000"
    fi
    
    # Start the frontend
    echo -e "${YELLOW}Starting React development server...${NC}"
    echo -e "${GREEN}Frontend will be available at: ${YELLOW}http://localhost:${FRONTEND_PORT}/${NC}"
    npm run $NPM_COMMAND &
    FRONTEND_PID=$!
    echo -e "${GREEN}Frontend started with PID: ${FRONTEND_PID}${NC}"
    cd ..
    echo $FRONTEND_PID > .frontend_pid
    
    # Store the port for later use
    echo $FRONTEND_PORT > .frontend_port
}

# Function to clean up on exit
cleanup() {
    echo -e "\n${YELLOW}Cleaning up...${NC}"
    
    # Kill backend if running
    if [ -f .backend_pid ]; then
        BACKEND_PID=$(cat .backend_pid)
        echo -e "${YELLOW}Stopping backend (PID: ${BACKEND_PID})...${NC}"
        kill $BACKEND_PID 2>/dev/null
        rm .backend_pid
    fi
    
    # Kill frontend if running
    if [ -f .frontend_pid ]; then
        FRONTEND_PID=$(cat .frontend_pid)
        echo -e "${YELLOW}Stopping frontend (PID: ${FRONTEND_PID})...${NC}"
        kill $FRONTEND_PID 2>/dev/null
        rm .frontend_pid
    fi
    
    # Clean up port file
    if [ -f .frontend_port ]; then
        rm .frontend_port
    fi
    
    # Deactivate virtual environment if active
    if [ -n "$VIRTUAL_ENV" ]; then
        deactivate
    fi
    
    echo -e "${GREEN}All processes stopped. Thanks for using JobMate!${NC}"
    exit 0
}

# Set up trap to call cleanup when script is terminated
trap cleanup INT TERM

# Start backend and frontend
start_backend
start_frontend

# Display helpful information
echo -e "\n${BLUE}===== JobMate is now running! =====${NC}"
echo -e "Backend API: ${YELLOW}http://127.0.0.1:8000/${NC}"

# Use the stored frontend port
if [ -f .frontend_port ]; then
    FRONTEND_PORT=$(cat .frontend_port)
    echo -e "Frontend UI: ${YELLOW}http://localhost:${FRONTEND_PORT}/${NC}"
else
    echo -e "Frontend UI: ${YELLOW}http://localhost:5173/ or http://localhost:3000/${NC}"
fi

echo -e "${RED}Press Ctrl+C to stop both servers${NC}"

# Keep script running until user presses Ctrl+C
while true; do
    sleep 1
done