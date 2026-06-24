<script lang="ts">
  import CommandBlock from './lib/CommandBlock.svelte';
  import { sections } from './lib/commands';

  let activeSection = $state<string | null>(null);
  let search = $state('');
  let copied = $state<string | null>(null);
  let light = $state(localStorage.getItem('theme') === 'light');

  if (light) document.documentElement.setAttribute('data-theme', 'light');

  function toggleTheme() {
    light = !light;
    const theme = light ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  const filtered = $derived(
    search.trim().length === 0
      ? sections
      : sections
          .map(s => ({
            ...s,
            commands: s.commands.filter(
              c =>
                c.cmd.toLowerCase().includes(search.toLowerCase()) ||
                c.desc.toLowerCase().includes(search.toLowerCase())
            ),
          }))
          .filter(s => s.commands.length > 0)
  );

  function copyCmd(cmd: string) {
    navigator.clipboard.writeText(cmd);
    copied = cmd;
    setTimeout(() => (copied = null), 1800);
  }

  function scrollTo(id: string) {
    activeSection = id;
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
</script>

<div class="shell">
  <!-- Ambient background glow -->
  <div class="bg-glow" aria-hidden="true"></div>

  <!-- Sidebar -->
  <aside class="sidebar">
    <nav class="nav">
      {#each sections as s}
        <button
          class="nav-item {activeSection === s.id ? 'active' : ''}"
          onclick={() => scrollTo(s.id)}
        >
          <span class="nav-dot"></span>
          {s.title}
        </button>
      {/each}
    </nav>

    <div class="sidebar-footer">
      <span>{sections.reduce((a, s) => a + s.commands.length, 0)} commands</span>
      <button class="theme-toggle" onclick={toggleTheme} aria-label="Toggle theme">
        {#if light}
          <!-- moon: switch back to dark -->
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        {:else}
          <!-- sun: switch to light -->
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        {/if}
      </button>
    </div>
  </aside>

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

  /* ── Sidebar ── */
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 220px;
    z-index: 10;
    display: flex;
    flex-direction: column;
    padding: 28px 16px 24px;
    border-right: 1px solid var(--border);
    background: rgba(10, 6, 16, 0.7);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  .sidebar-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 8px 28px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 20px;
  }

  .logo-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: linear-gradient(135deg, var(--vd-deep), var(--vd-mauve));
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--vd-cream);
    flex: none;
  }

  .logo-text {
    font-size: 14px;
    font-weight: 600;
    color: var(--ink);
    letter-spacing: -0.01em;
  }

  .nav {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow-y: auto;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 8px 10px;
    border-radius: var(--r-md);
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--ink-2);
    font-size: 13px;
    font-weight: 500;
    text-align: left;
    transition: background var(--dur) var(--ease), color var(--dur) var(--ease);
  }

  .nav-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--border-2);
    flex: none;
    transition: background var(--dur) var(--ease);
  }

  .nav-item:hover {
    background: var(--accent-dim);
    color: var(--ink);
  }

  .nav-item:hover .nav-dot,
  .nav-item.active .nav-dot {
    background: var(--accent);
  }

  .nav-item.active {
    background: var(--accent-dim);
    color: var(--vd-peach);
    font-weight: 600;
  }

  .sidebar-footer {
    padding: 16px 10px 0;
    border-top: 1px solid var(--border);
    font-size: 11px;
    color: var(--ink-3);
    font-weight: 500;
    letter-spacing: 0.04em;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .theme-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: var(--r-sm);
    background: transparent;
    border: 1px solid transparent;
    cursor: pointer;
    color: var(--ink-3);
    transition: color var(--dur) var(--ease), background var(--dur) var(--ease), border-color var(--dur) var(--ease);
    flex: none;
  }

  .theme-toggle:hover {
    color: var(--accent);
    background: var(--accent-dim);
    border-color: var(--border-2);
  }

  /* ── Main ── */
  .main {
    flex: 1;
    margin-left: 220px;
    padding: 0 48px 96px;
    position: relative;
    z-index: 1;
    max-width: calc(100% - 220px);
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
    max-width: 800px;
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
    bottom: 28px;
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

  :global([data-theme="light"]) .sidebar {
    background: rgba(255, 255, 255, 0.92);
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

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .sidebar {
      display: none;
    }
    .main {
      margin-left: 0;
      max-width: 100%;
      padding: 0 24px 80px;
    }
  }

  @media (max-width: 600px) {
    .main {
      padding: 0 16px 64px;
    }
    .hero {
      padding: 40px 0 40px;
    }
  }
</style>
