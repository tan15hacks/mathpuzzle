import { AudioManager } from '../core/AudioManager';
import { HapticsManager } from '../core/HapticsManager';
import { RewardedAdManager } from '../core/RewardedAdManager';
import { calculateStreak, dailyPuzzleId, localDateKey } from '../progression/DailyPuzzleManager';
import {
  categoryProgress,
  completedCount,
  completionPercent,
  getLevelProgress,
  isPuzzleUnlocked,
  isTierUnlocked,
  nextPlayablePuzzleId,
  starsForHints,
  totalStars
} from '../progression/ProgressionManager';
import { isCorrectAnswer } from '../puzzles/AnswerValidator';
import { PuzzleRegistry } from '../puzzles/PuzzleRegistry';
import type { DifficultyTier, PuzzleDefinition } from '../puzzles/PuzzleTypes';
import { validateCampaign } from '../puzzles/PuzzleValidator';
import { DIFFICULTY_TIERS } from '../puzzles/data/categoryGenerators';
import { PuzzleScene } from '../puzzles/renderers/PuzzleScene';
import { SaveManager } from '../storage/SaveManager';
import type { GameSave, GameSettings } from '../storage/SaveTypes';
import { element, formatStars, iconButton, progressBar } from '../ui/dom';
import { AppLifecycle } from './AppLifecycle';
import { Router, type Route } from './Router';

interface Session {
  puzzle: PuzzleDefinition;
  answer: string;
  hintsUsed: number;
  revealedHints: number;
  solved: boolean;
  daily: boolean;
}

const TIER_LABELS: Record<DifficultyTier, string> = {
  easy: 'Easy',
  normal: 'Normal',
  advanced: 'Advanced',
  expert: 'Expert'
};

const TIER_DESCRIPTIONS: Record<DifficultyTier, string> = {
  easy: 'Learn the rules with clear, approachable patterns.',
  normal: 'Combine familiar operations with an extra step.',
  advanced: 'Use layered relationships and less obvious clues.',
  expert: 'Solve the most demanding multi-step challenges.'
};

export class NumberNexusApp {
  private readonly router = new Router();
  private readonly saves = new SaveManager();
  private readonly audio = new AudioManager();
  private readonly haptics = new HapticsManager();
  private readonly ads = new RewardedAdManager();
  private readonly lifecycle = new AppLifecycle();
  private scene: PuzzleScene | null = null;
  private session: Session | null = null;
  private dialog: HTMLElement | null = null;
  private adBusy = false;

  constructor(private readonly root: HTMLElement) {}

  async start(): Promise<void> {
    this.applySettings(this.saves.get());
    this.render({ screen: 'splash' });
    await this.lifecycle.connect({
      onBack: () => this.back(),
      onPause: () => this.scene?.dispose(),
      onResume: () => this.render(this.router.current, true)
    });
    window.setTimeout(() => this.go({ screen: 'menu' }, true), 650);
  }

  private go(route: Route, replace = false): void {
    if (replace) this.router.replace(route);
    else this.router.push(route);
    this.render(route);
  }

  private back(): boolean {
    if (this.dialog) {
      this.closeDialog();
      return true;
    }
    if (this.router.current.screen === 'menu' || this.router.current.screen === 'splash') {
      return false;
    }
    const route = this.router.back();
    if (route) this.render(route);
    return true;
  }

  private render(route: Route, resume = false): void {
    this.scene?.dispose();
    this.scene = null;
    this.dialog = null;
    this.root.replaceChildren();
    this.root.className = 'app-shell';

    switch (route.screen) {
      case 'splash':
        this.splash();
        break;
      case 'menu':
        this.menu();
        break;
      case 'categories':
        this.categories();
        break;
      case 'levels':
        this.levels(route.categoryId ?? PuzzleRegistry.categories()[0]!.id, route.tier);
        break;
      case 'puzzle':
        this.puzzle(
          route.puzzleId ?? PuzzleRegistry.first().id,
          Boolean(route.daily),
          resume
        );
        break;
      case 'daily':
        this.go({ screen: 'puzzle', puzzleId: dailyPuzzleId(), daily: true }, true);
        break;
      case 'progress':
        this.progress();
        break;
      case 'settings':
        this.settings();
        break;
      case 'about':
        this.about();
        break;
      case 'debug':
        this.debug();
        break;
    }
  }

  private splash(): void {
    const main = element('main', 'screen splash-screen');
    main.innerHTML =
      '<div class="brand-mark"><span>+</span></div><h1>Number Nexus</h1><p>Choose your challenge.</p><div class="loading-dots" aria-label="Loading"><i></i><i></i><i></i></div>';
    this.root.append(main);
  }

