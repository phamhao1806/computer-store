#!/bin/bash
echo "Starting NexTech Computer Store..."
echo ""

cd "$(dirname "$0")/server"
echo "Starting backend on port 5001..."
node src/index.js &
SERVER_PID=$!

cd "$(dirname "$0")/client"
echo "Starting frontend on port 5173..."
npx vite --host
CLIENT_PID=$!

trap "kill $SERVER_PID $CLIENT_PID 2>/dev/null" EXIT
wait
