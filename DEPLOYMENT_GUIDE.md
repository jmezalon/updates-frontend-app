# 🚀 Updates App - App Store & Play Store Deployment Guide

This guide will walk you through deploying your "Updates" Expo React Native app to both the Apple App Store and Google Play Store.

## 📋 **Prerequisites**

### **Required Accounts**
- ✅ **Apple Developer Account** ($99/year) - [developer.apple.com](https://developer.apple.com)
- ✅ **Google Play Console Account** ($25 one-time fee) - [play.google.com/console](https://play.google.com/console)
- ✅ **Expo Account** (free) - [expo.dev](https://expo.dev)

### **Required Tools**
```bash
# Install EAS CLI (Expo Application Services)
npm install -g @expo/eas-cli

# Login to your Expo account
eas login
```

## 🎯 **Step 1: Configure EAS Build**

Initialize EAS configuration:

```bash
cd /Users/mezalonm/updates-frontend-app
eas build:configure
```

This creates `eas.json` with build configurations for both platforms.

## 📱 **Step 2: iOS App Store Deployment**

### **2.1 Build for iOS**

```bash
# Build for iOS App Store
eas build --platform ios --profile production
```

### **2.2 Submit to App Store**

```bash
# Submit to App Store Connect
eas submit --platform ios
```

**Manual Steps in App Store Connect:**
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Create a new app with bundle ID: `com.updates.app`
3. Fill in app information:
   - **App Name**: Updates
   - **Description**: Discover church events, follow your favorite churches, and stay connected with your community.
   - **Keywords**: church, events, community, faith, worship, announcements
   - **Category**: Lifestyle or Social Networking
   - **Age Rating**: 4+ (appropriate for all ages)

4. Upload screenshots (required sizes):
   - iPhone 6.7": 1290×2796 pixels
   - iPhone 6.5": 1242×2688 pixels
   - iPhone 5.5": 1242×2208 pixels
   - iPad Pro (6th gen): 2048×2732 pixels

5. Set pricing (Free)
6. Submit for review

## 🤖 **Step 3: Google Play Store Deployment**

### **3.1 Build for Android**

```bash
# Build for Google Play Store
eas build --platform android --profile production
```

### **3.2 Submit to Play Store**

```bash
# Submit to Google Play Console
eas submit --platform android
```

**Manual Steps in Google Play Console:**
1. Go to [Google Play Console](https://play.google.com/console)
2. Create a new app with package name: `com.updates.app`
3. Fill in app information:
   - **App Name**: Updates
   - **Short Description**: Discover church events and stay connected
   - **Full Description**: 
     ```
     Discover church events, follow your favorite churches, and stay connected with your community.

     Features:
     • Browse local church events
     • Follow your favorite churches
     • Get notifications for new events
     • Like and save events to favorites
     • View church details and contact information
     • Beautiful, easy-to-use interface

     Stay connected with your faith community with Updates!
     ```
   - **Category**: Lifestyle
   - **Content Rating**: Everyone

4. Upload assets:
   - **Icon**: 512×512 pixels
   - **Feature Graphic**: 1024×500 pixels
   - **Screenshots**: At least 2, up to 8 (phone and tablet)

5. Set pricing (Free)
6. Submit for review

## 🎨 **Step 4: Create App Store Assets**

You'll need to create the following assets for both stores:

### **App Icons**
- **iOS**: 1024×1024 pixels (PNG, no transparency)
- **Android**: 512×512 pixels (PNG)

### **Screenshots** 
Take screenshots of your key screens:
1. **Home Screen** - showing event listings
2. **Event Details** - showing event information
3. **Church Details** - showing church profile
4. **Favorites** - showing saved events
5. **Profile** - showing user profile

### **Marketing Materials**
- **Feature Graphic** (Android): 1024×500 pixels
- **App Preview Video** (optional but recommended)

## ⚙️ **Step 5: Environment Configuration**

Create production environment variables:

```bash
# In your app.json or eas.json, ensure production API URL
"extra": {
  "API_BASE_URL": "https://updates-backend-api-beebc8cc747c.herokuapp.com/api"
}
```

## 🔧 **Step 6: Pre-Deployment Checklist**

### **Code Quality**
- ✅ All console.log statements removed (already done)
- ✅ Error handling implemented
- ✅ Loading states for all API calls
- ✅ Proper navigation flow
- ✅ Image URLs working correctly

### **Testing**
- ✅ Test on both iOS and Android devices
- ✅ Test all user flows (login, browse events, like events, etc.)
- ✅ Test offline behavior
- ✅ Test image loading and display
- ✅ Test navigation and back button functionality

### **Performance**
- ✅ Optimize images and assets
- ✅ Minimize bundle size
- ✅ Test app startup time
- ✅ Test smooth scrolling and transitions

## 📊 **Step 7: Analytics & Monitoring**

Consider adding analytics to track app usage:

```bash
# Optional: Add Expo Analytics
npx expo install expo-analytics-amplitude
# or
npx expo install @react-native-firebase/analytics
```

## 🚀 **Step 8: Deployment Commands**

Here are the key commands you'll run:

```bash
# 1. Configure EAS
eas build:configure

# 2. Build for both platforms
eas build --platform all --profile production

# 3. Submit to both stores
eas submit --platform ios
eas submit --platform android

# 4. Check build status
eas build:list

# 5. Check submission status
eas submit:list
```

## 📱 **Step 9: Post-Deployment**

### **Monitor Reviews**
- Respond to user reviews promptly
- Address any issues or bugs reported
- Consider user feedback for future updates

### **Updates**
When you need to update your app:

```bash
# Increment version in app.json
# iOS: Update "buildNumber"
# Android: Update "versionCode"

# Build and submit updates
eas build --platform all --profile production
eas submit --platform all
```

## 🎯 **Expected Timeline**

- **iOS App Store**: 1-7 days for review
- **Google Play Store**: 1-3 days for review
- **Build Time**: 10-20 minutes per platform

## 🆘 **Troubleshooting**

### **Common Issues**
1. **Build Failures**: Check `eas.json` configuration
2. **Submission Errors**: Verify bundle/package identifiers
3. **Review Rejections**: Follow store guidelines carefully

### **Support Resources**
- [Expo Documentation](https://docs.expo.dev)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy](https://play.google.com/about/developer-content-policy/)

## 🎉 **Success!**

Once approved, your "Updates" app will be live on both stores and users can download it to discover church events and stay connected with their community!

---

**Next Steps After Deployment:**
1. Monitor app performance and user feedback
2. Plan feature updates based on user needs
3. Consider push notifications for new events
4. Add social sharing features
5. Implement user analytics for insights
