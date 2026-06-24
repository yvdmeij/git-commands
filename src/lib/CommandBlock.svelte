<script lang="ts">
  interface Props {
    command: string;
    description: string;
    isCopied: boolean;
    onCopy: () => void;
  }

  let { command, description, isCopied, onCopy }: Props = $props();

  // Tokenise the command string into coloured spans
  interface Token { text: string; type: 'keyword' | 'sub' | 'flag' | 'arg' | 'punct' | 'plain' }

  function tokenize(cmd: string): Token[] {
    const tokens: Token[] = [];
    const parts = cmd.split(' ');

    parts.forEach((part, i) => {
      if (i > 0) tokens.push({ text: ' ', type: 'plain' });

      if (i === 0) {
        tokens.push({ text: part, type: 'keyword' });
      } else if (i === 1 && !part.startsWith('-') && !part.startsWith('<')) {
        // subcommand (e.g. "remote", "stash", "worktree")
        tokens.push({ text: part, type: 'sub' });
      } else if (part.startsWith('--') || (part.startsWith('-') && part.length <= 3)) {
        tokens.push({ text: part, type: 'flag' });
      } else if (part.startsWith('<') && part.endsWith('>')) {
        tokens.push({ text: part, type: 'arg' });
      } else if (part.startsWith('<') || part.endsWith('>')) {
        tokens.push({ text: part, type: 'arg' });
      } else if (part === '/' || part === 'unlock') {
        tokens.push({ text: part, type: 'punct' });
      } else if (part.startsWith('"') || part.startsWith("'")) {
        tokens.push({ text: part, type: 'arg' });
      } else {
        tokens.push({ text: part, type: 'plain' });
      }
    });

    return tokens;
  }

  const tokens = $derived(tokenize(command));
</script>

<div class="block" role="group">
  <div class="code-area">
    <code class="cmd">
      {#each tokens as tok}
        <span class="tok tok-{tok.type}">{tok.text}</span>
      {/each}
    </code>
    <button
      class="copy-btn {isCopied ? 'copied' : ''}"
      onclick={onCopy}
      title="Copy command"
      aria-label="Copy command"
    >
      {#if isCopied}
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      {:else}
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
      {/if}
    </button>
  </div>
  <p class="desc">{description}</p>
</div>

<style>
  .block {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0;
    border-radius: var(--r-lg);
    border: 1px solid var(--border);
    overflow: hidden;
    background: var(--bg-code);
    transition: border-color var(--dur) var(--ease);
  }

  .block:hover {
    border-color: var(--border-2);
  }

  .code-area {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 16px;
    background: var(--bg-code);
    position: relative;
  }

  .prompt {
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--accent);
    user-select: none;
    flex: none;
    font-weight: 500;
  }

  .cmd {
    font-family: var(--font-mono);
    font-size: 13.5px;
    line-height: 1.5;
    flex: 1;
    white-space: pre-wrap;
    word-break: break-all;
  }

  /* Token colours */
  :global(.tok-keyword) { color: var(--vd-peach);  font-weight: 500; }
  :global(.tok-sub)     { color: #c9a0dc; }
  :global(.tok-flag)    { color: var(--vd-mauve); }
  :global(.tok-arg)     { color: #F59F59; }
  :global(.tok-punct)   { color: var(--ink-3); }
  :global(.tok-plain)   { color: var(--ink-2); }

  .copy-btn {
    flex: none;
    width: 28px;
    height: 28px;
    border-radius: var(--r-sm);
    background: transparent;
    border: 1px solid transparent;
    cursor: pointer;
    color: var(--ink-3);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity var(--dur) var(--ease), color var(--dur) var(--ease), background var(--dur) var(--ease), border-color var(--dur) var(--ease);
  }

  .block:hover .copy-btn {
    opacity: 1;
  }

  .copy-btn:hover {
    color: var(--ink);
    background: var(--accent-dim);
    border-color: var(--border-2);
  }

  .copy-btn.copied {
    opacity: 1;
    color: #F59F59;
  }

  .desc {
    font-size: 13px;
    color: var(--ink-2);
    padding: 10px 16px;
    border-top: 1px solid var(--border);
    line-height: 1.5;
  }
</style>
