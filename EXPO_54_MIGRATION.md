# Expo 54 Migration Guide for WealthWise

## Overview
This guide will help you migrate WealthWise from Expo 53 to Expo 54. Note that Expo 54 is very recent and some third-party packages may not be fully compatible yet.

## Step 1: Update Core Expo Dependencies

First, update your `package.json` with the latest Expo 54 compatible versions:

```json
{
  "dependencies": {
    "expo": "~54.0.0",
    "react": "19.1.0",
    "react-native": "0.76.0",
    
    // Core Expo packages
    "expo-constants": "~18.0.0",
    "expo-device": "~8.0.0",
    "expo-font": "^14.0.0",
    "expo-status-bar": "~2.3.0",
    "expo-splash-screen": "~31.0.0",
    
    // Navigation (latest versions)
    "@react-navigation/native": "^7.1.0",
    "@react-navigation/stack": "^7.3.0",
    "@react-navigation/bottom-tabs": "^7.3.0",
    "@react-navigation/native-stack": "^7.3.0",
    
    // React Native core packages
    "react-native-screens": "~4.3.0",
    "react-native-safe-area-context": "5.0.0",
    "react-native-gesture-handler": "~2.18.0",
    "react-native-reanimated": "~3.16.0",
    
    // SVG and Graphics
    "react-native-svg": "^15.8.0",
    
    // Other packages (keep current versions for now)
    "@clerk/clerk-expo": "^2.15.0",
    "react-native-chart-kit": "^6.12.0",
    "react-native-modal": "^14.0.0-rc.1"
  }
}
```

## Step 2: Update app.json

Update your `app.json` to include new Expo 54 features:

```json
{
  "expo": {
    "name": "WealthWise",
    "slug": "wealthwise",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "scheme": "wealthwise",
    "platforms": ["ios", "android"],
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.wealthwise.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.wealthwise.app"
    },
    "web": {
      "favicon": "./assets/favicon.png",
      "bundler": "metro"
    },
    "plugins": [
      [
        "expo-build-properties",
        {
          "ios": {
            "newArchEnabled": true
          },
          "android": {
            "newArchEnabled": true
          }
        }
      ]
    ]
  }
}
```

## Step 3: Migration Steps

1. **Backup your current project**
2. **Clear node_modules and package-lock.json**:
   ```bash
   rm -rf node_modules package-lock.json
   ```
3. **Update dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```
4. **Test the app**:
   ```bash
   npx expo start --clear
   ```

## Step 4: Potential Breaking Changes

### React Native 0.76 Changes
- New Architecture is now stable and enabled by default
- Some third-party libraries may need updates
- Check for deprecated APIs in your code

### Navigation Changes
- React Navigation 7 has some minor API changes
- Navigation timing may be slightly different

### SVG Changes
- react-native-svg 15+ has improved performance but may have minor API differences

## Step 5: Testing Checklist

After migration, test these features:
- [ ] App starts without errors
- [ ] Navigation between screens works
- [ ] SVG icons display correctly
- [ ] Charts render properly
- [ ] Modals and overlays work
- [ ] Font loading works correctly
- [ ] Authentication flow works

## Troubleshooting

### Common Issues:

1. **Metro bundler errors**: Clear cache with `npx expo start --clear`
2. **Dependency conflicts**: Use `npm install --legacy-peer-deps`
3. **Navigation errors**: Check navigation stack configuration
4. **SVG not rendering**: Verify SVG transformer is configured in metro.config.js

### If Migration Fails:
If you encounter issues, you can:
1. Stay on Expo 53 (stable and working)
2. Wait for third-party packages to update
3. Migrate specific packages one at a time

## Current Status
Your project is currently on Expo 53 with updated dependencies that should work reliably. Expo 54 migration can be done when all third-party packages are fully compatible.

## Next Steps
1. Test current Expo 53 setup thoroughly
2. Monitor package compatibility for Expo 54
3. Migrate when all dependencies support React Native 0.76
