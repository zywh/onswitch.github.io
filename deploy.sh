#!/bin/bash

# Firebase Deployment Script for OnSwitch
echo "🚀 Starting Firebase deployment..."

# Build Jekyll site
echo "📦 Building Jekyll site..."
bundle exec jekyll build --destination public

# Deploy to Firebase
echo "🔥 Deploying to Firebase..."
firebase deploy

echo "✅ Deployment complete!"
echo "🌐 Your site is live at: https://onswitch-55a54.web.app"