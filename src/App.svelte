<script lang="ts">
import {
  GitBranch,
  GitMerge,
  Globe,
  History,
  Layers,
  Layout,
  RotateCcw,
  Shield,
  Upload,
} from 'lucide-svelte';
import CommandBlock from './lib/CommandBlock.svelte';
import { sections } from './lib/commands';

const iconMap: Record<string, typeof Globe> = {
  globe: Globe,
  upload: Upload,
  'git-branch': GitBranch,
  history: History,
  layers: Layers,
  layout: Layout,
  'rotate-ccw': RotateCcw,
  'git-merge': GitMerge,
  shield: Shield,
};

let activeSection = $state<string>(sections[0].id);
let menuOpen = $state(false);
let search = $state('');

let copied = $state<string | null>(null);
const savedTheme = localStorage.getItem('theme');
const initialLight = savedTheme
  ? savedTheme === 'light'
  : window.matchMedia('(prefers-color-scheme: light)').matches;
let light = $state(initialLight);

document.documentElement.setAttribute('data-theme', initialLight ? 'light' : 'dark');

function applyTheme() {
  light = !light;
  const theme = light ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

type ViewTransitionDoc = Document & {
  startViewTransition?: (cb: () => void) => { ready: Promise<void> };
};

function toggleTheme(e: MouseEvent) {
  const doc = document as ViewTransitionDoc;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Fallback for browsers without the View Transitions API (or reduced motion)
  if (!doc.startViewTransition || reduced) {
    applyTheme();
    return;
  }

  // Circular reveal expanding from the toggle button
  const x = e.clientX;
  const y = e.clientY;
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );

  const transition = doc.startViewTransition(() => applyTheme());
  transition.ready.then(() => {
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 520,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        pseudoElement: '::view-transition-new(root)',
      },
    );
  });
}

$effect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) activeSection = entry.target.id;
      });
    },
    { rootMargin: '-20% 0px -65% 0px', threshold: 0 },
  );
  sections.forEach((s) => {
    const el = document.getElementById(s.id);
    if (el) observer.observe(el);
  });
  return () => observer.disconnect();
});

const filtered = $derived(
  search.trim().length === 0
    ? sections
    : sections
        .map((s) => ({
          ...s,
          commands: s.commands.filter(
            (c) =>
              c.cmd.toLowerCase().includes(search.toLowerCase()) ||
              c.desc.toLowerCase().includes(search.toLowerCase()),
          ),
        }))
        .filter((s) => s.commands.length > 0),
);

function copyCmd(cmd: string) {
  navigator.clipboard.writeText(cmd);
  copied = cmd;
  setTimeout(() => (copied = null), 1800);
}

