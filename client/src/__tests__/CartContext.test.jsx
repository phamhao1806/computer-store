import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider, useCart } from '../context/CartContext';

function TestCartConsumer() {
  const { items, addItem, removeItem, updateQuantity, clearCart, total, count } = useCart();
  return (
    <div>
      <span data-testid="count">{count}</span>
      <span data-testid="total">{total}</span>
      <span data-testid="item-count">{items.length}</span>
      <button data-testid="add" onClick={() => addItem({ id: '1', name: 'Laptop', price: 30000000 })}>
        Add Laptop
      </button>
      <button data-testid="add-qty" onClick={() => addItem({ id: '2', name: 'Mouse', price: 500000 }, 3)}>
        Add Mouse x3
      </button>
      <button data-testid="add-dup" onClick={() => addItem({ id: '1', name: 'Laptop', price: 30000000 })}>
        Add Again
      </button>
      <button data-testid="remove" onClick={() => removeItem('1')}>
        Remove
      </button>
      <button data-testid="update" onClick={() => updateQuantity('1', 5)}>
        Update Qty
      </button>
      <button data-testid="update-zero" onClick={() => updateQuantity('1', 0)}>
        Update to 0
      </button>
      <button data-testid="clear" onClick={clearCart}>
        Clear
      </button>
    </div>
  );
}

function renderCart() {
  return render(
    <CartProvider>
      <TestCartConsumer />
    </CartProvider>
  );
}

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with empty cart', () => {
    renderCart();
    expect(screen.getByTestId('count').textContent).toBe('0');
    expect(screen.getByTestId('total').textContent).toBe('0');
    expect(screen.getByTestId('item-count').textContent).toBe('0');
  });

  it('adds an item with default quantity 1', async () => {
    renderCart();
    await act(async () => {
      screen.getByTestId('add').click();
    });
    expect(screen.getByTestId('item-count').textContent).toBe('1');
    expect(screen.getByTestId('count').textContent).toBe('1');
    expect(screen.getByTestId('total').textContent).toBe('30000000');
  });

  it('adds an item with custom quantity', async () => {
    renderCart();
    await act(async () => {
      screen.getByTestId('add-qty').click();
    });
    expect(screen.getByTestId('count').textContent).toBe('3');
    expect(screen.getByTestId('total').textContent).toBe('1500000');
  });

  it('increments quantity when adding same product again', async () => {
    renderCart();
    await act(async () => {
      screen.getByTestId('add').click();
    });
    await act(async () => {
      screen.getByTestId('add-dup').click();
    });
    expect(screen.getByTestId('item-count').textContent).toBe('1');
    expect(screen.getByTestId('count').textContent).toBe('2');
    expect(screen.getByTestId('total').textContent).toBe('60000000');
  });

  it('removes an item', async () => {
    renderCart();
    await act(async () => {
      screen.getByTestId('add').click();
    });
    await act(async () => {
      screen.getByTestId('remove').click();
    });
    expect(screen.getByTestId('item-count').textContent).toBe('0');
    expect(screen.getByTestId('count').textContent).toBe('0');
  });

  it('updates item quantity', async () => {
    renderCart();
    await act(async () => {
      screen.getByTestId('add').click();
    });
    await act(async () => {
      screen.getByTestId('update').click();
    });
    expect(screen.getByTestId('count').textContent).toBe('5');
    expect(screen.getByTestId('total').textContent).toBe('150000000');
  });

  it('removes item when quantity updated to 0', async () => {
    renderCart();
    await act(async () => {
      screen.getByTestId('add').click();
    });
    await act(async () => {
      screen.getByTestId('update-zero').click();
    });
    expect(screen.getByTestId('item-count').textContent).toBe('0');
  });

  it('clears the entire cart', async () => {
    renderCart();
    await act(async () => {
      screen.getByTestId('add').click();
    });
    await act(async () => {
      screen.getByTestId('add-qty').click();
    });
    await act(async () => {
      screen.getByTestId('clear').click();
    });
    expect(screen.getByTestId('item-count').textContent).toBe('0');
    expect(screen.getByTestId('count').textContent).toBe('0');
    expect(screen.getByTestId('total').textContent).toBe('0');
  });

  it('calculates total correctly with multiple items', async () => {
    renderCart();
    await act(async () => {
      screen.getByTestId('add').click();
    });
    await act(async () => {
      screen.getByTestId('add-qty').click();
    });
    expect(screen.getByTestId('total').textContent).toBe(String(30000000 + 1500000));
  });
});
