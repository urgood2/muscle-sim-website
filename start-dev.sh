#!/bin/bash
export PATH="/opt/anaconda3/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"
PROJECT_DIR="/Users/joshuashin/Documents/GitHub/muscle-sim-website"
cd "$PROJECT_DIR"

pkill -f "hugo server" 2>/dev/null
pkill -f "admin/app.py" 2>/dev/null
sleep 1

/opt/homebrew/bin/hugo server -D &
/opt/anaconda3/bin/python "$PROJECT_DIR/admin/app.py" &

sleep 3
open http://localhost:1313
open http://localhost:5050
