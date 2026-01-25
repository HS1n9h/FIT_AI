# FitAI Setup Guide

This guide will walk you through setting up the FitAI app from scratch.

## Prerequisites

Before you begin, ensure you have:

- **macOS** (for iOS development)
- **Node.js 18+** installed
- **Xcode** (latest version from Mac App Store)
- **Apple Developer Account** ($99/year) - [Sign up here](https://developer.apple.com/programs/)
- **Supabase Account** (free) - [Sign up here](https://supabase.com)
- **OpenAI API Key** ($5 credit to start) - [Get key here](https://platform.openai.com/api-keys)
- **Vercel Account** (free) - [Sign up here](https://vercel.com)

## Step 1: Install Dependencies

```bash
# Install Expo CLI globally
npm install -g @expo/cli eas-cli

# Install project dependencies
cd /path/to/PProject
npm install
```

## Step 2: Setup Supabase

### 2.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New project"
3. Fill in project details:
   - Name: `fitai-mvp`
   - Database Password: (save this!)
   - Region: Choose closest to you
4. Click "Create new project" (takes ~2 minutes)

### 2.2 Run Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy entire contents of `docs/database-schema.sql`
4. Paste and click "Run"
5. You should see "Database schema created successfully!"

### 2.3 Get Supabase Credentials

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** (looks like `https://xxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

## Step 3: Setup Environment Variables

```bash
# Copy example env file
cp .env.example .env

# Edit .env file
nano .env
```

Fill in your credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPO_PUBLIC_API_URL=https://your-vercel-app.vercel.app/api
OPENAI_API_KEY=sk-proj-...
```

## Step 4: Setup Apple Developer Account

### 4.1 Enroll in Program

1. Go to [developer.apple.com](https://developer.apple.com/programs/)
2. Click "Enroll"
3. Follow steps (requires Apple ID and $99/year payment)
4. Wait for approval (usually 1-2 days, sometimes instant)

### 4.2 Enable Developer Mode on iPhone

**For iOS 16+:**

1. Connect iPhone to Mac via USB
2. Trust computer on iPhone
3. Install development build (see Step 6)
4. Tap app icon → Settings prompt appears
5. Go to **Settings** → **Privacy & Security** → **Developer Mode**
6. Enable toggle
7. Restart iPhone
8. Enter passcode when prompted

## Step 5: Setup EAS (Expo Application Services)

```bash
# Login to Expo
eas login

# Configure EAS
eas build:configure

# Register your iPhone for development
eas device:create
# Choose "Website" option
# Open URL on iPhone and install profile
```

## Step 6: Create Development Build

```bash
# Build for iOS (takes 10-15 minutes first time)
eas build --profile development --platform ios

# Wait for build to complete...
# You'll get a link to download .ipa file or use TestFlight
```

### Install on iPhone:

**Option A: Direct Install (Recommended)**
1. Download .ipa from EAS dashboard on your iPhone
2. Follow installation prompts

**Option B: TestFlight**
1. Install TestFlight app from App Store
2. Open TestFlight link from EAS
3. Install FitAI

## Step 7: Start Development Server

```bash
# Start Expo dev server
npx expo start --dev-client

# You should see a QR code
# Scan it with your iPhone camera
# App will open and connect!
```

## Step 8: Deploy Backend to Vercel

### 8.1 Install Vercel CLI

```bash
npm install -g vercel
```

### 8.2 Deploy

```bash
# Login to Vercel
vercel login

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard:
# SUPABASE_URL
# SUPABASE_SERVICE_KEY (from Supabase Settings > API > service_role key)
# OPENAI_API_KEY
```

### 8.3 Update .env

```bash
# Update EXPO_PUBLIC_API_URL in .env with your Vercel URL
EXPO_PUBLIC_API_URL=https://your-app.vercel.app/api
```

## Step 9: Test the App

### 9.1 Sign Up

1. Open app on iPhone
2. Tap "Sign Up"
3. Enter name, email, password
4. Complete onboarding:
   - Select fitness level
   - Choose goals
   - Set available time

### 9.2 Test Features

- ✅ Dashboard shows (no workouts yet)
- ✅ Generate workout (requires Vercel + OpenAI setup)
- ✅ Profile shows your info
- ✅ Sign out and sign in again

## Step 10: Verify Supabase Data

1. Go to Supabase Dashboard
2. Click **Table Editor**
3. Check tables:
   - `profiles` → Your profile should be there
   - `exercises` → Should have 10 seeded exercises
   - `user_streaks` → Should create after first workout

## Troubleshooting

### Build Fails

**Error: No Apple Developer account**
- Solution: Enroll in Apple Developer Program (Step 4)

**Error: Device not registered**
- Solution: Run `eas device:create` again

### App Won't Connect

**QR Code not working**
- Ensure iPhone and Mac are on same WiFi
- Try typing the URL manually in dev client

**App crashes on launch**
- Check environment variables in `.env`
- Rebuild: `eas build --profile development --platform ios --clear-cache`

### API Errors

**"Failed to generate workout"**
- Check Vercel deployment logs
- Verify OPENAI_API_KEY is set in Vercel
- Check OpenAI API key has credits

**"Unauthorized" errors**
- Check Supabase RLS policies
- Verify SUPABASE_SERVICE_KEY in Vercel (not anon key!)

### Database Issues

**Can't sign up**
- Check `profiles` table exists
- Verify RLS policies allow INSERT

**Workouts not saving**
- Check `workout_plans` and `workout_sessions` tables
- Verify RLS policies

## Daily Development Workflow

After initial setup, your daily workflow is simple:

```bash
# 1. Start dev server
npx expo start --dev-client

# 2. Scan QR on iPhone

# 3. Make code changes
# Hot reload works automatically! ✨

# 4. Only rebuild if you:
# - Add native dependencies
# - Change app.json permissions
# - Update Expo SDK
```

## Cost Tracking

Monitor your costs:

- **Supabase**: [dashboard.supabase.com](https://dashboard.supabase.com) → Settings → Usage
- **OpenAI**: [platform.openai.com/usage](https://platform.openai.com/usage)
- **Vercel**: [vercel.com/dashboard](https://vercel.com/dashboard) → Usage

**Expected costs for MVP:**
- Supabase: $0 (free tier: 500MB, 50K requests)
- OpenAI: ~$5/month (100 users × 3 workouts/week)
- Vercel: $0 (free tier: 100GB bandwidth)
- Apple Developer: $99/year (one-time annual)

## Next Steps

You now have a fully functional MVP! 

**What works:**
- ✅ User authentication
- ✅ Onboarding flow
- ✅ Dashboard with stats
- ✅ AI workout generation
- ✅ Profile management

**Still to build:**
- 📱 Workout player (in progress)
- 📸 Pose detection
- 🍎 Nutrition logging
- ✨ UI polish & animations

Continue development with:
```bash
# See remaining TODOs
npm run todo

# Make changes and test on iPhone
# Hot reload works! No rebuilding needed!
```

## Getting Help

- **Expo Issues**: [docs.expo.dev](https://docs.expo.dev)
- **Supabase Issues**: [supabase.com/docs](https://supabase.com/docs)
- **OpenAI Issues**: [platform.openai.com/docs](https://platform.openai.com/docs)

---

**🎉 You're all set! Happy coding!**
