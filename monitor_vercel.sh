#!/bin/bash
REPO="kazatravel/kaza-web"
BRANCH="master"

echo "Monitoring Vercel deployments for $REPO on branch $BRANCH..."
echo "Tracking both kaza-web and kaza-web-1 projects..."
echo ""

# Get latest commit
LATEST_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "$BRANCH")
echo "Latest commit: $LATEST_COMMIT"
echo ""

sleep 3

for i in {1..30}; do
  # Fetch both project statuses
  STATUS_JSON=$(curl -s "https://api.github.com/repos/$REPO/commits/$LATEST_COMMIT/statuses")
  
  STATUS_WEB=$(echo "$STATUS_JSON" | jq -r '[.[] | select(.context=="Vercel – kaza-web") | .state][0]')
  STATUS_WEB1=$(echo "$STATUS_JSON" | jq -r '[.[] | select(.context=="Vercel – kaza-web-1") | .state][0]')
  
  URL_WEB=$(echo "$STATUS_JSON" | jq -r '[.[] | select(.context=="Vercel – kaza-web") | .target_url][0]')
  URL_WEB1=$(echo "$STATUS_JSON" | jq -r '[.[] | select(.context=="Vercel – kaza-web-1") | .target_url][0]')
  
  echo "[$i/30] Status check:"
  echo "  kaza-web:   $STATUS_WEB"
  echo "  kaza-web-1: $STATUS_WEB1"
  
  # Check if both are done (success or failure)
  if [[ "$STATUS_WEB" != "pending" && "$STATUS_WEB" != "null" ]] && \
     [[ "$STATUS_WEB1" != "pending" && "$STATUS_WEB1" != "null" ]]; then
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "FINAL RESULTS:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if [ "$STATUS_WEB" == "success" ]; then
      echo "✅ kaza-web:   SUCCESS"
      echo "   $URL_WEB"
    else
      echo "❌ kaza-web:   FAILED"
      echo "   $URL_WEB"
    fi
    
    if [ "$STATUS_WEB1" == "success" ]; then
      echo "✅ kaza-web-1: SUCCESS"
      echo "   $URL_WEB1"
    else
      echo "❌ kaza-web-1: FAILED"
      echo "   $URL_WEB1"
    fi
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Exit with success only if BOTH projects succeed
    if [ "$STATUS_WEB" == "success" ] && [ "$STATUS_WEB1" == "success" ]; then
      exit 0
    else
      exit 1
    fi
  fi
  
  sleep 10
done

echo ""
echo "⏱️  Timeout reached after 5 minutes. Final status:"
echo "  kaza-web:   $STATUS_WEB"
echo "  kaza-web-1: $STATUS_WEB1"
exit 1
