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