  private header(title: string, subtitle?: string): HTMLElement {
    const header = element('header', 'screen-header');
    const back = iconButton('Go back', '‹');
    back.addEventListener('click', () => this.back());
    const copy = element('div');
    copy.append(element('h1', '', title));
    if (subtitle) copy.append(element('p', '', subtitle));
    header.append(back, copy);
    return header;
  }

  private menu(): void {
    const save = this.saves.get();
    const main = element('main', 'screen menu-screen');
    const top = element('header', 'menu-header');
    top.innerHTML =
      '<div class="brand-lockup"><div class="mini-mark">+</div><div><span>NUMBER</span><strong>NEXUS</strong></div></div>';
    const settings = iconButton('Open settings', '⚙');
    settings.addEventListener('click', () => this.go({ screen: 'settings' }));
    top.append(settings);

    const hero = element('section', 'hero-card');
    hero.innerHTML =
      '<div class="eyebrow">1,920 ORIGINAL LEVELS</div><h1>Choose how<br><em>you want to think.</em></h1><p>Six always-open puzzle categories, each progressing from Easy to Expert.</p>';
    const play = element('button', 'primary-button hero-action', 'Continue');
    play.addEventListener('click', () =>
      this.go({ screen: 'puzzle', puzzleId: nextPlayablePuzzleId(save) })
    );
    hero.append(play);

    const stats = element('section', 'stat-strip');
    stats.innerHTML = `<div><strong>${completionPercent(save)}%</strong><span>Complete</span></div><div><strong>${totalStars(save)}</strong><span>Stars</span></div><div><strong>${save.currentStreak}</strong><span>Day streak</span></div>`;

    const gridNode = element('section', 'menu-grid');
    const entries: Array<[string, string, string, Route]> = [
      ['Categories', 'Choose any puzzle style', '◇', { screen: 'categories' }],
      ['Daily Puzzle', 'One rotating challenge today', '☀', { screen: 'daily' }],
      ['Progress', 'Review stars and category growth', '◔', { screen: 'progress' }],
      ['About', 'Game details, privacy, and credits', 'ⓘ', { screen: 'about' }]
    ];

    entries.forEach(([title, subtitle, icon, route]) => {
      const button = element('button', 'menu-tile');
      button.innerHTML = `<span class="tile-icon">${icon}</span><span><strong>${title}</strong><small>${subtitle}</small></span><b>›</b>`;
      button.addEventListener('click', () => this.go(route));
      gridNode.append(button);
    });

    if (this.ads.isSupported()) {
      const rewarded = element('button', 'menu-tile rewarded-tile');
      rewarded.innerHTML =
        '<span class="tile-icon">▶</span><span><strong>Optional Ad Reward</strong><small>Watch only when you choose · earn 2 hints</small></span><b>+2</b>';
      rewarded.addEventListener('click', () => void this.rewardHints(rewarded));
      gridNode.append(rewarded);
    }

    if (import.meta.env.DEV) {
      const debug = element('button', 'text-button', 'Open puzzle debugger');
      debug.addEventListener('click', () => this.go({ screen: 'debug' }));
      gridNode.append(debug);
    }

    main.append(top, hero, stats, gridNode);
    this.root.append(main);
  }

  private categories(): void {
    const save = this.saves.get();
    const main = element('main', 'screen content-screen');
    main.append(
      this.header(
        'Categories',
        'Every play style is open. Progress separately from Easy to Expert.'
      )
    );

    const list = element('section', 'chapter-list');
    PuzzleRegistry.categories().forEach((category) => {
      const result = categoryProgress(save, category.id);
      const nextId = nextPlayablePuzzleId(save, category.id);
      const nextTier = PuzzleRegistry.get(nextId)?.difficultyTier ?? 'easy';
      const button = element('button', 'chapter-card category-card');
      button.style.setProperty('--chapter-accent', category.accent);
      button.innerHTML = `<span class="chapter-icon">${category.icon}</span><span class="chapter-copy"><small>CATEGORY ${category.number} · ${TIER_LABELS[nextTier].toUpperCase()}</small><strong>${category.title}</strong><em>${category.subtitle}</em></span><span class="chapter-score"><b>${result.completed}/${result.total}</b><small>${result.stars}/${result.total * 3} ★</small></span>`;
      button.addEventListener('click', () =>
        this.go({ screen: 'levels', categoryId: category.id, tier: nextTier })
      );
      list.append(button);
    });

    main.append(list);
    this.root.append(main);
  }

