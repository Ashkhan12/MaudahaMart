# Maudaha Mart 🏪 - Flutter Mobile App

A cross-platform Flutter application for Maudaha Mart, fully integrated with the same Firebase Firestore and Auth backend services.

## ✨ Features
- **Real-time Synchronization**: Powered by Firebase Firestore. Real-time lists of stores, products, and active orders.
- **Unified Auth Portal**: Integrated with Firebase Auth, matching the users list and password states.
- **Live Google Map Location Selector**: Enables customers to pinpoint and select their precise live delivery address on an interactive map.
- **Dynamic Simulation/Demo Mode**: Quick-switch buttons for testing admin, merchant, and rider portals.

## 🛠️ Requirements & Setup

1. **Install Flutter**: Make sure you have the [Flutter SDK installed](https://docs.flutter.dev/get-started/install).
2. **Download files**: Simply export this project as a ZIP (from the Settings menu in AI Studio) and extract the `/flutter_app/` folder.
3. **Configure Firebase**:
   - Create an app under your existing Firebase Project: `ai-studio-maudahamart-55495b6b-a809-417b-b1ae-8472e7d6c620`.
   - **For Android**: Download `google-services.json` from the Firebase Console and place it in `/flutter_app/android/app/`.
   - **For iOS**: Download `GoogleService-Info.plist` from the Firebase Console and place it in `/flutter_app/ios/Runner/`.
4. **Configure Google Maps**:
   - Enable the Google Maps SDK in your Google Cloud Console.
   - For Android, configure your API Key in `/flutter_app/android/app/src/main/AndroidManifest.xml`.
   - For iOS, configure your API Key in `/flutter_app/ios/Runner/AppDelegate.swift`.

## 🚀 Run Application

To get dependencies and run the application on a connected device/emulator:

```bash
cd flutter_app
flutter pub get
flutter run
```
