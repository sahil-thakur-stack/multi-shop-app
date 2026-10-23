import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Product = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  inStock: boolean;
  image?: string;
};

export type Order = {
  id: string;
  customer: string;
  items: string;
  total: number;
  status: 'New' | 'Accepted' | 'Preparing' | 'Out for delivery' | 'Completed';
  time: string;
  worker?: string;
};

export type Shop = {
  id: string;
  name: string;
  location: string;
  owner: string;
  address: string;
  phone: string;
  radius: string;
  hours: string;
  color: string;
  products: Product[];
  orders: Order[];
  worker: string;
  sales: number;
  earnings: number;
  rating: number;
  workers: string[];
};

// Data will be loaded from API - no hardcoded initial data
const initialShops: Shop[] = [];

type ShopContextValue = {
  shops: Shop[];
  selectedShop: Shop;
  selectedShopId: string;
  selectShop: (id: string) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateShop: (updates: Partial<Shop>) => void;
  updateOrder: (orderId: string, status: Order['status']) => void;
  placeOrder: (customer: string, items: string, total: number, products: Product[]) => void;
  assignWorker: (orderId: string, worker: string) => void;
};

const ShopContext = createContext<ShopContextValue | null>(null);
const STORAGE_KEY = 'multi-shop-local-state';

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [shops, setShops] = useState<Shop[]>(initialShops);
  const [selectedShopId, setSelectedShopId] = useState('');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (!saved) return;
      try {
        const parsed = JSON.parse(saved) as { shops: Shop[]; selectedShopId: string };
        if (parsed.shops?.length) setShops(parsed.shops.map((shop) => ({
          ...shop,
          workers: shop.workers?.length ? shop.workers : [shop.worker],
        })));
        if (parsed.selectedShopId) setSelectedShopId(parsed.selectedShopId);
      } catch {
        // Keep the useful in-memory demo data if local storage is corrupt.
      }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ shops, selectedShopId })).catch(() => undefined);
  }, [shops, selectedShopId]);

  const updateSelected = (transform: (shop: Shop) => Shop) => {
    setShops((current) => current.map((shop) => shop.id === selectedShopId ? transform(shop) : shop));
  };

  const value = useMemo<ShopContextValue>(() => ({
    shops,
    selectedShop: shops.find((shop) => shop.id === selectedShopId) ?? shops[0],
    selectedShopId,
    selectShop: setSelectedShopId,
    addProduct: (product) => updateSelected((shop) => ({
      ...shop,
      products: [{ ...product, id: `${shop.id}-${Date.now()}` }, ...shop.products],
    })),
    updateShop: (updates) => updateSelected((shop) => ({ ...shop, ...updates })),
    updateOrder: (orderId, status) => updateSelected((shop) => ({
      ...shop,
      orders: shop.orders.map((order) => order.id === orderId ? { ...order, status } : order),
    })),
    placeOrder: (customer, items, total, products) => updateSelected((shop) => ({
      ...shop,
      sales: shop.sales + total,
      products: shop.products.map((product) => {
        const orderedCount = products.filter((item) => item.id === product.id).length;
        return orderedCount ? { ...product, quantity: Math.max(0, product.quantity - orderedCount), inStock: product.quantity - orderedCount > 0 } : product;
      }),
      orders: [{
        id: `#${Math.floor(1000 + Math.random() * 8999)}`,
        customer,
        items,
        total,
        status: 'New',
        time: 'just now',
      }, ...shop.orders],
    })),
    assignWorker: (orderId, worker) => updateSelected((shop) => ({
      ...shop,
      orders: shop.orders.map((order) => order.id === orderId ? { ...order, worker } : order),
    })),
  }), [shops, selectedShopId]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) throw new Error('useShop must be used inside ShopProvider');
  return context;
}