import { registerSW } from 'virtual:pwa-register';
import { NumberNexusApp } from './app/App';
import './styles.css';
import './gameplay-polish.css';

registerSW({
  immediate: true,
  onNeedRefresh() {
    window.dispatchEvent(new CustomEvent('number-nexus-update-ready'));
  }
});

const root = document.querySelector<HTMLElement>('#app');
if (!root) throw new Error('Number Nexus root element was not found.');

const app = new NumberNexusApp(root);
void app.start();
