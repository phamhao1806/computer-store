import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';

function TestAuthConsumer() {
  const { user, token, loading, login, logout, isAdmin } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user">{user ? user.name : 'none'}</span>
      <span data-testid="token">{token || 'none'}</span>
      <span data-testid="isAdmin">{String(isAdmin)}</span>
      <button
        data-testid="login"
        onClick={() => login({ name: 'Admin User', role: 'admin', email: 'admin@test.com' }, 'jwt-token-123')}
      >
        Login
      </button>
      <button
        data-testid="login-customer"
        onClick={() => login({ name: 'Customer', role: 'customer', email: 'cust@test.com' }, 'jwt-token-456')}
      >
        Login Customer
      </button>
      <button data-testid="logout" onClick={logout}>Logout</button>
    </div>
  );
}

function renderAuth() {
  return render(
    <AuthProvider>
      <TestAuthConsumer />
    </AuthProvider>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with no user and loading=false after mount', async () => {
    renderAuth();
    expect(screen.getByTestId('loading').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('none');
    expect(screen.getByTestId('token').textContent).toBe('none');
  });

  it('login sets user and token', async () => {
    renderAuth();
    await act(async () => {
      screen.getByTestId('login').click();
    });
    expect(screen.getByTestId('user').textContent).toBe('Admin User');
    expect(screen.getByTestId('token').textContent).toBe('jwt-token-123');
  });

  it('login persists to localStorage', async () => {
    renderAuth();
    await act(async () => {
      screen.getByTestId('login').click();
    });
    const stored = JSON.parse(localStorage.getItem('auth'));
    expect(stored.user.name).toBe('Admin User');
    expect(stored.token).toBe('jwt-token-123');
  });

  it('logout clears user and token', async () => {
    renderAuth();
    await act(async () => {
      screen.getByTestId('login').click();
    });
    await act(async () => {
      screen.getByTestId('logout').click();
    });
    expect(screen.getByTestId('user').textContent).toBe('none');
    expect(screen.getByTestId('token').textContent).toBe('none');
  });

  it('logout removes from localStorage', async () => {
    renderAuth();
    await act(async () => {
      screen.getByTestId('login').click();
    });
    await act(async () => {
      screen.getByTestId('logout').click();
    });
    expect(localStorage.getItem('auth')).toBeNull();
  });

  it('isAdmin is true for admin role', async () => {
    renderAuth();
    await act(async () => {
      screen.getByTestId('login').click();
    });
    expect(screen.getByTestId('isAdmin').textContent).toBe('true');
  });

  it('isAdmin is false for customer role', async () => {
    renderAuth();
    await act(async () => {
      screen.getByTestId('login-customer').click();
    });
    expect(screen.getByTestId('isAdmin').textContent).toBe('false');
  });

  it('isAdmin is false when not logged in', () => {
    renderAuth();
    expect(screen.getByTestId('isAdmin').textContent).toBe('false');
  });

  it('restores auth from localStorage on mount', async () => {
    localStorage.setItem('auth', JSON.stringify({
      user: { name: 'Saved User', role: 'customer', email: 'saved@test.com' },
      token: 'saved-token'
    }));
    renderAuth();
    expect(screen.getByTestId('user').textContent).toBe('Saved User');
    expect(screen.getByTestId('token').textContent).toBe('saved-token');
  });
});
