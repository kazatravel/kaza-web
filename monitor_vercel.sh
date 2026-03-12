#!/bin/bash
REPO="kazatravel/kaza-web"
BRANCH="master"

echo "Monitoring Vercel deployment for $REPO on branch $BRANCH..."
sleep 5

for i in {1..30}; do
  STATUS=$(curl -s "https://api.github.com/repos/$REPO/commits/$BRANCH/statuses" | jq -r '[.[] | select(.context=="Vercel – kaza-web-1") | .state][0]')
  
  if [ "$STATUS" == "pending" ]; then
    echo "[$i/30] Build is pending..."
    sleep 10
  elif [ "$STATUS" == "success" ]; then
    echo "✅ Build succeeded!"
    exit 0
  elif [ "$STATUS" == "failure" ] || [ "$STATUS" == "error" ]; then
    echo "❌ Build failed!"
    exit 1
  else
    echo "Unknown status: $STATUS"
    sleep 10
  fi
done
exit 1