function scrollTo(id: string) {
  activeSection = id;
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
</script>

<div class="shell">
  <!-- Ambient background glow -->
  <div class="bg-glow" aria-hidden="true"></div>

  <!-- Main content -->
  <main class="main">
    <!-- Header -->
    <header class="hero">
      <p class="hero-eyebrow">Cheatsheet</p>
      <h1 class="hero-title">Git Commands</h1>
      <p class="hero-sub">A quick reference for everyday Git workflows.</p>

      <!-- Search -->
      <div class="search-wrap">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          class="search-input"
          type="text"
          placeholder="Search commands..."
          bind:value={search}
        />
        {#if search}
          <button class="search-clear" onclick={() => (search = '')} aria-label="Clear search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        {/if}
      </div>
    </header>

    <!-- Sections -->
    <div class="sections">
      {#if filtered.length === 0}
        <div class="no-results">No commands matched "{search}"</div>
      {/if}

      {#each filtered as section}
        <section id={section.id} class="section">
          <div class="section-head">
            <h2 class="section-title">{section.title}</h2>
            <span class="section-count">{section.commands.length}</span>
          </div>

          <div class="command-list">
            {#each section.commands as cmd}
              <CommandBlock
                command={cmd.cmd}
                description={cmd.desc}
                isCopied={copied === cmd.cmd}
                onCopy={() => copyCmd(cmd.cmd)}
              />
            {/each}
          </div>

          {#if section.notes}
            <div class="section-notes">
              {#each section.notes as note}
                <p class="note">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex:none;margin-top:2px">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {note}
                </p>
              {/each}
            </div>
          {/if}
        </section>
      {/each}
    </div>
  </main>
</div>

<!-- Copy toast -->
{#if copied}
  <div class="toast">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
    Copied to clipboard
  </div>
{/if}

<!-- FAB backdrop -->
{#if menuOpen}
  <div class="fab-backdrop" onclick={() => menuOpen = false} aria-hidden="true"></div>
{/if}

<!-- FAB nav -->
<div class="fab-nav">
  <div class="fab-bar">
    <button class="fab-theme {light ? 'is-light' : ''}" onclick={toggleTheme} aria-label="Toggle theme">
      <span class="theme-icon theme-icon--moon" aria-hidden="true">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </span>
      <span class="theme-icon theme-icon--sun" aria-hidden="true">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      </span>
    </button>
    <button class="fab-btn {menuOpen ? 'is-open' : ''}" onclick={() => menuOpen = !menuOpen} aria-label="Toggle menu">
      <span class="fab-cross" aria-hidden="true">
        <span class="fab-cross-bar fab-cross-bar--h"></span>
        <span class="fab-cross-bar fab-cross-bar--v"></span>
      </span>
    </button>
  </div>

  {#if menuOpen}
    <div class="fab-menu">
      {#each sections as s}
        {@const Icon = iconMap[s.icon]}
        <button
          class="fab-menu-item {activeSection === s.id ? 'active' : ''}"
          onclick={() => { scrollTo(s.id); menuOpen = false; }}
        >
          <Icon size={14} strokeWidth={2} />
          {s.title}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .shell {
    display: flex;
    min-height: 100vh;
    position: relative;
  }

  /* ── Background glow ── */
  .bg-glow {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background:
      radial-gradient(ellipse 60% 50% at 20% 20%, rgba(80, 45, 85, 0.35) 0%, transparent 60%),
      radial-gradient(ellipse 40% 60% at 80% 80%, rgba(147, 80, 115, 0.18) 0%, transparent 55%),
      linear-gradient(160deg, #0a0610 0%, #110819 50%, #09060f 100%);
  }

  /* ── FAB nav ── */
  .fab-backdrop {
    position: fixed;
    inset: 0;
    z-index: 99;
  }

  .fab-nav {
    position: fixed;
    top: 24px;
    right: 24px;
    z-index: 100;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
  }

  .fab-menu {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 6px;
    border-radius: var(--r-lg);
    background: rgba(40, 15, 58, 0.92);
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid rgba(147, 80, 115, 0.25);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(147, 80, 115, 0.15);
    animation: fab-menu-in var(--dur) var(--ease-out);
    transform-origin: top right;
  }

  @keyframes fab-menu-in {
    from { opacity: 0; transform: scale(0.92) translateY(-8px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }

  .fab-menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 16px 9px 12px;
    border-radius: var(--r-md);
    background: transparent;
    border: none;
    cursor: pointer;
    color: rgba(248, 244, 233, 0.6);
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
    width: 100%;
    transition: color var(--dur) var(--ease), background var(--dur) var(--ease);
  }

  .fab-menu-item:hover {
    color: rgba(248, 244, 233, 0.9);
    background: rgba(147, 80, 115, 0.15);
  }

  .fab-menu-item.active {
    background: rgba(147, 80, 115, 0.38);
    color: #F8F4E9;
  }

  .fab-bar {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .fab-theme {
    position: relative;
    width: 34px;
    height: 34px;
    background: transparent;
    border: none;
    cursor: pointer;
    color: rgba(248, 244, 233, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color var(--dur) var(--ease), transform var(--dur) var(--ease);
  }

  .fab-theme:hover {
    color: rgba(248, 244, 233, 0.95);
    transform: scale(1.12);
  }

  /* Sun ↔ moon crossfade */
  .theme-icon {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity var(--dur-slow) var(--ease),
                transform var(--dur-slow) var(--ease);
  }

  .theme-icon--moon {
    opacity: 0;
    transform: rotate(-90deg) scale(0.4);
  }
  .theme-icon--sun {
    opacity: 1;
    transform: rotate(0deg) scale(1);
  }

  .fab-theme.is-light .theme-icon--moon {
    opacity: 1;
    transform: rotate(0deg) scale(1);
  }
  .fab-theme.is-light .theme-icon--sun {
    opacity: 0;
    transform: rotate(90deg) scale(0.4);
  }

  .fab-btn {
    width: 40px;
    height: 40px;
    background: transparent;
    border: none;
    cursor: pointer;
    color: rgba(248, 244, 233, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color var(--dur) var(--ease), transform var(--dur) var(--ease);
  }

  .fab-btn:hover {
    color: #F8F4E9;
    transform: scale(1.12);
  }

  /* Plus → X morph */
  .fab-cross {
    position: relative;
    width: 16px;
    height: 16px;
    transition: transform var(--dur-slow) var(--ease);
  }

  .fab-cross-bar {
    position: absolute;
    top: 50%;
    left: 50%;
    background: currentColor;
    border-radius: var(--r-pill);
    transition: transform var(--dur-slow) var(--ease);
  }

  .fab-cross-bar--h {
    width: 16px;
    height: 2.5px;
    transform: translate(-50%, -50%);
  }
  .fab-cross-bar--v {
    width: 2.5px;
    height: 16px;
    transform: translate(-50%, -50%);
  }

  /* Spin 135° so the plus sweeps round and lands as an X */
  .fab-btn.is-open .fab-cross {
    transform: rotate(135deg);
  }
  /* Collapse one bar slightly for a tighter, balanced ✕ */
  .fab-btn.is-open .fab-cross-bar--v {
    transform: translate(-50%, -50%) scaleY(0.92);
  }

  /* ── Main ── */
  .main {
    flex: 1;
    padding: 0 48px 120px;
    position: relative;
    z-index: 1;
    max-width: 100%;
  }

  /* ── Hero ── */
  .hero {
    padding: 72px 0 56px;
    max-width: 680px;
  }

  .hero-eyebrow {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: var(--accent);
    margin-bottom: 14px;
  }

  .hero-title {
    font-size: clamp(36px, 5vw, 56px);
    font-weight: 700;
    letter-spacing: -0.025em;
    line-height: 1.05;
    color: var(--ink);
    margin-bottom: 14px;
    background: linear-gradient(135deg, var(--vd-cream) 0%, var(--vd-peach) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero-sub {
    font-size: 16px;
    color: var(--ink-2);
    margin-bottom: 36px;
    line-height: 1.6;
  }

  /* ── Search ── */
  .search-wrap {
    position: relative;
    display: flex;
    align-items: center;
    max-width: 480px;
    background: var(--bg-card);
    border: 1px solid var(--border-2);
    border-radius: var(--r-lg);
    padding: 0 14px;
    transition: border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease);
  }

  .search-wrap:focus-within {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-dim);
  }

  .search-icon {
    color: var(--ink-3);
    flex: none;
  }

  .search-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    padding: 12px 10px;
    font-size: 14px;
    color: var(--ink);
  }

  .search-input::placeholder {
    color: var(--ink-3);
  }

  .search-clear {
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--ink-3);
    display: flex;
    align-items: center;
    padding: 4px;
    border-radius: 4px;
    transition: color var(--dur) var(--ease);
  }

  .search-clear:hover {
    color: var(--ink);
  }

  /* ── Sections ── */
  .sections {
    display: flex;
    flex-direction: column;
    gap: 56px;
    max-width: 680px;
  }

  .section {
    scroll-margin-top: 32px;
  }

  .section-head {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;
  }

  .section-title {
    font-size: 18px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: var(--ink);
  }

  .section-count {
    font-size: 11px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: var(--r-pill);
    background: var(--accent-dim);
    color: var(--accent);
    letter-spacing: 0.04em;
  }

  .command-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  /* ── Notes ── */
  .section-notes {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .note {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 13px;
    color: var(--ink-2);
    padding: 10px 14px;
    background: rgba(147, 80, 115, 0.08);
    border: 1px solid rgba(147, 80, 115, 0.2);
    border-radius: var(--r-md);
  }

  .no-results {
    color: var(--ink-3);
    font-size: 15px;
    padding: 48px 0;
  }

  /* ── Toast ── */
  .toast {
    position: fixed;
    bottom: 32px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--bg-card);
    border: 1px solid var(--border-2);
    color: var(--vd-peach);
    border-radius: var(--r-pill);
    padding: 10px 20px;
    font-size: 13px;
    font-weight: 500;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    animation: toast-in var(--dur-slow) var(--ease-out);
  }

  @keyframes toast-in {
    from { opacity: 0; transform: translateX(-50%) translateY(12px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }

  /* ── Light mode overrides ── */
  :global([data-theme="light"]) .bg-glow {
    background: linear-gradient(135deg, #ffffff 0%, #F8F4E9 20%, #F6DBC0 45%, #935073 75%, #502D55 88%, #1D1A39 100%);
  }

  :global([data-theme="light"]) .fab-menu {
    background: rgba(255, 255, 255, 0.92);
    border-color: rgba(147, 80, 115, 0.2);
    box-shadow: 0 8px 32px rgba(80, 45, 85, 0.15);
  }

  :global([data-theme="light"]) .fab-menu-item {
    color: rgba(26, 14, 36, 0.6);
  }

  :global([data-theme="light"]) .fab-menu-item:hover {
    color: #1a0e24;
    background: rgba(147, 80, 115, 0.08);
  }

  :global([data-theme="light"]) .fab-menu-item.active {
    background: #1D1A39;
    color: #F8F4E9;
  }

  :global([data-theme="light"]) .fab-theme {
    color: rgba(26, 14, 36, 0.55);
  }

  :global([data-theme="light"]) .fab-theme:hover {
    color: #1a0e24;
  }

  :global([data-theme="light"]) .fab-btn {
    color: rgba(26, 14, 36, 0.85);
  }

  :global([data-theme="light"]) .fab-btn:hover {
    color: #1a0e24;
  }

  :global([data-theme="light"]) .search-wrap,
  :global([data-theme="light"] .block),
  :global([data-theme="light"] .code-area) {
    background: #ffffff;
  }

  :global([data-theme="light"]) .hero-title {
    background: linear-gradient(135deg, #502D55 0%, #935073 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  :global([data-theme="light"] .tok-keyword) { color: var(--tok-cmd); }
  :global([data-theme="light"] .tok-sub)     { color: var(--tok-sub); }
  :global([data-theme="light"] .tok-arg)     { color: var(--tok-arg); }
  :global([data-theme="light"] .copy-btn.copied) { color: var(--tok-arg); }

  /* ── Theme view-transition (circular reveal) ── */
  /* Disable the default cross-fade so the clip-path circle reads cleanly */
  :global(::view-transition-old(root)),
  :global(::view-transition-new(root)) {
    animation: none;
    mix-blend-mode: normal;
  }
  /* New (incoming) theme is revealed on top by the expanding circle */
  :global(::view-transition-old(root)) {
    z-index: 1;
  }
  :global(::view-transition-new(root)) {
    z-index: 9999;
  }

  @media (prefers-reduced-motion: reduce) {
    .theme-icon,
    .fab-cross,
    .fab-cross-bar {
      transition: none;
    }
  }

  /* ── Responsive ── */
  @media (max-width: 600px) {
    .main {
      padding: 0 16px 120px;
    }
    .hero {
      padding: 40px 0 40px;
    }
  }
</style>
