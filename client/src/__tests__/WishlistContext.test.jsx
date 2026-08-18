import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { WishlistProvider, useWishlist } from '../context/WishlistContext';

const sampleProduct = { id: '1', name: 'MacBook Pro', price: 69990000, image: '/mac.jpg', brand: 'Apple', category: 'laptop' };
const sampleProduct2 = { id: '2', name: 'MX Master 3S', price: 2490000, image: '/mouse.jpg', brand: 'Logitech', category: 'accessory' };

function TestWishlistConsumer() {
  const { items, addItem, removeItem, toggleItem, isInWishlist, count } = useWishlist();
  return (
    <div>
      <span data-testid="count">{count}</span>
      <span data-testid="item-count">{items.length}</span>
      <span data-testid="in-wishlist">{isInWishlist('1') ? 'yes' : 'no'}</span>
      <button data-testid="add" onClick={() => addItem(sampleProduct)}>Add MacBook</button>
      <button data-testid="add-2" onClick={() => addItem(sampleProduct2)}>Add Mouse</button>
      <button data-testid="add-dup" onClick={() => addItem(sampleProduct)}>Add Again</button>
      <button data-testid="remove" onClick={() => removeItem('1')}>Remove</button>
      <button data-testid="toggle-on" onClick={() => toggleItem(sampleProduct)}>Toggle On</button>
      <button data-testid="toggle-off" onClick={() => toggleItem(sampleProduct)}>Toggle Off</button>
    </div>
  );
}

function renderWishlist() {
  return render(
    <WishlistProvider>
      <TestWishlistConsumer />
    </WishlistProvider>
  );
}

describe('WishlistContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should start with empty wishlist', () => {
    renderWishlist();
    expect(screen.getByTestId('count').textContent).toBe('0');
    expect(screen.getByTestId('item-count').textContent).toBe('0');
  });

  it('should add item to wishlist', async () => {
    renderWishlist();
    await act(async () => { screen.getByTestId('add').click(); });
    expect(screen.getByTestId('item-count').textContent).toBe('1');
    expect(screen.getByTestId('count').textContent).toBe('1');
  });

  it('should not add duplicate item', async () => {
    renderWishlist();
    await act(async () => { screen.getByTestId('add').click(); });
    await act(async () => { screen.getByTestId('add-dup').click(); });
    expect(screen.getByTestId('item-count').textContent).toBe('1');
    expect(screen.getByTestId('count').textContent).toBe('1');
  });

  it('should remove item from wishlist', async () => {
    renderWishlist();
    await act(async () => { screen.getByTestId('add').click(); });
    await act(async () => { screen.getByTestId('remove').click(); });
    expect(screen.getByTestId('item-count').textContent).toBe('0');
    expect(screen.getByTestId('count').textContent).toBe('0');
  });

  it('should return true for isInWishlist when item exists', async () => {
    renderWishlist();
    await act(async () => { screen.getByTestId('add').click(); });
    expect(screen.getByTestId('in-wishlist').textContent).toBe('yes');
  });

  it('should return false for isInWishlist when item does not exist', () => {
    renderWishlist();
    expect(screen.getByTestId('in-wishlist').textContent).toBe('no');
  });

  it('should toggle item on when not in wishlist', async () => {
    renderWishlist();
    await act(async () => { screen.getByTestId('toggle-on').click(); });
    expect(screen.getByTestId('in-wishlist').textContent).toBe('yes');
    expect(screen.getByTestId('count').textContent).toBe('1');
  });

  it('should toggle item off when already in wishlist', async () => {
    renderWishlist();
    await act(async () => { screen.getByTestId('add').click(); });
    await act(async () => { screen.getByTestId('toggle-off').click(); });
    expect(screen.getByTestId('in-wishlist').textContent).toBe('no');
    expect(screen.getByTestId('count').textContent).toBe('0');
  });

  it('should persist wishlist to localStorage', async () => {
    renderWishlist();
    await act(async () => { screen.getByTestId('add').click(); });
    const saved = JSON.parse(localStorage.getItem('wishlist'));
    expect(saved).toHaveLength(1);
    expect(saved[0].id).toBe('1');
    expect(saved[0].name).toBe('MacBook Pro');
  });

  it('should restore wishlist from localStorage on mount', () => {
    localStorage.setItem('wishlist', JSON.stringify([sampleProduct]));
    renderWishlist();
    expect(screen.getByTestId('item-count').textContent).toBe('1');
    expect(screen.getByTestId('count').textContent).toBe('1');
  });

  it('should handle multiple items correctly', async () => {
    renderWishlist();
    await act(async () => { screen.getByTestId('add').click(); });
    await act(async () => { screen.getByTestId('add-2').click(); });
    expect(screen.getByTestId('item-count').textContent).toBe('2');
    expect(screen.getByTestId('count').textContent).toBe('2');
  });

  it('should only store whitelisted fields when adding item', async () => {
    renderWishlist();
    await act(async () => { screen.getByTestId('add').click(); });
    const saved = JSON.parse(localStorage.getItem('wishlist'));
    expect(saved[0]).toEqual({
      id: '1',
      name: 'MacBook Pro',
      price: 69990000,
      image: '/mac.jpg',
      brand: 'Apple',
      category: 'laptop',
    });
  });
});
