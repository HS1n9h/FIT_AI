# FitAI - AI-Powered Fitness App MVP

A cross-platform fitness app with AI workout generation and real-time pose detection for form feedback.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Expo CLI: `npm install -g @expo/cli eas-cli`
- Apple Developer Account ($99/year) for iOS builds
- Xcode (for iOS development)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Then fill in your credentials:
   - Supabase URL and Anon Key (from [Supabase Dashboard](https://supabase.com))
   - OpenAI API Key (for Vercel functions)

3. **Setup Supabase:**
   - Create a new project on [Supabase](https://supabase.com)
   - Run the SQL schema from `/docs/database-schema.sql`
   - Copy your project URL and anon key to `.env`

4. **Setup Apple Developer Account:**
   - Go to [Apple Developer](https://developer.apple.com)
   - Enroll in Apple Developer Program ($99/year)
   - Wait for approval (1-2 days)

### Development

1. **Start development server:**
   ```bash
   npx expo start --dev-client
   ```

2. **Create development build (first time only):**
   ```bash
   # Register your iPhone
   eas device:create
   
   # Build for iOS
   eas build --profile development --platform ios
   
   # Install on your iPhone via TestFlight or direct install
   ```

3. **Daily development (after initial build):**
   - Run `npx expo start --dev-client`
   - Scan QR code from your iPhone
   - Hot reload works for all JS/TS changes!
   - Only rebuild when adding native modules

### Project Structure

```
app/                    # Expo Router screens
├── (auth)/            # Auth flow (login, signup)
├── (onboarding)/      # Onboarding screens
├── (tabs)/            # Main tab navigation
├── exercise/          # Exercise details
└── pose-check/        # Pose detection camera

src/
├── components/        # Reusable components
├── stores/           # Zustand state management
├── services/         # API clients (Supabase, etc.)
├── hooks/            # Custom React hooks
├── utils/            # Helper functions
├── constants/        # Constants and exercise data
└── types/            # TypeScript types

api/                   # Vercel serverless functions
└── workout/          # Workout generation API
```

## 📱 Features (MVP)

- ✅ User authentication (Supabase Auth)
- ✅ AI workout generation (GPT-4o-mini)
- ✅ Workout player with flexible rep entry
- ✅ Real-time pose detection (VisionCamera + MediaPipe)
- ✅ Form checking for 10 exercises
- ✅ Nutrition logging with AI analysis
- ✅ Dashboard with streaks
- ✅ Apple Health sync
- ✅ Offline support
- ✅ Dark mode

## 🛠 Tech Stack

- **Framework:** React Native with Expo SDK 54
- **Build:** Expo Development Build (NOT Expo Go)
- **Routing:** Expo Router (file-based)
- **State:** Zustand with MMKV persistence
- **Backend:** Supabase (PostgreSQL + Auth)
- **AI:** OpenAI GPT-4o-mini via Vercel Edge Functions
- **Camera:** react-native-vision-camera v4
- **Pose Detection:** QuickPose SDK (free tier) or custom MediaPipe
- **Styling:** NativeWind (Tailwind for React Native)
- **Animations:** React Native Reanimated 3

## 📝 Environment Variables

Create a `.env` file with the following:

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# API
EXPO_PUBLIC_API_URL=https://your-vercel-app.vercel.app/api

# OpenAI (Vercel functions only)
OPENAI_API_KEY=sk-your-key
```

## 🧪 Testing

### On iPhone (Development Build)
1. Create development build (once): `eas build --profile development --platform ios`
2. Install on iPhone
3. Run dev server: `npx expo start --dev-client`
4. Scan QR code and app updates instantly!

### Testing Checklist
- [ ] User can sign up and login
- [ ] Onboarding flow completes
- [ ] AI generates workout in <3 seconds
- [ ] Workout player shows exercise with GIF
- [ ] User can log reps (any number!)
- [ ] Pose detection works at 30+ FPS
- [ ] Form feedback appears in real-time
- [ ] Workout saves to Supabase
- [ ] Dashboard shows streak
- [ ] App works offline

## 📦 Deployment

### EAS Build Profiles

- **development**: Development build for testing
- **preview**: Internal testing build
- **production**: Production build for App Store

```bash
# Development build
eas build --profile development --platform ios

# Production build (when ready)
eas build --profile production --platform ios
```

## 💡 Tips

- **Hot reload works!** You only rebuild when changing native code/permissions
- **Test on real iPhone** - Pose detection needs real device, simulator won't work well
- **Monitor costs** - Check Supabase and OpenAI usage dashboards
- **Keep it simple** - Resist feature creep during MVP phase

## 🐛 Troubleshooting

### Build fails
- Check Apple Developer account is active
- Ensure all environment variables are set
- Try `eas build --clear-cache`

### Camera not working
- Check iOS permissions in Info.plist
- Verify camera permissions requested at runtime
- Ensure using development build (not Expo Go)

### Supabase errors
- Verify RLS policies are enabled
- Check environment variables
- Test queries in Supabase SQL editor

## 📚 Resources

- [Expo Development Builds](https://docs.expo.dev/develop/development-builds/introduction)
- [VisionCamera Docs](https://react-native-vision-camera.com/docs/guides)
- [Supabase Docs](https://supabase.com/docs)
- [OpenAI API](https://platform.openai.com/docs)

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

This is an MVP project. Contributions welcome after initial launch!

---

**Built with ❤️ following the FitAI MVP Battle-Tested Plan v2.0**
