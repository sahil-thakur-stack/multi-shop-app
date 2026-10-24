import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, FlatList, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useCart } from '@/context/CartContext';
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

function ProductCard({ product, shopId, shopName, deliveryFee, onAdd }: any) {
  const [qty, setQty] = useState(0);

  return (
    <View style={styles.productCard}>
      <View style={styles.productImage}>
        <Icon name="package" size={28} color={C.primary} />
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productCategory}>{product.category}</Text>
        <Text style={styles.productPrice}>₹{product.price}</Text>
      </View>

      <View style={styles.productControl}>
        {qty === 0 ? (
          <Pressable
            style={styles.addButton}
            onPress={() => {
              setQty(1);
              onAdd({ productId: product.productId, productName: product.name, shopId, shopName, price: product.price, quantity: 1, deliveryFee });
            }}
          >
            <Icon name="plus" size={16} color={C.foreground} />
          </Pressable>
        ) : (
          <View style={styles.qtyControl}>
            <Pressable onPress={() => setQty(qty - 1)}>
              <Icon name="minus" size={14} color={C.primary} />
            </Pressable>
            <Text style={styles.qtyText}>{qty}</Text>
            <Pressable
              onPress={() => {
                setQty(qty + 1);
                onAdd({ productId: product.productId, productName: product.name, shopId, shopName, price: product.price, quantity: 1, deliveryFee });
              }}
            >
              <Icon name="plus" size={14} color={C.primary} />
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

export default function StoreDetailScreen() {
  const { id } = useLocalSearchParams();
  const { addItem, totalItems } = useCart();
  const [search, setSearch] = useState('');
  const [storeName, setStoreName] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, [id]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await buyerService.getStoreProducts(Number(id));
      if (res.data) {
        setProducts(res.data);
        if (res.data.length > 0 && res.data[0].shopName) {
          setStoreName(res.data[0].shopName);
        }
        if (res.data.length > 0 && res.data[0].deliveryFee) {
          setDeliveryFee(res.data[0].deliveryFee);
        }
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p: any) =>
    (p.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Icon name="chevron-left" size={24} color={C.foreground} />
        </Pressable>
        <View style={styles.storeInfo}>
          <Text style={styles.storeName}>{storeName}</Text>
        </View>
        <Pressable
          style={styles.cartIcon}
          onPress={() => router.push('/(buyer-tabs)/cart')}
        >
          <Icon name="shopping-cart" size={20} color={C.foreground} />
          {totalItems > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{totalItems}</Text>
            </View>
          )}
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={16} color={C.mutedForeground} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor={C.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Products */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={C.primary} />
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.productId.toString()}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                shopId={Number(id)}
                shopName={storeName}
                deliveryFee={deliveryFee}
                onAdd={addItem}
              />
            )}
            scrollEnabled={false}
            contentContainerStyle={styles.productsList}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Icon name="inbox" size={40} color={C.mutedForeground} />
                <Text style={styles.emptyText}>No products found</Text>
              </View>
            }
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  loadingContainer: { paddingVertical: 40, justifyContent: 'center', alignItems: 'center' },
  empty: { justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: C.mutedForeground, fontSize: 14, marginTop: 12 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.border, gap: 12 },
  storeInfo: { flex: 1 },
  storeName: { color: C.foreground, fontSize: 16, fontWeight: '700', marginBottom: 2 },
  storeRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { color: C.mutedForeground, fontSize: 11 },
  cartIcon: { position: 'relative', padding: 8 },
  badge: { position: 'absolute', top: 0, right: 0, backgroundColor: '#C84B43', borderRadius: 10, width: 18, height: 18, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: C.foreground, fontSize: 9, fontWeight: '700' },
  scroll: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 10, paddingHorizontal: 10, marginBottom: 14, borderWidth: 1, borderColor: C.border },
  searchInput: { flex: 1, color: C.foreground, paddingVertical: 8, paddingHorizontal: 8, fontSize: 13 },
  productsList: { paddingBottom: 16 },
  productCard: { backgroundColor: C.card, borderRadius: 10, padding: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C.border, gap: 10 },
  productImage: { width: 50, height: 50, borderRadius: 10, backgroundColor: 'rgba(200, 107, 44, 0.1)', justifyContent: 'center', alignItems: 'center' },
  productInfo: { flex: 1 },
  productName: { color: C.foreground, fontSize: 13, fontWeight: '600', marginBottom: 2 },
  productCategory: { color: C.mutedForeground, fontSize: 11, marginBottom: 4 },
  productPrice: { color: C.primary, fontSize: 13, fontWeight: '700' },
  productControl: { marginLeft: 8 },
  addButton: { backgroundColor: C.primary, borderRadius: 8, width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  qtyControl: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(200, 107, 44, 0.1)', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 4 },
  qtyText: { color: C.foreground, fontSize: 12, fontWeight: '600', minWidth: 14, textAlign: 'center' },
});