  private levels(categoryId: string, requestedTier?: DifficultyTier): void {
    const category = PuzzleRegistry.category(categoryId) ?? PuzzleRegistry.categories()[0]!;
    const save = this.saves.get();
    const nextPuzzle = PuzzleRegistry.get(nextPlayablePuzzleId(save, category.id));
    const fallbackTier = nextPuzzle?.difficultyTier ?? 'easy';
    const tier =
      requestedTier && isTierUnlocked(save, category.id, requestedTier)
        ? requestedTier
        : fallbackTier;

    const main = element('main', 'screen content-screen');
    main.append(this.header(category.title, category.subtitle));

    const summary = categoryProgress(save, category.id);
    main.append(
      progressBar(
        summary.completed,
        summary.total,
        `${summary.completed} of ${summary.total} solved · ${summary.stars} stars`
      )
    );

    const tierTabs = element('nav', 'tier-tabs');
    tierTabs.setAttribute('aria-label', 'Difficulty tiers');
    DIFFICULTY_TIERS.forEach((item) => {
      const unlocked = isTierUnlocked(save, category.id, item);
      const button = element(
        'button',
        `tier-tab${item === tier ? ' selected' : ''}${unlocked ? '' : ' locked'}`,
        unlocked ? TIER_LABELS[item] : `🔒 ${TIER_LABELS[item]}`
      );
      button.disabled = !unlocked;
      button.addEventListener('click', () =>
        this.go({ screen: 'levels', categoryId: category.id, tier: item }, true)
      );
      tierTabs.append(button);
    });

    const tierPuzzles = PuzzleRegistry.byTier(category.id, tier);
    const tierCompleted = tierPuzzles.filter((puzzle) => save.levels[puzzle.id]?.completed).length;
    const tierIntro = element('section', 'tier-intro');
    tierIntro.innerHTML = `<div><small>${TIER_LABELS[tier].toUpperCase()} · ${tierCompleted}/${tierPuzzles.length}</small><h2>${TIER_LABELS[tier]} Levels</h2><p>${TIER_DESCRIPTIONS[tier]}</p></div><span>${tierPuzzles[0]!.levelNumber}–${tierPuzzles.at(-1)!.levelNumber}</span>`;

    const levelGrid = element('section', 'level-grid');
    tierPuzzles.forEach((item) => {
      const unlocked = isPuzzleUnlocked(save, item.id);
      const levelProgress = getLevelProgress(save, item.id);
      const button = element(
        'button',
        `level-tile${levelProgress.completed ? ' complete' : ''}${unlocked ? '' : ' locked'}`
      );
      button.disabled = !unlocked;
      button.innerHTML = `<span>${unlocked ? item.levelNumber : '⌁'}</span><small>${levelProgress.completed ? formatStars(levelProgress.bestStars) : unlocked ? 'Ready' : 'Locked'}</small>`;
      button.addEventListener('click', () =>
        this.go({ screen: 'puzzle', puzzleId: item.id })
      );
      levelGrid.append(button);
    });

    main.append(tierTabs, tierIntro, levelGrid);
    this.root.append(main);
  }

  private puzzle(puzzleId: string, daily: boolean, resume: boolean): void {
    const definition = PuzzleRegistry.get(puzzleId) ?? PuzzleRegistry.first();
    if (!resume || !this.session || this.session.puzzle.id !== definition.id) {
      this.session = {
        puzzle: definition,
        answer: '',
        hintsUsed: 0,
        revealedHints: 0,
        solved: false,
        daily
      };
    }
    const session = this.session;
    const category = PuzzleRegistry.category(definition.categoryId);

    const main = element('main', 'screen puzzle-screen');
    const top = element('header', 'puzzle-header');
    const back = iconButton('Leave puzzle', '‹');
    back.addEventListener('click', () => this.back());
    const copy = element('div');
    copy.innerHTML = `<small>${daily ? 'DAILY PUZZLE' : `${category?.title ?? 'NUMBER NEXUS'} · ${TIER_LABELS[definition.difficultyTier].toUpperCase()}`}</small><strong>${definition.title}</strong>`;
    top.append(
      back,
      copy,
      element(
        'span',
        'level-counter',
        daily ? 'TODAY' : `${definition.levelNumber}/${category?.puzzles.length ?? 320}`
      )
    );

    const card = element('section', 'puzzle-card');
    const host = element('div', 'three-host');
    card.append(host);

    const panel = element('section', 'answer-panel');
    panel.append(element('p', 'prompt', definition.prompt));
    const display = element('div', 'answer-display', session.answer || 'Your answer');
    display.classList.toggle('empty', !session.answer);
    panel.append(display);

    const feedback = element('div', 'feedback');
    panel.append(this.answerControls(definition, display), feedback);

    const actions = element('div', 'puzzle-actions');
    const hint = element('button', 'secondary-button', `Hint · ${this.saves.get().hintTokens}`);
    hint.addEventListener('click', () => this.revealHint(hint));
    const submit = element('button', 'primary-button', 'Submit');
    submit.addEventListener('click', () => this.submit(feedback, display));
    actions.append(hint, submit);
    panel.append(actions);

    if (this.ads.isSupported()) {
      const ad = element('button', 'ad-button', '▶ Optional ad · earn 2 hint tokens');
      ad.addEventListener('click', () => void this.rewardHints(ad, hint));
      panel.append(ad);
    }

    main.append(top, card, panel);
    this.root.append(main);
    this.scene = new PuzzleScene(host);
    this.scene.render(definition, this.saves.get().settings.reducedMotion);
  }

