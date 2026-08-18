import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

function TestThemeConsumer() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button data-testid="toggle" onClick={toggleTheme}>Toggle</button>
    </div>
  );
}

function renderTheme() {
  return render(
    <ThemeProvider>
      <TestThemeConsumer />
    </ThemeProvider>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('should default to dark theme when no saved preference', () => {
    renderTheme();
    expect(screen.getByTestId('theme').textContent).toBe('dark');
  });

  it('should restore saved theme from localStorage', () => {
    localStorage.setItem('theme', 'light');
    renderTheme();
    expect(screen.getByTestId('theme').textContent).toBe('light');
  });

  it('should toggle from dark to light', async () => {
    renderTheme();
    await act(async () => { screen.getByTestId('toggle').click(); });
    expect(screen.getByTestId('theme').textContent).toBe('light');
  });

  it('should toggle from light to dark', async () => {
    localStorage.setItem('theme', 'light');
    renderTheme();
    await act(async () => { screen.getByTestId('toggle').click(); });
    expect(screen.getByTestId('theme').textContent).toBe('dark');
  });

  it('should persist theme to localStorage after toggle', async () => {
    renderTheme();
    await act(async () => { screen.getByTestId('toggle').click(); });
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('should set data-theme attribute on document element', async () => {
    renderTheme();
    await act(async () => { screen.getByTestId('toggle').click(); });
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('should set data-theme to dark on initial mount', () => {
    renderTheme();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('should toggle back and forth correctly', async () => {
    renderTheme();
    await act(async () => { screen.getByTestId('toggle').click(); });
    expect(screen.getByTestId('theme').textContent).toBe('light');
    await act(async () => { screen.getByTestId('toggle').click(); });
    expect(screen.getByTestId('theme').textContent).toBe('dark');
  });
});
