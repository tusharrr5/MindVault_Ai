#!/bin/bash
# Start backend in background, capture output, then test
cd /Users/tusharbhojwani/Downloads/Screenshot/mindvault-ai/backend
npx tsx src/index.ts > /tmp/backend_output.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
sleep 3

# Run the test
node test_insight2.js 2>&1

# Show backend logs
echo "--- Backend output ---"
cat /tmp/backend_output.log

kill $BACKEND_PID 2>/dev/null
