#!/bin/bash

# Firebase Vite App - Complete Automation Script
# This script automates: install → git → commit → build → run

echo "🚀 Firebase Vite App - Complete Automation"
echo "==========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check Node.js
echo "📦 Step 1/11: Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node --version) detected${NC}"
echo ""

# Step 2: Install dependencies
echo "📦 Step 2/11: Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 3: Create .env file
echo "🔧 Step 3/11: Setting up environment variables..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env file${NC}"
    echo -e "${YELLOW}⚠️  IMPORTANT: Edit .env with your Firebase credentials!${NC}"
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi
echo ""

# Step 4: Initialize Git
echo "📝 Step 4/11: Initializing Git repository..."
if [ ! -d .git ]; then
    git init
    echo -e "${GREEN}✅ Git repository initialized${NC}"
else
    echo -e "${GREEN}✅ Git repository already exists${NC}"
fi
echo ""

# Step 5: Add files to Git
echo "📝 Step 5/11: Adding files to Git..."
git add .
echo -e "${GREEN}✅ Files staged for commit${NC}"
echo ""

# Step 6: Commit files
echo "📝 Step 6/11: Committing files..."
git commit -m "Initial Firebase Vite app: Manual login, CRUD, Reports, Full automation"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Files committed successfully${NC}"
else
    echo -e "${YELLOW}⚠️  No changes to commit or already committed${NC}"
fi
echo ""

# Step 7: Set main branch
echo "📝 Step 7/11: Setting main branch..."
git branch -M main
echo -e "${GREEN}✅ Main branch configured${NC}"
echo ""

# Step 8: Remote origin instructions
echo "📝 Step 8/11: Git remote setup..."
echo -e "${YELLOW}⚠️  To push to GitHub, run these commands:${NC}"
echo ""
echo "  git remote add origin <YOUR_GITHUB_REPO_URL>"
echo "  git push -u origin main"
echo ""
echo "Example:"
echo "  git remote add origin https://github.com/yourusername/firebase-vite-app.git"
echo "  git push -u origin main"
echo ""

# Step 9: TypeScript check
echo "🔍 Step 9/11: TypeScript type checking..."
npx tsc --noEmit
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ TypeScript check passed${NC}"
else
    echo -e "${YELLOW}⚠️  TypeScript warnings detected (non-blocking)${NC}"
fi
echo ""

# Step 10: Build project
echo "🔨 Step 10/11: Building production bundle..."
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Production build successful${NC}"
    echo -e "${GREEN}   Build output: dist/${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
echo ""

# Step 11: Start dev server
echo "🚀 Step 11/11: Ready to start development server..."
echo ""
echo "==========================================="
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo "==========================================="
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. ${YELLOW}Update Firebase Config:${NC}"
echo "   - Edit .env file"
echo "   - Add your Firebase credentials"
echo ""
echo "2. ${YELLOW}Create Test User:${NC}"
echo "   - Go to Firebase Console > Authentication"
echo "   - Add user: test@example.com / Test@123"
echo ""
echo "3. ${YELLOW}Start Development:${NC}"
echo "   - Run: npm run dev"
echo "   - Open: http://localhost:3000"
echo ""
echo "4. ${YELLOW}Deploy (Optional):${NC}"
echo "   - Install: npm install -g firebase-tools"
echo "   - Login: firebase login"
echo "   - Init: firebase init"
echo "   - Deploy: firebase deploy"
echo ""
echo "==========================================="
echo ""

# Ask to start dev server
read -p "Start development server now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Starting development server..."
    echo "   URL: http://localhost:3000"
    echo "   Press Ctrl+C to stop"
    echo ""
    npm run dev
fi
