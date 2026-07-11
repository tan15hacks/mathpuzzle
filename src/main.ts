import { registerSW } from 'virtual:pwa-register';
import { NumberNexusApp } from './app/App';
import { installCategoryHelp } from './category-help';
import './styles.css';
import './gameplay-polish.css';
import './category-help.css';

registerSW({
  immediate: true,
  onNeedRefresh() {
    window.dispatchEvent(new CustomEvent('number-nexus-update-ready'));
  }
});

const root = document.querySelector<HTMLElement>('#app');
if (!root) throw new Error('Number Nexus root element was not found.');

installCategoryHelp();

const app = new NumberNexusApp(root);
void app.start();
