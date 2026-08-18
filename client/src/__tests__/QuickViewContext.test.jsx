import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { QuickViewProvider, useQuickView } from '../context/QuickViewContext';

const sampleProduct = { id: '1', name: 'MacBook Pro', price: 69990000 };

function TestQuickViewConsumer() {
  const { product, open, close } = useQuickView();
  return (
    <div>
      <span data-testid="product">{product ? product.name : 'none'}</span>
      <span data-testid="has-product">{product ? 'yes' : 'no'}</span>
      <button data-testid="open" onClick={() => open(sampleProduct)}>Open</button>
      <button data-testid="close" onClick={close}>Close</button>
    </div>
  );
}

function renderQuickView() {
  return render(
    <QuickViewProvider>
      <TestQuickViewConsumer />
    </QuickViewProvider>
  );
}

describe('QuickViewContext', () => {
  it('should start with no product selected', () => {
    renderQuickView();
    expect(screen.getByTestId('has-product').textContent).toBe('no');
    expect(screen.getByTestId('product').textContent).toBe('none');
  });

  it('should open quick view with a product', async () => {
    renderQuickView();
    await act(async () => { screen.getByTestId('open').click(); });
    expect(screen.getByTestId('has-product').textContent).toBe('yes');
    expect(screen.getByTestId('product').textContent).toBe('MacBook Pro');
  });

  it('should close quick view', async () => {
    renderQuickView();
    await act(async () => { screen.getByTestId('open').click(); });
    await act(async () => { screen.getByTestId('close').click(); });
    expect(screen.getByTestId('has-product').textContent).toBe('no');
    expect(screen.getByTestId('product').textContent).toBe('none');
  });

  it('should replace product when opening different product', async () => {
    const anotherProduct = { id: '2', name: 'iPhone 16', price: 29990000 };
    function MultiOpenConsumer() {
      const { product, open } = useQuickView();
      return (
        <div>
          <span data-testid="product">{product ? product.name : 'none'}</span>
          <button data-testid="open-1" onClick={() => open(sampleProduct)}>Open 1</button>
          <button data-testid="open-2" onClick={() => open(anotherProduct)}>Open 2</button>
        </div>
      );
    }
    render(
      <QuickViewProvider>
        <MultiOpenConsumer />
      </QuickViewProvider>
    );
    await act(async () => { screen.getByTestId('open-1').click(); });
    expect(screen.getByTestId('product').textContent).toBe('MacBook Pro');
    await act(async () => { screen.getByTestId('open-2').click(); });
    expect(screen.getByTestId('product').textContent).toBe('iPhone 16');
  });
});
