import { Feather } from '@expo/vector-icons';
import React from 'react';
import {
  Pressable, StyleSheet, Text, View,
} from 'react-native';
import colors from '@/constants/colors';
import { useCart } from '@/context/CartContext';

const C = colors.light;

export interface Product {
  id: number;
  name: string;
  price: number;
  category?: string;
  image?: string;
  inStock?: boolean;
  shopId?: number;
  shopName?: string;
}

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
}

function Icon({ name, size = 16, color = C.foreground }: { name: keyof typeof Feather.glyphMap; size?: number; color?: string }) {
  return <Feather name={name} size={size} color={color} />;
}

export function ProductCard({ product, onPress }: ProductCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    if (product.shopId && product.shopName) {
      addItem({
        productId: product.id,
        productName: product.name,
        shopId: product.shopId,
        shopName: product.shopName,
        price: product.price,
        quantity: 1,
        image: product.image,
      });
    }
  };

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
          {product.category && <Text style={styles.category}>{product.category}</Text>}
        </View>
        {!product.inStock && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Out of Stock</Text>
          </View>
        )}
      </View>
      <View style={styles.footer}>
        <Text style={styles.price}>₹{product.price}</Text>
        <Pressable
          style={[styles.addButton, !product.inStock && styles.addButtonDisabled]}
          onPress={handleAddToCart}
          disabled={!product.inStock}
        >
          <Icon name="plus" size={16} color={C.primaryForeground} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#496057',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  info: {
    flex: 1,
  },
  name: {
    color: C.primaryForeground,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },
  category: {
    color: C.mutedForeground,
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    marginTop: 2,
  },
  badge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: 'white',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    color: C.primary,
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#666',
    opacity: 0.5,
  },
});
