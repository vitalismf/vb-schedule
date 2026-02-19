#!/bin/bash
# Regenerate schedule-data.js from schedule-data.json
# Use this after manual edits to the JSON file

cd "$(dirname "$0")"
echo "const SCHEDULE_DATA = $(cat schedule-data.json);" > schedule-data.js
echo "✓ Generated schedule-data.js from schedule-data.json"