  private answerControls(puzzle: PuzzleDefinition, display: HTMLElement): HTMLElement {
    const wrap = element('div', 'answer-controls');
    const choose = (value: string): void => {
      if (!this.session || this.session.solved) return;
      this.session.answer = value;
      display.textContent = value;
      display.classList.remove('empty');
      wrap.querySelectorAll('.selected').forEach((node) => node.classList.remove('selected'));
      wrap
        .querySelector<HTMLElement>(`[data-answer="${CSS.escape(value)}"]`)
        ?.classList.add('selected');
      this.audio.play('key');
      void this.haptics.light();
    };

    if (puzzle.answerMode === 'numeric-input') {
      const keypad = element('div', 'keypad');
      const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
      if (puzzle.allowNegative) keys.push('−');
      keys.push('0');
      if (puzzle.allowDecimal) keys.push('.');
      keys.push('⌫', 'Clear');

      keys.forEach((key) => {
        const button = element('button', key === 'Clear' ? 'wide' : '', key);
        button.addEventListener('click', () => {
          if (!this.session || this.session.solved) return;
          if (key === '⌫') this.session.answer = this.session.answer.slice(0, -1);
          else if (key === 'Clear') this.session.answer = '';
          else if (key === '−') {
            this.session.answer = this.session.answer.startsWith('-')
              ? this.session.answer.slice(1)
              : `-${this.session.answer}`;
          } else if (!(key === '.' && this.session.answer.includes('.'))) {
            this.session.answer += key;
          }
          display.textContent = this.session.answer || 'Your answer';
          display.classList.toggle('empty', !this.session.answer);
          this.audio.play('key');
        });
        keypad.append(button);
      });
      wrap.append(keypad);
      return wrap;
    }

    const choiceGrid = element(
      'div',
      puzzle.answerMode === 'drag-and-drop'
        ? 'choice-grid draggable-choices'
        : 'choice-grid'
    );
    (puzzle.choices ?? []).forEach((value) => {
      const text = String(value);
      const button = element('button', 'choice-chip', text);
      button.dataset.answer = text;
      button.draggable = puzzle.answerMode === 'drag-and-drop';
      button.addEventListener('click', () => choose(text));
      button.addEventListener('dragstart', (event) =>
        event.dataTransfer?.setData('text/plain', text)
      );
      choiceGrid.append(button);
    });

    if (puzzle.answerMode === 'drag-and-drop') {
      display.classList.add('drop-zone');
      display.addEventListener('dragover', (event) => event.preventDefault());
      display.addEventListener('drop', (event) => {
        event.preventDefault();
        choose(event.dataTransfer?.getData('text/plain') ?? '');
      });
    }
    wrap.append(choiceGrid);
    return wrap;
  }

  private revealHint(button: HTMLButtonElement): void {
    const session = this.session;
    if (!session || session.solved) return;
    if (session.revealedHints >= 3) {
      this.showDialog('All hints revealed', 'You have seen every hint for this puzzle.');
      return;
    }

    const save = this.saves.get();
    if (save.hintTokens <= 0) {
      this.noHintTokensDialog(button);
      return;
    }

    const index = session.revealedHints;
    session.revealedHints += 1;
    session.hintsUsed += 1;
    const updated = this.saves.update((draft) => {
      draft.hintTokens -= 1;
      draft.statistics.totalHintsUsed += 1;
    });
    button.textContent = `Hint · ${updated.hintTokens}`;
    this.audio.play('hint');
    this.showDialog(`Hint ${index + 1}`, session.puzzle.hints[index]!.text);
  }

