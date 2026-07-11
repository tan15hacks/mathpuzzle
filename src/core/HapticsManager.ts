export class HapticsManager {
  private enabled = true;

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  async light(): Promise<void> {
    if (!this.enabled) return;
    try {
      const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {
      navigator.vibrate?.(18);
    }
  }

  async success(): Promise<void> {
    if (!this.enabled) return;
    try {
      const { Haptics, NotificationType } = await import('@capacitor/haptics');
      await Haptics.notification({ type: NotificationType.Success });
    } catch {
      navigator.vibrate?.([24, 35, 42]);
    }
  }

  async error(): Promise<void> {
    if (!this.enabled) return;
    try {
      const { Haptics, NotificationType } = await import('@capacitor/haptics');
      await Haptics.notification({ type: NotificationType.Error });
    } catch {
      navigator.vibrate?.([35, 30, 35]);
    }
  }
}
