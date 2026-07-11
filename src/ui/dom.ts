export function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function iconButton(label: string, icon: string, className = ''): HTMLButtonElement {
  const button = element('button', `icon-button ${className}`.trim());
  button.type = 'button';
  button.setAttribute('aria-label', label);
  button.textContent = icon;
  return button;
}

export function progressBar(value: number, max: number, label: string): HTMLElement {
  const wrapper = element('div', 'progress-bar');
  const track = element('div', 'progress-track');
  const fill = element('div', 'progress-fill');
  fill.style.width = `${max > 0 ? Math.min(100, (value / max) * 100) : 0}%`;
  track.append(fill);
  wrapper.append(element('div', 'progress-label', label), track);
  return wrapper;
}

export function formatStars(stars: number): string {
  return `${'★'.repeat(stars)}${'☆'.repeat(Math.max(0, 3 - stars))}`;
}