  private noHintTokensDialog(hintButton: HTMLButtonElement): void {
    const content = element('div');
    content.innerHTML =
      '<h2>No hint tokens</h2><p>You can keep solving without a hint, earn tokens through play, or voluntarily watch one rewarded ad for 2 tokens.</p>';
    const actions = element('div', 'dialog-actions');
    const close = element('button', 'secondary-button', 'Keep solving');
    close.addEventListener('click', () => this.closeDialog());
    actions.append(close);

    if (this.ads.isSupported()) {
      const ad = element('button', 'ad-button solid', '▶ Watch optional ad · +2 hints');
      ad.addEventListener('click', () => {
        this.closeDialog();
        void this.rewardHints(ad, hintButton);
      });
      actions.append(ad);
    }
    content.append(actions);
    this.showDialogNode(content);
  }

  private async rewardHints(
    trigger: HTMLButtonElement,
    hintButton?: HTMLButtonElement
  ): Promise<void> {
    if (this.adBusy) return;
    this.adBusy = true;
    const oldText = trigger.textContent;
    trigger.disabled = true;
    trigger.textContent = 'Loading optional ad…';

    try {
      const result = await this.ads.showRewardedAd();
      if (!result.rewarded) {
        this.showDialog('Ad unavailable', result.message ?? 'Please try again later.');
        return;
      }
      const updated = this.saves.update((draft) => {
        draft.hintTokens += 2;
        draft.statistics.rewardedAdsWatched += 1;
      });
      if (hintButton) hintButton.textContent = `Hint · ${updated.hintTokens}`;
      this.audio.play('chapter');
      void this.haptics.success();
      this.showDialog(
        '2 hint tokens added',
        'Thanks for supporting the game. Rewarded ads are always optional.'
      );
    } finally {
      this.adBusy = false;
      trigger.disabled = false;
      trigger.textContent = oldText;
    }
  }

  private submit(feedback: HTMLElement, display: HTMLElement): void {
    const session = this.session;
    if (!session || session.solved || !session.answer.trim()) {
      feedback.textContent = 'Enter or select an answer first.';
      return;
    }

    const correct = isCorrectAnswer(session.puzzle, session.answer);
    this.saves.update((draft) => {
      draft.statistics.totalAttempts += 1;
      const previous = draft.levels[session.puzzle.id];
      if (previous) previous.attempts += 1;
    });

    if (!correct) {
      feedback.textContent = [
        'Not quite. Look again.',
        'Try another pattern.',
        'That answer does not match the rule.'
      ][Math.floor(Math.random() * 3)]!;
      display.classList.remove('shake');
      void display.offsetWidth;
      display.classList.add('shake');
      this.audio.play('incorrect');
      void this.haptics.error();
      return;
    }

    session.solved = true;
    feedback.textContent = 'Correct!';
    feedback.className = 'feedback success';

    const before = this.saves.get();
    const wasComplete = Boolean(before.levels[session.puzzle.id]?.completed);
    const oldStars = totalStars(before);
    const stars = starsForHints(session.hintsUsed);
    const today = localDateKey();
    const category = PuzzleRegistry.category(session.puzzle.categoryId)!;
    const tierPuzzles = PuzzleRegistry.byTier(
      session.puzzle.categoryId,
      session.puzzle.difficultyTier
    );
    const tierWasComplete = tierPuzzles.every(
      (item) => before.levels[item.id]?.completed
    );
    const categoryWasComplete = category.puzzles.every(
      (item) => before.levels[item.id]?.completed
    );

    const updated = this.saves.update((draft) => {
      const old = draft.levels[session.puzzle.id];
      draft.levels[session.puzzle.id] = {
        completed: true,
        bestStars: Math.max(old?.bestStars ?? 0, stars) as 1 | 2 | 3,
        bestHintsUsed: Math.min(old?.bestHintsUsed ?? 99, session.hintsUsed),
        attempts: Math.max(1, old?.attempts ?? 0),
        completedAt: old?.completedAt ?? new Date().toISOString()
      };
      draft.lastPlayedLevel =
        PuzzleRegistry.next(session.puzzle.id)?.id ?? session.puzzle.id;

      if (!wasComplete && session.hintsUsed === 0) {
        draft.statistics.solvedWithoutHints += 1;
      }
      if (session.daily && !draft.dailyCompletedDates.includes(today)) {
        draft.dailyCompletedDates.push(today);
        draft.statistics.dailySolved += 1;
      }
      if (session.daily && !draft.dailyRewardDates.includes(today)) {
        draft.dailyRewardDates.push(today);
        draft.hintTokens += 1;
      }

      const streak = calculateStreak(draft.dailyCompletedDates);
      draft.currentStreak = streak.current;
      draft.longestStreak = Math.max(draft.longestStreak, streak.longest);
    });

    const tierNowComplete = tierPuzzles.every(
      (item) => updated.levels[item.id]?.completed
    );
    const categoryNowComplete = category.puzzles.every(
      (item) => updated.levels[item.id]?.completed
    );
    const newStars = totalStars(updated);

    let milestone: 'level' | 'tier' | 'category' = 'level';
    if (!tierWasComplete && tierNowComplete) {
      milestone = 'tier';
      this.saves.update((draft) => {
        draft.hintTokens += 2;
      });
      this.audio.play('chapter');
    } else {
      this.audio.play('correct');
    }

    if (!categoryWasComplete && categoryNowComplete) {
      milestone = 'category';
      this.saves.update((draft) => {
        draft.hintTokens += 3;
      });
      this.audio.play('chapter');
    }

    if (Math.floor(newStars / 30) > Math.floor(oldStars / 30)) {
      this.saves.update((draft) => {
        draft.hintTokens += 1;
      });
    }

    void this.haptics.success();
    this.scene?.celebrate();
    window.setTimeout(() => this.solution(stars, milestone), 350);
  }

