#!/bin/bash

# GitHub Pages Deployment Setup Script
# This script helps verify your setup before pushing to GitHub

echo "🚀 GitHub Pages Deployment Setup"
echo "================================="

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository. Please run 'git init' first."
    exit 1
fi

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found."
    exit 1
fi

# Check if the workflow file exists
if [ ! -f ".github/workflows/deploy.yml" ]; then
    echo "❌ Error: GitHub Actions workflow file not found."
    exit 1
fi

echo "✅ Repository structure looks good"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Test build
echo "🔨 Testing build process..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📁 Built files are in ./dist directory"
    ls -la dist/
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

echo ""
echo "🎉 Setup verification complete!"
echo ""
echo "Next steps:"
echo "1. Commit and push your changes:"
echo "   git add ."
echo "   git commit -m \"Add GitHub Pages deployment\""
echo "   git push origin main"
echo ""
echo "2. Enable GitHub Pages in your repository settings:"
echo "   - Go to Settings > Pages"
echo "   - Select 'GitHub Actions' as source"
echo ""
echo "3. Your site will be available at:"
echo "   https://gehuybre.github.io/datanarrative-hub/"
echo ""
echo "🔍 Monitor deployment progress in the Actions tab of your repository."
