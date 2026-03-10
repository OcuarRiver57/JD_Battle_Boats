import { Stack } from "expo-router";
export default function RootLayout() {
  // turn off the built-in header for all screens
  return <Stack screenOptions={{ headerShown: false }} />;
}
