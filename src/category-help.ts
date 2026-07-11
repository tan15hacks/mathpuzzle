interface CategoryGuide {
  title: string;
  icon: string;
  summary: string;
  goal: string;
  steps: string[];
  tip: string;
}

const GUIDES: Record<string, CategoryGuide> = {
  'Number Sequences': {
    title: 'Number Sequences',
    icon: '↗',
    summary: 'Find the rule that moves from one number to the next.',
    goal: 'Look at the gaps, positions, and repeated changes, then enter the missing value.',
    steps: [
      'Compare each number with the one before it.',
      'Check whether the gap repeats, grows, shrinks, or alternates.',
      'Use the same rule on the final visible number.'
    ],
    tip: 'Do not only look at the numbers. Look at the movement between them.'
  },
  'Shape Logic': {
    title: 'Shape Logic',
    icon: '△',
    summary: 'Use the numbers around each shape to discover the hidden formula.',
    goal: 'Study the solved shapes first, then apply the same relationship to the shape with the question mark.',
    steps: [
      'Compare the top, side, corner, and center numbers.',
      'Try simple operations first: add, subtract, multiply, or divide.',
      'Repeat the same operation on the unfinished shape.'
    ],
    tip: 'The position of a number matters. Top, side, and center values usually play different roles.'
  },
  'Equation Machines': {
    title: 'Equation Machines',
    icon: 'ƒ',
    summary: 'Each machine changes an input number into an output number.',
    goal: 'Find the operation inside the machine and use it on the missing input or output.',
    steps: [
      'Check every input and output pair.',
      'Look for a shared rule such as ×2 + 3 or ÷2 − 1.',
      'Apply that exact rule to the unknown value.'
    ],
    tip: 'If one operation is not enough, try a two-step rule.'
  },
  'Grid Puzzles': {
    title: 'Grid Puzzles',
    icon: '▦',
    summary: 'Rows, columns, and diagonals follow hidden number rules.',
    goal: 'Use the completed row or column patterns to solve the missing grid cell.',
    steps: [
      'Read the grid horizontally, vertically, and diagonally.',
      'Compare complete rows or columns first.',
      'Apply the matching row or column rule to the missing cell.'
    ],
    tip: 'A grid puzzle often uses more than one direction. Check rows before guessing.'
  },
  'Number Rings': {
    title: 'Number Rings',
    icon: '◉',
    summary: 'Numbers around a ring are connected by position.',
    goal: 'Find how opposite, neighboring, or inner and outer numbers relate to each other.',
    steps: [
      'Start with opposite numbers or matching positions.',
      'Check pairs around the ring instead of reading straight across.',
      'Use the repeated pair rule to solve the question mark.'
    ],
    tip: 'Rotate the pattern in your mind. The same relationship usually repeats around the circle.'
  },
  'Mixed Logic': {
    title: 'Mixed Logic',
    icon: '◇',
    summary: 'Mixed puzzles combine symbols, shapes, balances, and number rules.',
    goal: 'Identify what each symbol or part represents, then solve the missing value.',
    steps: [
      'List what is already known.',
      'Solve the simplest relationship first.',
      'Use that answer to finish the harder part of the puzzle.'
    ],
    tip: 'Break the puzzle into small pieces. Expert puzzles are usually several easy clues connected together.'
  }
};

let installed = false;

export function installCategoryHelp(): void {
  if (installed) return;
  installed = true;

  const root = document.querySelector<HTMLElement>('#app') ?? document.body;
  const enhance = (): void => enhanceCategoryCards(root);

  enhance();
  new MutationObserver(enhance).observe(root, { childList: true, subtree: true });
}

function enhanceCategoryCards(root: HTMLElement): void {
  const screen = root.querySelector<HTMLElement>('main.content-screen');
  const title = screen?.querySelector<HTMLElement>('.screen-header h1')?.textContent?.trim();
  if (title !== 'Categories') return;

  screen.querySelectorAll<HTMLButtonElement>('.chapter-card').forEach((card) => {
    const categoryTitle = card.querySelector<HTMLElement>('.chapter-copy strong')?.textContent?.trim();
    if (!categoryTitle) return;

    const guide = GUIDES[categoryTitle];
    if (!guide) return;

    const existingWrapper = card.parentElement?.classList.contains('category-card-wrap') ? card.parentElement : null;
    if (existingWrapper?.querySelector('.category-help-button')) return;

    const wrapper = existingWrapper ?? document.createElement('div');
    wrapper.className = 'category-card-wrap';

    if (!existingWrapper) {
      const parent = card.parentElement;
      if (!parent) return;
      parent.insertBefore(wrapper, card);
      wrapper.append(card);
    }

    const help = document.createElement('button');
    help.type = 'button';
    help.className = 'category-help-button';
    help.textContent = '?';
    help.setAttribute('aria-label', `How to play ${guide.title}`);
    help.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      openCategoryGuide(guide);
    });

    wrapper.append(help);
  });
}

function openCategoryGuide(guide: CategoryGuide): void {
  document.querySelector('.category-help-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.className = 'dialog-overlay category-help-overlay';

  const dialog = document.createElement('section');
  dialog.className = 'dialog-card category-guide-card';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'category-guide-title');

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'icon-button dialog-close';
  close.textContent = '×';
  close.setAttribute('aria-label', 'Close guide');
  close.addEventListener('click', () => overlay.remove());

  const icon = document.createElement('div');
  icon.className = 'category-guide-icon';
  icon.textContent = guide.icon;

  const label = document.createElement('small');
  label.className = 'category-guide-label';
  label.textContent = 'HOW TO PLAY';

  const title = document.createElement('h2');
  title.id = 'category-guide-title';
  title.textContent = guide.title;

  const summary = document.createElement('p');
  summary.className = 'category-guide-summary';
  summary.textContent = guide.summary;

  const goal = document.createElement('p');
  goal.className = 'category-guide-goal';
  goal.textContent = guide.goal;

  const list = document.createElement('ol');
  list.className = 'category-guide-steps';
  guide.steps.forEach((step) => {
    const item = document.createElement('li');
    item.textContent = step;
    list.append(item);
  });

  const tip = document.createElement('div');
  tip.className = 'category-guide-tip';
  tip.textContent = guide.tip;

  const action = document.createElement('button');
  action.type = 'button';
  action.className = 'primary-button category-guide-action';
  action.textContent = 'Got it';
  action.addEventListener('click', () => overlay.remove());

  dialog.append(close, icon, label, title, summary, goal, list, tip, action);
  overlay.append(dialog);
  overlay.addEventListener('pointerdown', (event) => {
    if (event.target === overlay) overlay.remove();
  });
  document.body.append(overlay);
  action.focus();
}
