#!/bin/bash
curl -v -X POST http://localhost:3002/api/trip \
  -H "Content-Type: application/json" \
  -d '{
    "budget": 5000,
    "tripLength": 10,
    "interests": ["culture", "food"],
    "activityLevel": "medium",
    "mustHaves": "Safe, good public transport"
  }'
