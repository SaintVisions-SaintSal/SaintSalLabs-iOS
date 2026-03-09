/**
 * SaintSal Labs — Entry Point
 * Routes to tabs (main app) directly. Auth is optional.
 */
import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/(tabs)" />;
}