  private solution(
    stars: number,
    milestone: 'level' | 'tier' | 'category'
  ): void {
    const session = this.session;
    if (!session) return;

    const label =
      milestone === 'category'
        ? 'CATEGORY COMPLETE'
        : milestone === 'tier'
          ? `${TIER_LABELS[session.puzzle.difficultyTier].toUpperCase()} COMPLETE`
          : 'CONNECTION FOUND';

    const content = element('div', 'solution');
    content.innerHTML = `<div class="success-mark">✓</div><small>${label}</small><h2>Correct</h2><div class="earned-stars">${formatStars(stars)}</div><p>${session.puzzle.explanation}</p><ol>${session.puzzle.solutionSteps.map((step) => `<li>${step}</li>`).join('')}</ol>`;

    const actions = element('div', 'dialog-actions');
    const select = element('button', 'secondary-button', 'Level Select');
    select.addEventListener('click', () => {
      this.closeDialog();
      this.go(
        {
          screen: 'levels',
          categoryId: session.puzzle.categoryId,
          tier: session.puzzle.difficultyTier
        },
        true
      );
    });

    const replay = element('button', 'secondary-button', 'Replay');
    replay.addEventListener('click', () => {
      this.closeDialog();
      this.session = null;
      this.render(this.router.current);
    });

    const nextPuzzle = PuzzleRegistry.next(session.puzzle.id);
    const next = element(
      'button',
      'primary-button',
      nextPuzzle && !session.daily ? 'Next Level' : 'Main Menu'
    );
    next.addEventListener('click', () => {
      this.closeDialog();
      this.session = null;
      if (nextPuzzle && !session.daily) {
        this.go({ screen: 'puzzle', puzzleId: nextPuzzle.id }, true);
      } else {
        this.go({ screen: 'menu' }, true);
      }
    });

    actions.append(select, replay, next);
    content.append(actions);
    this.showDialogNode(content, false);
  }

  private progress(): void {
    const save = this.saves.get();
    const totalPuzzles = PuzzleRegistry.all().length;
    const maxStars = totalPuzzles * 3;
    const main = element('main', 'screen content-screen');
    main.append(
      this.header(
        'Progress',
        'Each category grows independently from Easy to Expert'
      )
    );

    const overview = element('section', 'progress-overview');
    overview.innerHTML = `<div class="progress-ring" style="--progress:${completionPercent(save) * 3.6}deg"><span>${completionPercent(save)}%</span></div><div><strong>${completedCount(save)} / ${totalPuzzles}</strong><span>Puzzles solved</span><strong>${totalStars(save)} / ${maxStars}</strong><span>Stars earned</span></div>`;

    const stats = element('section', 'stats-grid');
    const values: Array<[string, string]> = [
      [String(save.statistics.solvedWithoutHints), 'Solved without hints'],
      [String(save.statistics.totalHintsUsed), 'Hints used'],
      [String(save.currentStreak), 'Current streak'],
      [String(save.longestStreak), 'Longest streak'],
      [String(save.statistics.dailySolved), 'Daily puzzles'],
      [String(save.statistics.rewardedAdsWatched), 'Optional ads watched']
    ];
    values.forEach(([value, label]) => {
      const article = element('article');
      article.innerHTML = `<strong>${value}</strong><span>${label}</span>`;
      stats.append(article);
    });

    const categoryList = element('section', 'chapter-progress-list');
    PuzzleRegistry.categories().forEach((category) => {
      const result = categoryProgress(save, category.id);
      categoryList.append(
        progressBar(
          result.completed,
          result.total,
          `${category.title} · ${result.completed}/${result.total} · ${result.stars}/${result.total * 3} ★`
        )
      );
    });

    main.append(overview, stats, categoryList);
    this.root.append(main);
  }

