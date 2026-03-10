/*
File Summary:
This file defines the app-level Expo Router stack configuration and applies
shared navigation options for all screens in the app directory.
*/

import { Stack } from "expo-router";

// Provides the root navigator with a hidden default header for all routes.
export default function RootLayout() {
  // turn off the built-in header for all screens
  return <Stack screenOptions={{ headerShown: false }} />;
}
