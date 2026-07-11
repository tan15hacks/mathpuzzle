import { Capacitor } from '@capacitor/core';

export interface RewardedAdResult {
  rewarded: boolean;
  message?: string;
}

const ANDROID_TEST_REWARDED_ID = 'ca-app-pub-3940256099942544/5224354917';

function consentAllowsAds(status: string): boolean {
  return status === 'OBTAINED' || status === 'NOT_REQUIRED';
}

function configuredRewardedAdId(): string | undefined {
  const value: unknown = import.meta.env.VITE_ADMOB_REWARDED_ANDROID_ID;
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export class RewardedAdManager {
  private initialized = false;
  private initializing: Promise<void> | null = null;
  private canRequestAds = false;

  isSupported(): boolean {
    return Capacitor.getPlatform() === 'android' || import.meta.env.DEV;
  }

  isConfigured(): boolean {
    return Boolean(configuredRewardedAdId()) || import.meta.env.DEV;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    if (this.initializing) return this.initializing;

    this.initializing = this.initializeInternal();
    try {
      await this.initializing;
      this.initialized = true;
    } finally {
      this.initializing = null;
    }
  }

  async showRewardedAd(): Promise<RewardedAdResult> {
    if (!this.isSupported()) {
      return { rewarded: false, message: 'Rewarded ads are available in the Android app.' };
    }

    if (!Capacitor.isNativePlatform()) {
      if (!import.meta.env.DEV) {
        return { rewarded: false, message: 'Rewarded ads are unavailable in this build.' };
      }
      await new Promise((resolve) => window.setTimeout(resolve, 650));
      return { rewarded: true, message: 'Development reward granted.' };
    }

    if (!this.isConfigured()) {
      return {
        rewarded: false,
        message: 'Add your AdMob rewarded ad unit ID before publishing.'
      };
    }

    try {
      await this.initialize();
      if (!this.canRequestAds) {
        return {
          rewarded: false,
          message: 'Ads cannot be requested with the current privacy choice.'
        };
      }

      const { AdMob } = await import('@capacitor-community/admob');
      const adId = configuredRewardedAdId() ?? ANDROID_TEST_REWARDED_ID;

      await AdMob.prepareRewardVideoAd({
        adId,
        isTesting: import.meta.env.DEV
      });
      await AdMob.showRewardVideoAd();
      return { rewarded: true };
    } catch (error) {
      console.error('Unable to show rewarded ad.', error);
      return {
        rewarded: false,
        message: 'The ad could not load. Please try again later.'
      };
    }
  }

  async showPrivacyOptions(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return false;
    try {
      const { AdMob } = await import('@capacitor-community/admob');
      await AdMob.initialize();
      await AdMob.resetConsentInfo();
      let consent = await AdMob.requestConsentInfo();
      if (consent.isConsentFormAvailable) {
        consent = await AdMob.showConsentForm();
      }
      this.canRequestAds = consentAllowsAds(consent.status);
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Unable to show ad privacy options.', error);
      return false;
    }
  }

  private async initializeInternal(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      this.canRequestAds = import.meta.env.DEV;
      return;
    }

    const { AdMob } = await import('@capacitor-community/admob');
    await AdMob.initialize({ initializeForTesting: import.meta.env.DEV });

    let consent = await AdMob.requestConsentInfo();
    if (!consentAllowsAds(consent.status) && consent.isConsentFormAvailable) {
      consent = await AdMob.showConsentForm();
    }
    this.canRequestAds = consentAllowsAds(consent.status);
  }
}