  private settings(): void {
    const save = this.saves.get();
    const main = element('main', 'screen content-screen');
    main.append(this.header('Settings', 'Tune Number Nexus for your device'));
    const form = element('section', 'settings-card');

    const range = (
      label: string,
      value: number,
      update: (value: number) => void
    ): HTMLElement => {
      const row = element('label', 'setting-row');
      const copy = element('span');
      copy.innerHTML = `<strong>${label}</strong><small>${Math.round(value * 100)}%</small>`;
      const input = element('input');
      input.type = 'range';
      input.min = '0';
      input.max = '1';
      input.step = '0.05';
      input.value = String(value);
      input.addEventListener('input', () => {
        const next = Number(input.value);
        copy.querySelector('small')!.textContent = `${Math.round(next * 100)}%`;
        update(next);
      });
      row.append(copy, input);
      return row;
    };

    form.append(
      range('Music volume', save.settings.musicVolume, (value) => {
        this.saves.update((draft) => {
          draft.settings.musicVolume = value;
        });
        this.audio.setMusicVolume(value);
      }),
      range('Sound effects', save.settings.soundVolume, (value) => {
        this.saves.update((draft) => {
          draft.settings.soundVolume = value;
        });
        this.audio.setVolume(value);
        this.audio.play('tap');
      })
    );

    const toggles: Array<
      [
        keyof Pick<
          GameSettings,
          'vibration' | 'reducedMotion' | 'highContrast' | 'largeText'
        >,
        string,
        string
      ]
    > = [
      ['vibration', 'Vibration', 'Gentle feedback for answers and taps'],
      ['reducedMotion', 'Reduced motion', 'Minimize pulsing and transition effects'],
      ['highContrast', 'High contrast', 'Strengthen borders and text separation'],
      ['largeText', 'Large text', 'Increase interface text size']
    ];

    toggles.forEach(([key, title, description]) => {
      const row = element('label', 'setting-row toggle-row');
      const copy = element('span');
      copy.innerHTML = `<strong>${title}</strong><small>${description}</small>`;
      const input = element('input');
      input.type = 'checkbox';
      input.checked = save.settings[key];
      input.addEventListener('change', () => {
        const updated = this.saves.update((draft) => {
          draft.settings[key] = input.checked;
        });
        this.applySettings(updated);
      });
      row.append(copy, input);
      form.append(row);
    });

    if (this.ads.isSupported()) {
      const privacy = element('button', 'secondary-button', 'Ad privacy choices');
      privacy.addEventListener('click', () => void this.openAdPrivacy());
      form.append(
        element(
          'p',
          'settings-note',
          'Number Nexus uses rewarded ads only after you tap an ad button. There are no forced interstitial ads.'
        ),
        privacy
      );
    }

    const reset = element('button', 'danger-button', 'Reset all progress');
    reset.addEventListener('click', () => {
      const content = element('div');
      content.innerHTML =
        '<h2>Reset everything?</h2><p>This removes stars, level progress, daily history, hint tokens, and settings stored on this device. Categories remain available.</p>';
      const actions = element('div', 'dialog-actions');
      const cancel = element('button', 'secondary-button', 'Cancel');
      cancel.addEventListener('click', () => this.closeDialog());
      const confirm = element('button', 'danger-button', 'Reset progress');
      confirm.addEventListener('click', () => {
        this.applySettings(this.saves.reset());
        this.closeDialog();
        this.go({ screen: 'menu' }, true);
      });
      actions.append(cancel, confirm);
      content.append(actions);
      this.showDialogNode(content);
    });
    form.append(reset);

    main.append(form);
    this.root.append(main);
  }

  private async openAdPrivacy(): Promise<void> {
    const opened = await this.ads.showPrivacyOptions();
    this.showDialog(
      opened ? 'Ad privacy choices' : 'Not available',
      opened
        ? 'Your advertising privacy options were opened.'
        : 'Ad privacy options are available in the configured Android app.'
    );
  }

