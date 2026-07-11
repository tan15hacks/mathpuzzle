export interface LifecycleHandlers {
  onBack: () => boolean;
  onPause?: () => void;
  onResume?: () => void;
}

export class AppLifecycle {
  private cleanup: Array<() => void> = [];

  async connect(handlers: LifecycleHandlers): Promise<void> {
    const visibility = (): void => {
      if (document.hidden) handlers.onPause?.();
      else handlers.onResume?.();
    };
    document.addEventListener('visibilitychange', visibility);
    this.cleanup.push(() => document.removeEventListener('visibilitychange', visibility));

    const popState = (): void => {
      handlers.onBack();
    };
    window.addEventListener('popstate', popState);
    this.cleanup.push(() => window.removeEventListener('popstate', popState));

    try {
      const { App } = await import('@capacitor/app');
      const backHandle = await App.addListener('backButton', () => {
        const handled = handlers.onBack();
        if (!handled) void App.exitApp();
      });
      const stateHandle = await App.addListener('appStateChange', ({ isActive }) => {
        if (isActive) handlers.onResume?.();
        else handlers.onPause?.();
      });
      this.cleanup.push(() => void backHandle.remove(), () => void stateHandle.remove());
    } catch {
      // Browser testing does not require native lifecycle listeners.
    }
  }

  dispose(): void {
    this.cleanup.forEach((callback) => callback());
    this.cleanup = [];
  }
}
