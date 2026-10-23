import React, {
  createContext, useCallback, useContext, useState,
} from 'react';

export interface CartItem {
  productId: number;
  productName: string;
  shopId: number;
  shopName: string;
  price: number;
  quantity: number;
  deliveryFee: number;
  image?: string;
}

export interface CartContextType {
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
  deliveryFee: number;

  addItem: (item: CartItem) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getItemByProduct: (productId: number) => CartItem | undefined;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const uniqueShops = new Set(items.map(item => item.shopId));
  const deliveryFee = uniqueShops.size > 0
    ? Array.from(uniqueShops).reduce((sum, shopId) => {
        const item = items.find(i => i.shopId === shopId);
        return sum + (item?.deliveryFee || 0);
      }, 0)
    : 0;

  const addItem = useCallback((item: CartItem) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.productId === item.productId);
      if (existingItem) {
        return prevItems.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i,
        );
      }
      return [...prevItems, item];
    });
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId
          ? { ...item, quantity }
          : item,
      ),
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getItemByProduct = useCallback(
    (productId: number) => items.find((item) => item.productId === productId),
    [items],
  );

  const value: CartContextType = {
    items,
    totalPrice,
    totalItems,
    deliveryFee,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemByProduct,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
