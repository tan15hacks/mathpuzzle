export type AdPlacement = 'free-hint' | 'bonus-hint-tokens' | 'daily-reward' | 'post-level-reward';

export interface RewardResult {
  completed: boolean;
  placement: AdPlacement;
}

export interface RewardedAdProvider {
  initialize(): Promise<void>;
  isRewardedAdAvailable(): Promise<boolean>;
  showRewardedAd(placement: AdPlacement): Promise<RewardResult>;
}

export class MockRewardedAdProvider implements RewardedAdProvider {
  private ready = false;

  initialize(): Promise<void> {
    this.ready = true;
    return Promise.resolve();
  }

  isRewardedAdAvailable(): Promise<boolean> {
    return Promise.resolve(this.ready);
  }

  async showRewardedAd(placement: AdPlacement): Promise<RewardResult> {
    if (!this.ready) await this.initialize();
    await new Promise((resolve) => window.setTimeout(resolve, 450));
    return { completed: true, placement };
  }
}