  private about(): void {
    const main = element('main', 'screen content-screen');
    main.append(this.header('About', 'Number Nexus · Version 1.1.0'));
    const card = element('section', 'about-card');
    card.innerHTML =
      '<div class="brand-mark small"><span>+</span></div><h2>Choose your challenge.</h2><p>Number Nexus is an original, offline-first collection of 1,920 mathematical logic levels across six always-open categories. Each category contains 320 unique generated-and-validated problems arranged into Easy, Normal, Advanced, and Expert tiers.</p><h3>Progression</h3><p>Categories are never locked. Levels progress independently inside each category so players can freely choose their preferred puzzle style.</p><h3>Optional rewarded ads</h3><p>The game never forces an ad between levels. A rewarded ad appears only after the player taps an optional button and grants hint tokens after completion.</p><h3>Privacy</h3><p>No account is required. Progress and settings stay on this device. Ad consent and privacy controls are provided through the configured Google consent flow.</p><h3>Accessibility</h3><p>Large text, high contrast, reduced motion, optional sound, and optional vibration are available in Settings.</p>';
    main.append(card);
    this.root.append(main);
  }

  private debug(): void {
    if (!import.meta.env.DEV) {
      this.go({ screen: 'menu' }, true);
      return;
    }

    const save = this.saves.get();
    const issues = validateCampaign(PuzzleRegistry.categories());
    const main = element('main', 'screen content-screen debug-screen');
    main.append(this.header('Puzzle Debugger', `${issues.length} validation issues`));

    const tools = element('section', 'debug-toolbar');
    const select = element('select');
    PuzzleRegistry.all().forEach((item) => {
      const option = element(
        'option',
        '',
        `${item.id} · ${TIER_LABELS[item.difficultyTier]} · ${item.title}`
      );
      option.value = item.id;
      select.append(option);
    });

    const open = element('button', 'primary-button', 'Open');
    open.addEventListener('click', () =>
      this.go({ screen: 'puzzle', puzzleId: select.value })
    );
    const complete = element('button', 'secondary-button', 'Mark complete');
    complete.addEventListener('click', () => {
      this.saves.update((draft) => {
        draft.levels[select.value] = {
          completed: true,
          bestStars: 3,
          bestHintsUsed: 0,
          attempts: 1
        };
      });
      this.debug();
    });
    const reset = element('button', 'secondary-button', 'Reset level');
    reset.addEventListener('click', () => {
      this.saves.update((draft) => {
        delete draft.levels[select.value];
      });
      this.debug();
    });

    tools.append(select, open, complete, reset);
    const report = element('pre', 'debug-report');
    report.textContent = issues.length
      ? issues.map((issue) => `${issue.puzzleId}: ${issue.message}`).join('\n')
      : `All ${PuzzleRegistry.all().length} puzzles passed duplicate and content validation.\nCompleted: ${completedCount(save)}`;
    main.append(tools, report);
    this.root.append(main);
  }

  private showDialog(title: string, message: string): void {
    const content = element('div');
    content.append(element('h2', '', title), element('p', '', message));
    const close = element('button', 'primary-button', 'Got it');
    close.addEventListener('click', () => this.closeDialog());
    content.append(close);
    this.showDialogNode(content);
  }

  private showDialogNode(content: HTMLElement, dismissible = true): void {
    this.closeDialog();
    const overlay = element('div', 'dialog-overlay');
    const dialog = element('section', 'dialog-card');
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');

    if (dismissible) {
      const close = iconButton('Close dialog', '×', 'dialog-close');
      close.addEventListener('click', () => this.closeDialog());
      dialog.append(close);
      overlay.addEventListener('pointerdown', (event) => {
        if (event.target === overlay) this.closeDialog();
      });
    }

    dialog.append(content);
    overlay.append(dialog);
    document.body.append(overlay);
    this.dialog = overlay;
    dialog.querySelector<HTMLElement>('button')?.focus();
  }

  private closeDialog(): void {
    this.dialog?.remove();
    this.dialog = null;
  }

  private applySettings(save: GameSave): void {
    const classes = document.documentElement.classList;
    classes.toggle('large-text', save.settings.largeText);
    classes.toggle('high-contrast', save.settings.highContrast);
    classes.toggle('reduced-motion', save.settings.reducedMotion);
    this.audio.setVolume(save.settings.soundVolume);
    this.audio.setMusicVolume(save.settings.musicVolume);
    this.haptics.setEnabled(save.settings.vibration);
  }
}
