import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.numbernexus',
  appName: 'Number Nexus',
  webDir: 'dist',
  backgroundColor: '#F4F3EE',
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 900,
      launchAutoHide: true,
      backgroundColor: '#F4F3EE',
      showSpinner: false
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#F4F3EE',
      overlaysWebView: false
    }
  }
};

export default config;
