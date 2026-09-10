'use strict';

const root = document.documentElement;
const themeButton = document.querySelector('.theme-toggle');
const themeColor = document.querySelector('meta[name="theme-color"]');
let preferredTheme = 'dark';

try {
  const savedTheme = localStorage.getItem('vantan-theme');
  if (savedTheme === 'light' || savedTheme === 'dark') preferredTheme = savedTheme;
} catch {
}

function applyTheme(theme) {
  root.dataset.theme = theme;
  themeColor.content = theme === 'dark' ? '#141414' : '#f6f6f3';
  const label = `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`;
  themeButton.setAttribute('aria-label', label);
  themeButton.title = label;
}

applyTheme(preferredTheme);
themeButton.hidden = false;
themeButton.addEventListener('click', () => {
  preferredTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(preferredTheme);
  try {
    localStorage.setItem('vantan-theme', preferredTheme);
  } catch {
  }
});

const codeWindow = document.querySelector('.code-window');
const pauseButton = document.querySelector('.code-pause');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const codeLines = [...document.querySelectorAll('.code-text')].map(line => {
  const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT);
  const tokens = [];
  while (walker.nextNode()) tokens.push({ node: walker.currentNode, text: walker.currentNode.textContent });
  return { element: line.parentElement, tokens, length: tokens.reduce((sum, token) => sum + token.text.length, 0) };
});
const codeLength = codeLines.reduce((sum, line) => sum + line.length + 1, 0);
let typedCharacters = 0;
let codeTimer;
let codePaused = false;

function renderCode() {
  let remaining = typedCharacters;
  for (const line of codeLines) {
    const atEnd = typedCharacters === codeLength && line === codeLines[codeLines.length - 1];
    line.element.classList.toggle('is-current', !motionPreference.matches && (atEnd || (remaining >= 0 && remaining <= line.length)));
    for (const token of line.tokens) {
      token.node.textContent = token.text.slice(0, Math.max(0, remaining));
      remaining -= token.text.length;
    }
    remaining -= 1;
  }
}

function typeCode() {
  if (typedCharacters >= codeLength) return;
  typedCharacters += 1;
  renderCode();
  if (typedCharacters < codeLength) codeTimer = window.setTimeout(typeCode, 38);
}

function syncCodeAnimation() {
  window.clearTimeout(codeTimer);
  const reduced = motionPreference.matches;
  pauseButton.hidden = reduced;
  codeWindow.classList.toggle('is-typing', !reduced);
  codeWindow.classList.toggle('is-paused', codePaused);
  if (reduced) {
    typedCharacters = codeLength;
  } else if (!codePaused && !document.hidden && typedCharacters < codeLength) {
    codeTimer = window.setTimeout(typeCode, 250);
  }
  renderCode();
}

pauseButton.addEventListener('click', () => {
  codePaused = !codePaused;
  pauseButton.textContent = codePaused ? 'Play' : 'Pause';
  pauseButton.setAttribute('aria-label', `${codePaused ? 'Play' : 'Pause'} code animation`);
  syncCodeAnimation();
});
motionPreference.addEventListener('change', syncCodeAnimation);
document.addEventListener('visibilitychange', syncCodeAnimation);
if (!motionPreference.matches) renderCode();
syncCodeAnimation();
