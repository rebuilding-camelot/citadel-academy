#!/bin/bash

# Script to commit and push changes to GitHub

# Add all changes
git add .

# Commit with a descriptive message
git commit -m "Fix: Enhance relay connection stability and client initialization

- Fixed client initialization in Redux store
- Enhanced relay connection stability with improved error handling
- Implemented proper parameter handling in nostrMainInit function
- Added exponential backoff for relay reconnection attempts
- Improved error handling in event publishing
- Updated documentation with implemented NIPs
- Added JSDoc comments for better code readability"

# Push to the main branch (or replace 'main' with your branch name)
git push origin main

echo "Changes committed and pushed to GitHub!"