import { AudioManager } from '../core/AudioManager';
import { HapticsManager } from '../core/HapticsManager';
import { calculateStreak, dailyPuzzleId, localDateKey } from '../progression/DailyPuzzleManager';
import {
  chapterProgress,
  completedCount,
  completionPercent,
  getLevelProgress,
  isChapterUnlocked,
  isPuzzleUnlocked,
  nextPlayablePuzzleId,
  starsForHints,
  totalStars
} from '../progression/ProgressionManager';
import { isCorrectAnswer } from '../puzzles/AnswerValidator';
import { PuzzleRegistry } from '../puzzles/PuzzleRegistry';
import type { PuzzleDefinition } from '../puzzles/PuzzleTypes';
import { validateCampaign } from '../puzzles/PuzzleValidator';
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

export class NumberNexusApp {
  private readonly router = new Router();
  private readonly saves = new SaveManager();
  private readonly audio = new AudioManager();
  private readonly haptics = new HapticsManager();
  private readonly lifecycle = new AppLifecycle();
  private scene: PuzzleScene | null = null;
  private session: Session | null = null;
  private dialog: HTMLElement | null = null;

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
    if (this.router.current.screen === 'menu' || this.router.current.screen === 'splash') return false;
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
      case 'splash': this.splash(); break;
      case 'menu': this.menu(); break;
      case 'chapters': this.chapters(); break;
      case 'levels': this.levels(route.chapterId ?? 'chapter-1'); break;
      case 'puzzle': this.puzzle(route.puzzleId ?? PuzzleRegistry.first().id, Boolean(route.daily), resume); break;
      case 'daily': this.go({ screen: 'puzzle', puzzleId: dailyPuzzleId(), daily: true }, true); break;
      case 'progress': this.progress(); break;
      case 'settings': this.settings(); break;
      case 'about': this.about(); break;
      case 'debug': this.debug(); break;
    }
  }

  private splash(): void {
    const main = element('main', 'screen splash-screen');
    main.innerHTML = '<div class="brand-mark"><span>+</span></div><h1>Number Nexus</h1><p>Connect the pattern.</p><div class="loading-dots" aria-label="Loading"><i></i><i></i><i></i></div>';
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
    top.innerHTML = '<div class="brand-lockup"><div class="mini-mark">+</div><div><span>NUMBER</span><strong>NEXUS</strong></div></div>';
    const settings = iconButton('Open settings', '⚙');
    settings.addEventListener('click', () => this.go({ screen: 'settings' }));
    top.append(settings);
    const hero = element('section', 'hero-card');
    hero.innerHTML = '<div class="eyebrow">YOUR NEXT CONNECTION</div><h1>Think beyond<br><em>the obvious.</em></h1><p>Original visual math puzzles designed for calm, satisfying play.</p>';
    const play = element('button', 'primary-button hero-action', 'Continue');
    play.addEventListener('click', () => this.go({ screen: 'puzzle', puzzleId: nextPlayablePuzzleId(save) }));
    hero.append(play);
    const stats = element('section', 'stat-strip');
    stats.innerHTML = `<div><strong>${completionPercent(save)}%</strong><span>Complete</span></div><div><strong>${totalStars(save)}</strong><span>Stars</span></div><div><strong>${save.currentStreak}</strong><span>Day streak</span></div>`;
    const grid = element('section', 'menu-grid');
    const entries: Array<[string, string, string, Route]> = [
      ['Chapters', 'Explore six puzzle worlds', '◇', { screen: 'chapters' }],
      ['Daily Puzzle', 'One fresh challenge today', '☀', { screen: 'daily' }],
      ['Progress', 'Review stars and statistics', '◔', { screen: 'progress' }],
      ['About', 'Credits, privacy, and game details', 'ⓘ', { screen: 'about' }]
    ];
    entries.forEach(([title, subtitle, icon, route]) => {
      const button = element('button', 'menu-tile');
      button.innerHTML = `<span class="tile-icon">${icon}</span><span><strong>${title}</strong><small>${subtitle}</small></span><b>›</b>`;
      button.addEventListener('click', () => this.go(route));
      grid.append(button);
    });
    if (import.meta.env.DEV) {
      const debug = element('button', 'text-button', 'Open puzzle debugger');
      debug.addEventListener('click', () => this.go({ screen: 'debug' }));
      grid.append(debug);
    }
    main.append(top, hero, stats, grid);
    this.root.append(main);
  }

  private chapters(): void {
    const save = this.saves.get();
    const main = element('main', 'screen content-screen');
    main.append(this.header('Chapters', 'Six ways to train your pattern sense'));
    const list = element('section', 'chapter-list');
    PuzzleRegistry.chapters().forEach((chapter) => {
      const unlocked = isChapterUnlocked(save, chapter.id);
      const result = chapterProgress(save, chapter.id);
      const button = element('button', `chapter-card${unlocked ? '' : ' locked'}`);
      button.disabled = !unlocked;
      button.style.setProperty('--chapter-accent', chapter.accent);
      button.innerHTML = `<span class="chapter-icon">${unlocked ? chapter.icon : '⌁'}</span><span class="chapter-copy"><small>CHAPTER ${chapter.number}</small><strong>${chapter.title}</strong><em>${chapter.subtitle}</em></span><span class="chapter-score"><b>${result.completed}/10</b><small>${result.stars}/30 ★</small></span>`;
      button.addEventListener('click', () => this.go({ screen: 'levels', chapterId: chapter.id }));
      list.append(button);
    });
    main.append(list);
    this.root.append(main);
  }

  private levels(chapterId: string): void {
    const chapter = PuzzleRegistry.chapter(chapterId) ?? PuzzleRegistry.chapters()[0]!;
    const save = this.saves.get();
    const main = element('main', 'screen content-screen');
    main.append(this.header(chapter.title, chapter.subtitle));
    const summary = chapterProgress(save, chapter.id);
    main.append(progressBar(summary.completed, 10, `${summary.completed} of 10 solved · ${summary.stars} stars`));
    const grid = element('section', 'level-grid');
    chapter.puzzles.forEach((item) => {
      const unlocked = isPuzzleUnlocked(save, item.id);
      const progress = getLevelProgress(save, item.id);
      const button = element('button', `level-tile${progress.completed ? ' complete' : ''}${unlocked ? '' : ' locked'}`);
      button.disabled = !unlocked;
      button.innerHTML = `<span>${unlocked ? item.levelNumber : '⌁'}</span><small>${progress.completed ? formatStars(progress.bestStars) : unlocked ? 'Ready' : 'Locked'}</small>`;
      button.addEventListener('click', () => this.go({ screen: 'puzzle', puzzleId: item.id }));
      grid.append(button);
    });
    main.append(grid);
    this.root.append(main);
  }

  private puzzle(puzzleId: string, daily: boolean, resume: boolean): void {
    const definition = PuzzleRegistry.get(puzzleId) ?? PuzzleRegistry.first();
    if (!resume || !this.session || this.session.puzzle.id !== definition.id) {
      this.session = { puzzle: definition, answer: '', hintsUsed: 0, revealedHints: 0, solved: false, daily };
    }
    const session = this.session;
    const chapter = PuzzleRegistry.chapter(definition.chapterId);
    const main = element('main', 'screen puzzle-screen');
    const top = element('header', 'puzzle-header');
    const back = iconButton('Leave puzzle', '‹');
    back.addEventListener('click', () => this.back());
    const copy = element('div');
    copy.innerHTML = `<small>${daily ? 'DAILY PUZZLE' : chapter?.title ?? 'NUMBER NEXUS'}</small><strong>${definition.title}</strong>`;
    top.append(back, copy, element('span', 'level-counter', daily ? 'TODAY' : `${definition.levelNumber}/10`));
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
      wrap.querySelector<HTMLElement>(`[data-answer="${CSS.escape(value)}"]`)?.classList.add('selected');
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
          else if (key === '−') this.session.answer = this.session.answer.startsWith('-') ? this.session.answer.slice(1) : `-${this.session.answer}`;
          else if (!(key === '.' && this.session.answer.includes('.'))) this.session.answer += key;
          display.textContent = this.session.answer || 'Your answer';
          display.classList.toggle('empty', !this.session.answer);
          this.audio.play('key');
        });
        keypad.append(button);
      });
      wrap.append(keypad);
      return wrap;
    }
    const choices = element('div', puzzle.answerMode === 'drag-and-drop' ? 'choice-grid draggable-choices' : 'choice-grid');
    (puzzle.choices ?? []).forEach((value) => {
      const text = String(value);
      const button = element('button', 'choice-chip', text);
      button.dataset.answer = text;
      button.draggable = puzzle.answerMode === 'drag-and-drop';
      button.addEventListener('click', () => choose(text));
      button.addEventListener('dragstart', (event) => event.dataTransfer?.setData('text/plain', text));
      choices.append(button);
    });
    if (puzzle.answerMode === 'drag-and-drop') {
      display.classList.add('drop-zone');
      display.addEventListener('dragover', (event) => event.preventDefault());
      display.addEventListener('drop', (event) => {
        event.preventDefault();
        choose(event.dataTransfer?.getData('text/plain') ?? '');
      });
    }
    wrap.append(choices);
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
      this.showDialog('No hint tokens', 'Solve daily puzzles, chapters, and star milestones to earn more.');
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
      feedback.textContent = ['Not quite. Look again.', 'Try another pattern.', 'That answer does not match the rule.'][Math.floor(Math.random() * 3)]!;
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
    const chapter = PuzzleRegistry.chapter(session.puzzle.chapterId)!;
    const chapterWasComplete = chapter.puzzles.every((item) => before.levels[item.id]?.completed);
    const updated = this.saves.update((draft) => {
      const old = draft.levels[session.puzzle.id];
      draft.levels[session.puzzle.id] = {
        completed: true,
        bestStars: Math.max(old?.bestStars ?? 0, stars) as 1 | 2 | 3,
        bestHintsUsed: Math.min(old?.bestHintsUsed ?? 99, session.hintsUsed),
        attempts: Math.max(1, old?.attempts ?? 0),
        completedAt: old?.completedAt ?? new Date().toISOString()
      };
      draft.lastPlayedLevel = PuzzleRegistry.next(session.puzzle.id)?.id ?? session.puzzle.id;
      if (!wasComplete && session.hintsUsed === 0) draft.statistics.solvedWithoutHints += 1;
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
    const chapterNowComplete = chapter.puzzles.every((item) => updated.levels[item.id]?.completed);
    const newStars = totalStars(updated);
    if (!chapterWasComplete && chapterNowComplete) {
      this.saves.update((draft) => { draft.hintTokens += 2; });
      this.audio.play('chapter');
    } else this.audio.play('correct');
    if (Math.floor(newStars / 15) > Math.floor(oldStars / 15)) this.saves.update((draft) => { draft.hintTokens += 1; });
    void this.haptics.success();
    this.scene?.celebrate();
    window.setTimeout(() => this.solution(stars, chapterNowComplete && !chapterWasComplete), 350);
  }

  private solution(stars: number, chapterComplete: boolean): void {
    const session = this.session;
    if (!session) return;
    const content = element('div', 'solution');
    content.innerHTML = `<div class="success-mark">✓</div><small>${chapterComplete ? 'CHAPTER COMPLETE' : 'CONNECTION FOUND'}</small><h2>Correct</h2><div class="earned-stars">${formatStars(stars)}</div><p>${session.puzzle.explanation}</p><ol>${session.puzzle.solutionSteps.map((step) => `<li>${step}</li>`).join('')}</ol>`;
    const actions = element('div', 'dialog-actions');
    const select = element('button', 'secondary-button', 'Level Select');
    select.addEventListener('click', () => { this.closeDialog(); this.go({ screen: 'levels', chapterId: session.puzzle.chapterId }, true); });
    const replay = element('button', 'secondary-button', 'Replay');
    replay.addEventListener('click', () => { this.closeDialog(); this.session = null; this.render(this.router.current); });
    const nextPuzzle = PuzzleRegistry.next(session.puzzle.id);
    const next = element('button', 'primary-button', nextPuzzle && !session.daily ? 'Next Level' : 'Main Menu');
    next.addEventListener('click', () => {
      this.closeDialog();
      this.session = null;
      if (nextPuzzle && !session.daily) this.go({ screen: 'puzzle', puzzleId: nextPuzzle.id }, true);
      else this.go({ screen: 'menu' }, true);
    });
    actions.append(select, replay, next);
    content.append(actions);
    this.showDialogNode(content, false);
  }

  private progress(): void {
    const save = this.saves.get();
    const main = element('main', 'screen content-screen');
    main.append(this.header('Progress', 'Every connection makes the next one clearer'));
    const overview = element('section', 'progress-overview');
    overview.innerHTML = `<div class="progress-ring" style="--progress:${completionPercent(save) * 3.6}deg"><span>${completionPercent(save)}%</span></div><div><strong>${completedCount(save)} / 60</strong><span>Puzzles solved</span><strong>${totalStars(save)} / 180</strong><span>Stars earned</span></div>`;
    const stats = element('section', 'stats-grid');
    const values: Array<[string, string]> = [
      [String(save.statistics.solvedWithoutHints), 'Solved without hints'],
      [String(save.statistics.totalHintsUsed), 'Hints used'],
      [String(save.currentStreak), 'Current streak'],
      [String(save.longestStreak), 'Longest streak'],
      [String(save.statistics.dailySolved), 'Daily puzzles']
    ];
    values.forEach(([value, label]) => stats.append(Object.assign(element('article'), { innerHTML: `<strong>${value}</strong><span>${label}</span>` })));
    const chapters = element('section', 'chapter-progress-list');
    PuzzleRegistry.chapters().forEach((chapter) => {
      const result = chapterProgress(save, chapter.id);
      chapters.append(progressBar(result.completed, 10, `${chapter.number}. ${chapter.title} · ${result.stars}/30 ★`));
    });
    main.append(overview, stats, chapters);
    this.root.append(main);
  }

  private settings(): void {
    const save = this.saves.get();
    const main = element('main', 'screen content-screen');
    main.append(this.header('Settings', 'Tune Number Nexus for your device'));
    const form = element('section', 'settings-card');
    const range = (label: string, value: number, update: (value: number) => void): HTMLElement => {
      const row = element('label', 'setting-row');
      const copy = element('span'); copy.innerHTML = `<strong>${label}</strong><small>${Math.round(value * 100)}%</small>`;
      const input = element('input'); input.type = 'range'; input.min = '0'; input.max = '1'; input.step = '0.05'; input.value = String(value);
      input.addEventListener('input', () => { const next = Number(input.value); copy.querySelector('small')!.textContent = `${Math.round(next * 100)}%`; update(next); });
      row.append(copy, input); return row;
    };
    form.append(
      range('Music volume', save.settings.musicVolume, (value) => { this.saves.update((draft) => { draft.settings.musicVolume = value; }); this.audio.setMusicVolume(value); }),
      range('Sound effects', save.settings.soundVolume, (value) => { this.saves.update((draft) => { draft.settings.soundVolume = value; }); this.audio.setVolume(value); this.audio.play('tap'); })
    );
    const toggles: Array<[keyof Pick<GameSettings, 'vibration' | 'reducedMotion' | 'highContrast' | 'largeText'>, string, string]> = [
      ['vibration', 'Vibration', 'Gentle feedback for answers and taps'],
      ['reducedMotion', 'Reduced motion', 'Minimize pulsing and transition effects'],
      ['highContrast', 'High contrast', 'Strengthen borders and text separation'],
      ['largeText', 'Large text', 'Increase interface text size']
    ];
    toggles.forEach(([key, title, description]) => {
      const row = element('label', 'setting-row toggle-row');
      const copy = element('span'); copy.innerHTML = `<strong>${title}</strong><small>${description}</small>`;
      const input = element('input'); input.type = 'checkbox'; input.checked = save.settings[key];
      input.addEventListener('change', () => {
        const updated = this.saves.update((draft) => { draft.settings[key] = input.checked; });
        this.applySettings(updated);
      });
      row.append(copy, input); form.append(row);
    });
    const reset = element('button', 'danger-button', 'Reset all progress');
    reset.addEventListener('click', () => {
      const content = element('div');
      content.innerHTML = '<h2>Reset everything?</h2><p>This removes stars, unlocked levels, daily history, and settings stored on this device.</p>';
      const actions = element('div', 'dialog-actions');
      const cancel = element('button', 'secondary-button', 'Cancel'); cancel.addEventListener('click', () => this.closeDialog());
      const confirm = element('button', 'danger-button', 'Reset progress'); confirm.addEventListener('click', () => { this.applySettings(this.saves.reset()); this.closeDialog(); this.go({ screen: 'menu' }, true); });
      actions.append(cancel, confirm); content.append(actions); this.showDialogNode(content);
    });
    form.append(reset);
    main.append(form);
    this.root.append(main);
  }

  private about(): void {
    const main = element('main', 'screen content-screen');
    main.append(this.header('About', 'Number Nexus · Version 1.0.0'));
    const card = element('section', 'about-card');
    card.innerHTML = '<div class="brand-mark small"><span>+</span></div><h2>Connect the pattern.</h2><p>Number Nexus is an original, offline-first collection of sixty handcrafted mathematical logic puzzles for phones and tablets.</p><h3>Privacy</h3><p>No account is required. Progress and settings stay on this device. The initial release contains no analytics, advertising SDK, or remote tracking.</p><h3>Accessibility</h3><p>Large text, high contrast, reduced motion, optional sound, and optional vibration are available in Settings.</p><h3>Credits</h3><p>Design, puzzle system, procedural visuals, and programmatic audio were created specifically for Number Nexus. No third-party game art or copied puzzle screens are included.</p>';
    main.append(card);
    this.root.append(main);
  }

  private debug(): void {
    if (!import.meta.env.DEV) { this.go({ screen: 'menu' }, true); return; }
    const save = this.saves.get();
    const issues = validateCampaign(PuzzleRegistry.chapters());
    const main = element('main', 'screen content-screen debug-screen');
    main.append(this.header('Puzzle Debugger', `${issues.length} validation issues`));
    const tools = element('section', 'debug-toolbar');
    const select = element('select');
    PuzzleRegistry.all().forEach((item) => { const option = element('option', '', `${item.id} · ${item.title}`); option.value = item.id; select.append(option); });
    const open = element('button', 'primary-button', 'Open'); open.addEventListener('click', () => this.go({ screen: 'puzzle', puzzleId: select.value }));
    const complete = element('button', 'secondary-button', 'Mark complete'); complete.addEventListener('click', () => { this.saves.update((draft) => { draft.levels[select.value] = { completed: true, bestStars: 3, bestHintsUsed: 0, attempts: 1 }; }); this.debug(); });
    const reset = element('button', 'secondary-button', 'Reset level'); reset.addEventListener('click', () => { this.saves.update((draft) => { delete draft.levels[select.value]; }); this.debug(); });
    tools.append(select, open, complete, reset);
    const report = element('pre', 'debug-report');
    report.textContent = issues.length ? issues.map((issue) => `${issue.puzzleId}: ${issue.message}`).join('\n') : `All ${PuzzleRegistry.all().length} puzzles passed validation.\nCompleted: ${completedCount(save)}`;
    main.append(tools, report);
    this.root.append(main);
  }

  private showDialog(title: string, message: string): void {
    const content = element('div');
    content.append(element('h2', '', title), element('p', '', message));
    const close = element('button', 'primary-button', 'Got it'); close.addEventListener('click', () => this.closeDialog());
    content.append(close); this.showDialogNode(content);
  }

  private showDialogNode(content: HTMLElement, dismissible = true): void {
    this.closeDialog();
    const overlay = element('div', 'dialog-overlay');
    const dialog = element('section', 'dialog-card');
    dialog.setAttribute('role', 'dialog'); dialog.setAttribute('aria-modal', 'true');
    if (dismissible) {
      const close = iconButton('Close dialog', '×', 'dialog-close'); close.addEventListener('click', () => this.closeDialog()); dialog.append(close);
      overlay.addEventListener('pointerdown', (event) => { if (event.target === overlay) this.closeDialog(); });
    }
    dialog.append(content); overlay.append(dialog); document.body.append(overlay); this.dialog = overlay;
    dialog.querySelector<HTMLElement>('button')?.focus();
  }

  private closeDialog(): void { this.dialog?.remove(); this.dialog = null; }

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
