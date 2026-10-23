import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, FlatList } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCart } from '@/context/CartContext';

const C = {
  primary: '#C86B2C',
  background: '#22312B',
  foreground: '#FFFFFF',
  border: '#496057',
  mutedForeground: '#758078',
  card: '#2B3E35',
};

const Icon = ({ name, size = 20, color = C.foreground }: any) => (
  <Feather name={name} size={size} color={color} />
);

export default function CartScreen() {
  const { items, totalPrice, totalItems, deliveryFee, removeItem, updateQuantity } = useCart();

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="shopping-cart" size={48} color={C.mutedForeground} />
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <Text style={styles.emptySubtext}>Add items from nearby stores</Text>
        <Pressable style={styles.exploreButton} onPress={() => router.push('/(buyer-tabs)')}>
          <Text style={styles.exploreButtonText}>Explore Stores</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Shopping Cart</Text>

        <FlatList
          data={items}
          keyExtractor={(item) => item.productId.toString()}
          renderItem={({ item }) => (
            <View style={styles.cartItem}>
              <View style={styles.itemImage}>
                <Icon name="package" size={24} color={C.primary} />
              </View>

              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.productName}</Text>
                <Text style={styles.itemShop}>{item.shopName}</Text>
                <Text style={styles.itemPrice}>₹{item.price}</Text>
              </View>

              <View style={styles.quantityControl}>
                <Pressable onPress={() => updateQuantity(item.productId, item.quantity - 1)}>
                  <Icon name="minus" size={16} color={C.primary} />
                </Pressable>
                <Text style={styles.quantity}>{item.quantity}</Text>
                <Pressable onPress={() => updateQuantity(item.productId, item.quantity + 1)}>
                  <Icon name="plus" size={16} color={C.primary} />
                </Pressable>
              </View>

              <Pressable onPress={() => removeItem(item.productId)}>
                <Icon name="trash-2" size={18} color="#C84B43" />
              </Pressable>
            </View>
          )}
          scrollEnabled={false}
        />

        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal ({totalItems} items)</Text>
            <Text style={styles.summaryValue}>₹{totalPrice}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery</Text>
            <Text style={styles.summaryValue}>₹{deliveryFee}</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryTotal]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{totalPrice + deliveryFee}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.checkoutContainer}>
        <Pressable style={styles.checkoutButton} onPress={() => router.push('/(buyer-tabs)/checkout')}>
          <Icon name="shopping-bag" size={18} color={C.foreground} />
          <Text style={styles.checkoutText}>Proceed to Checkout</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  scroll: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  title: { color: C.foreground, fontSize: 18, fontWeight: '700', marginBottom: 16 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.background, paddingHorizontal: 16 },
  emptyText: { color: C.foreground, fontSize: 18, fontWeight: '700', marginTop: 16 },
  emptySubtext: { color: C.mutedForeground, fontSize: 13, marginTop: 8 },
  exploreButton: { backgroundColor: C.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, marginTop: 20 },
  exploreButtonText: { color: C.foreground, fontWeight: '700' },
  cartItem: { backgroundColor: C.card, borderRadius: 12, padding: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: C.border },
  itemImage: { width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(200, 107, 44, 0.1)', justifyContent: 'center', alignItems: 'center' },
  itemInfo: { flex: 1 },
  itemName: { color: C.foreground, fontSize: 13, fontWeight: '600' },
  itemShop: { color: C.mutedForeground, fontSize: 11, marginTop: 2 },
  itemPrice: { color: C.primary, fontSize: 12, fontWeight: '700', marginTop: 4 },
  quantityControl: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(200, 107, 44, 0.1)', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 4 },
  quantity: { color: C.foreground, fontSize: 13, fontWeight: '600', minWidth: 18, textAlign: 'center' },
  summaryCard: { backgroundColor: C.card, borderRadius: 12, padding: 16, marginVertical: 20, borderWidth: 1, borderColor: C.border },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryLabel: { color: C.mutedForeground, fontSize: 13 },
  summaryValue: { color: C.foreground, fontSize: 13, fontWeight: '600' },
  summaryTotal: { borderTopWidth: 1, borderTopColor: C.border, paddingTop: 12, marginBottom: 0 },
  totalLabel: { color: C.foreground, fontSize: 14, fontWeight: '700' },
  totalValue: { color: C.primary, fontSize: 16, fontWeight: '700' },
  checkoutContainer: { paddingHorizontal: 16, paddingVertical: 16, backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.border },
  checkoutButton: { backgroundColor: C.primary, borderRadius: 12, paddingVertical: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  checkoutText: { color: C.foreground, fontSize: 16, fontWeight: '700' },
});
