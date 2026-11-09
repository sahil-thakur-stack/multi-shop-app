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
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Your Cart</Text>
          <Text style={styles.headerSubtitle}>{totalItems} items</Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{totalItems}</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Cart Items */}
        <View style={styles.itemsSection}>
          <FlatList
            data={items}
            keyExtractor={(item) => item.productId.toString()}
            renderItem={({ item }) => (
              <View style={styles.cartItemCard}>
                {/* Item Image */}
                <View style={styles.itemImageContainer}>
                  <Icon name="package" size={28} color={C.primary} />
                </View>

                {/* Item Details */}
                <View style={styles.itemDetailsSection}>
                  <Text style={styles.itemName} numberOfLines={1}>{item.productName}</Text>
                  <Text style={styles.itemShop}>{item.shopName}</Text>
                  <Text style={styles.itemPrice}>₹{item.price} × {item.quantity}</Text>
                </View>

                {/* Item Total & Controls */}
                <View style={styles.itemRightSection}>
                  <Text style={styles.itemTotal}>₹{item.price * item.quantity}</Text>

                  <View style={styles.quantityControlCart}>
                    <Pressable onPress={() => updateQuantity(item.productId, item.quantity - 1)}>
                      <Icon name="minus" size={14} color={C.primary} />
                    </Pressable>
                    <Text style={styles.quantityCart}>{item.quantity}</Text>
                    <Pressable onPress={() => updateQuantity(item.productId, item.quantity + 1)}>
                      <Icon name="plus" size={14} color={C.primary} />
                    </Pressable>
                  </View>

                  <Pressable onPress={() => removeItem(item.productId)} style={styles.removeBtn}>
                    <Icon name="x" size={16} color="#C84B43" />
                  </Pressable>
                </View>
              </View>
            )}
            scrollEnabled={false}
          />
        </View>

        {/* Summary Card */}
        <View style={styles.billCard}>
          <Text style={styles.billTitle}>Bill Details</Text>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Subtotal</Text>
            <Text style={styles.billValue}>₹{totalPrice}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery</Text>
            <Text style={styles.billValue}>₹{deliveryFee}</Text>
          </View>

          <View style={styles.billDivider} />

          <View style={styles.billRowTotal}>
            <Text style={styles.billTotalLabel}>Total Amount</Text>
            <Text style={styles.billTotalValue}>₹{totalPrice + deliveryFee}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Checkout Button */}
      <View style={styles.checkoutFooter}>
        <Pressable style={styles.checkoutButtonCart} onPress={() => router.push('/(buyer-tabs)/checkout')}>
          <Icon name="arrow-right" size={18} color={C.foreground} />
          <Text style={styles.checkoutButtonTextCart}>Checkout</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.border },
  headerTitle: { color: C.foreground, fontSize: 18, fontWeight: '700' },
  headerSubtitle: { color: C.mutedForeground, fontSize: 12, marginTop: 2 },
  headerBadge: { backgroundColor: C.primary, borderRadius: 20, width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  headerBadgeText: { color: C.foreground, fontSize: 12, fontWeight: '700' },

  // Scroll
  scroll: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },

  // Empty State
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.background, paddingHorizontal: 16 },
  emptyText: { color: C.foreground, fontSize: 18, fontWeight: '700', marginTop: 16 },
  emptySubtext: { color: C.mutedForeground, fontSize: 13, marginTop: 8 },
  exploreButton: { backgroundColor: C.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, marginTop: 20 },
  exploreButtonText: { color: C.foreground, fontWeight: '700' },

  // Items Section
  itemsSection: { marginBottom: 20 },
  cartItemCard: { backgroundColor: C.card, borderRadius: 12, padding: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: C.border },
  itemImageContainer: { width: 50, height: 50, borderRadius: 12, backgroundColor: 'rgba(200, 107, 44, 0.15)', justifyContent: 'center', alignItems: 'center' },
  itemDetailsSection: { flex: 1 },
  itemName: { color: C.foreground, fontSize: 13, fontWeight: '700' },
  itemShop: { color: C.mutedForeground, fontSize: 11, marginTop: 2 },
  itemPrice: { color: C.mutedForeground, fontSize: 11, marginTop: 4 },
  itemRightSection: { alignItems: 'flex-end', gap: 6 },
  itemTotal: { color: C.primary, fontSize: 13, fontWeight: '700' },
  quantityControlCart: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(200, 107, 44, 0.1)', borderRadius: 8, paddingHorizontal: 4, paddingVertical: 3 },
  quantityCart: { color: C.foreground, fontSize: 11, fontWeight: '600', minWidth: 16, textAlign: 'center' },
  removeBtn: { padding: 4 },

  // Bill Card
  billCard: { backgroundColor: C.card, borderRadius: 12, padding: 16, marginBottom: 100, borderWidth: 1, borderColor: C.border },
  billTitle: { color: C.foreground, fontSize: 14, fontWeight: '700', marginBottom: 12 },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  billLabel: { color: C.mutedForeground, fontSize: 13 },
  billValue: { color: C.foreground, fontSize: 13, fontWeight: '600' },
  billDivider: { height: 1, backgroundColor: C.border, marginVertical: 12 },
  billRowTotal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  billTotalLabel: { color: C.foreground, fontSize: 14, fontWeight: '700' },
  billTotalValue: { color: C.primary, fontSize: 16, fontWeight: '700' },

  // Checkout Footer
  checkoutFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.border },
  checkoutButtonCart: { backgroundColor: C.primary, borderRadius: 12, paddingVertical: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  checkoutButtonTextCart: { color: C.foreground, fontSize: 16, fontWeight: '700' },
});
