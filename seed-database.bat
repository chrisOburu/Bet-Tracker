@echo off
echo Seeding BetTracker Database with Dummy Data...

cd backend

echo Activating virtual environment...
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
) else (
    echo Virtual environment not found. Please run start-backend.bat first to set it up.
    pause
    exit /b 1
)

echo Running seed script...
python seed_db.py

echo.
echo Seeding completed! You can now start the application to see the dummy data.
pause
