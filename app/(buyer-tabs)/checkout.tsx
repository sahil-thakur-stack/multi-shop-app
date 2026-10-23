import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, TextInput, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useCart } from '@/context/CartContext';
import { useSession } from '@/context/SessionContext';
import { router } from 'expo-router';
import { buyerService } from '@/services/buyerService';

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

export default function CheckoutScreen() {
  const { items, totalPrice, deliveryFee, clearCart } = useCart();
  const { user } = useSession();
  const [address, setAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = totalPrice;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      Alert.alert('Error', 'Please enter delivery address');
      return;
    }

    if (items.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    setIsProcessing(true);
    try {
      const orderData = {
        deliveryAddress: address.trim(),
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: total,
      };

      const res = await buyerService.checkout(orderData);

      if (res.data?.orderId) {
        // Send payment OTP
        await buyerService.sendPaymentOTP({
          orderId: res.data.orderId,
          amount: total,
        });

        clearCart();
        router.push(`/(buyer-tabs)/payment-otp?amount=${total}&orderId=${res.data.orderId}`);
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to place order');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Order Summary</Text>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <TextInput
            style={styles.addressInput}
            placeholder="Enter delivery address"
            placeholderTextColor={C.mutedForeground}
            value={address}
            onChangeText={setAddress}
            multiline
          />
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {items.map((item) => (
            <View key={item.productId} style={styles.itemRow}>
              <View style={styles.itemLeft}>
                <Text style={styles.itemName}>{item.productName}</Text>
                <Text style={styles.itemShop}>{item.shopName}</Text>
              </View>
              <Text style={styles.itemQty}>x{item.quantity}</Text>
              <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
            </View>
          ))}
        </View>

        {/* Bill Summary */}
        <View style={styles.billCard}>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Subtotal</Text>
            <Text style={styles.billValue}>₹{subtotal}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery</Text>
            <Text style={styles.billValue}>₹{deliveryFee}</Text>
          </View>
          <View style={[styles.billRow, styles.billTotal]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{total}</Text>
          </View>
        </View>

        {/* Payment Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentCard}>
            <Icon name="lock" size={20} color={C.primary} />
            <Text style={styles.paymentText}>Secure payment via OTP</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.placeButton, isProcessing && styles.placeButtonDisabled]}
          onPress={handlePlaceOrder}
          disabled={isProcessing}
        >
          <Icon name="check-circle" size={18} color={C.foreground} />
          <Text style={styles.placeText}>{isProcessing ? 'Processing...' : 'Place Order'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  scroll: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  title: { color: C.foreground, fontSize: 18, fontWeight: '700', marginBottom: 16 },
  section: { marginBottom: 20 },
  sectionTitle: { color: C.foreground, fontSize: 14, fontWeight: '700', marginBottom: 10 },
  addressInput: { backgroundColor: C.card, color: C.foreground, borderColor: C.border, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, minHeight: 80, fontSize: 13 },
  itemRow: { backgroundColor: C.card, borderRadius: 10, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C.border },
  itemLeft: { flex: 1 },
  itemName: { color: C.foreground, fontSize: 13, fontWeight: '600', marginBottom: 2 },
  itemShop: { color: C.mutedForeground, fontSize: 11 },
  itemQty: { color: C.mutedForeground, fontSize: 12, marginHorizontal: 10 },
  itemPrice: { color: C.primary, fontSize: 13, fontWeight: '700' },
  billCard: { backgroundColor: C.card, borderRadius: 10, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: C.border },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  billLabel: { color: C.mutedForeground, fontSize: 13 },
  billValue: { color: C.foreground, fontSize: 13, fontWeight: '600' },
  billTotal: { borderTopWidth: 1, borderTopColor: C.border, paddingTopWidth: 10, marginBottomWidth: 0 },
  totalLabel: { color: C.foreground, fontSize: 14, fontWeight: '700' },
  totalValue: { color: C.primary, fontSize: 16, fontWeight: '700' },
  paymentCard: { backgroundColor: C.card, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: C.border },
  paymentText: { color: C.foreground, fontSize: 13, fontWeight: '500' },
  footer: { paddingHorizontal: 16, paddingVertical: 16, backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.border },
  placeButton: { backgroundColor: C.primary, borderRadius: 10, paddingVertical: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  placeButtonDisabled: { opacity: 0.6 },
  placeText: { color: C.foreground, fontSize: 16, fontWeight: '700' },
});
