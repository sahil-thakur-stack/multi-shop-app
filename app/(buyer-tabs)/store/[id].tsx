import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, FlatList, Pressable, TextInput, ActivityIndicator, Modal } from 'react-native';
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

function ProductCard({ product, shopId, shopName, deliveryFee, onAdd, onPress }: any) {
  const [qty, setQty] = useState(0);

  return (
    <Pressable style={styles.productGridCard} onPress={onPress}>
      {/* Product Image */}
      <View style={styles.productGridImage}>
        <Icon name="package" size={32} color={C.primary} />
      </View>

      {/* Product Info */}
      <View style={styles.productGridInfo}>
        <Text style={styles.productGridName} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.productGridCategory} numberOfLines={1}>{product.category}</Text>
        <Text style={styles.productGridPrice}>₹{product.price}</Text>
      </View>

      {/* Add/Qty Control Button */}
      <View style={styles.productGridButton}>
        {qty === 0 ? (
          <Pressable
            style={styles.addButtonGrid}
            onPress={() => {
              setQty(1);
              onAdd({ productId: product.productId, productName: product.name, shopId, shopName, price: product.price, quantity: 1, deliveryFee });
            }}
          >
            <Text style={styles.addButtonText}>ADD</Text>
          </Pressable>
        ) : (
          <View style={styles.qtyControlGrid}>
            <Pressable style={styles.qtyBtn} onPress={() => setQty(qty - 1)}>
              <Icon name="minus" size={12} color={C.primary} />
            </Pressable>
            <Text style={styles.qtyTextGrid}>{qty}</Text>
            <Pressable
              style={styles.qtyBtn}
              onPress={() => {
                setQty(qty + 1);
                onAdd({ productId: product.productId, productName: product.name, shopId, shopName, price: product.price, quantity: 1, deliveryFee });
              }}
            >
              <Icon name="plus" size={12} color={C.primary} />
            </Pressable>
          </View>
        )}
      </View>
    </Pressable>
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
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [detailQty, setDetailQty] = useState(0);

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

        {/* Products Grid */}
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
                onPress={() => {
                  setSelectedProduct(item);
                  setDetailQty(0);
                }}
              />
            )}
            scrollEnabled={false}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.productsGrid}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Icon name="inbox" size={40} color={C.mutedForeground} />
                <Text style={styles.emptyText}>No products found</Text>
              </View>
            }
          />
        )}
      </ScrollView>

      {/* Product Detail Modal */}
      <Modal
        visible={!!selectedProduct}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedProduct(null)}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setSelectedProduct(null)}>
              <Icon name="x" size={24} color={C.foreground} />
            </Pressable>
            <Text style={styles.modalTitle}>Product Details</Text>
            <View style={{ width: 24 }} />
          </View>

          {selectedProduct && (
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* Product Image */}
              <View style={styles.detailImageSection}>
                <View style={styles.detailImage}>
                  <Icon name="package" size={80} color={C.primary} />
                </View>
              </View>

              {/* Product Info */}
              <View style={styles.detailInfo}>
                <Text style={styles.detailName}>{selectedProduct.name}</Text>
                <Text style={styles.detailCategory}>{selectedProduct.category}</Text>

                {/* Rating */}
                <View style={styles.ratingSection}>
                  <View style={styles.ratingStars}>
                    <Icon name="star" size={14} color="#FFB800" />
                    <Text style={styles.ratingText}>4.5</Text>
                  </View>
                  <Text style={styles.ratingCount}>(128 reviews)</Text>
                </View>

                {/* Price */}
                <View style={styles.priceSection}>
                  <Text style={styles.priceLabel}>Price</Text>
                  <Text style={styles.priceValue}>₹{selectedProduct.price}</Text>
                </View>

                {/* Description */}
                <View style={styles.descriptionSection}>
                  <Text style={styles.sectionTitle}>About this product</Text>
                  <Text style={styles.descriptionText}>
                    High-quality {selectedProduct.category} product. Perfect for daily use with premium packaging and freshness guaranteed.
                  </Text>
                </View>

                {/* Details */}
                <View style={styles.detailsSection}>
                  <Text style={styles.sectionTitle}>Details</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Category</Text>
                    <Text style={styles.detailValue}>{selectedProduct.category}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Store</Text>
                    <Text style={styles.detailValue}>{storeName}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Delivery</Text>
                    <Text style={styles.detailValue}>₹{deliveryFee}</Text>
                  </View>
                </View>

                {/* Quantity Selector */}
                <View style={styles.quantitySelectorSection}>
                  <Text style={styles.sectionTitle}>Quantity</Text>
                  <View style={styles.quantityLarge}>
                    <Pressable
                      style={styles.qtyBtnLarge}
                      onPress={() => detailQty > 1 && setDetailQty(detailQty - 1)}
                    >
                      <Icon name="minus" size={18} color={C.primary} />
                    </Pressable>
                    <Text style={styles.qtyValueLarge}>{detailQty}</Text>
                    <Pressable
                      style={styles.qtyBtnLarge}
                      onPress={() => setDetailQty(detailQty + 1)}
                    >
                      <Icon name="plus" size={18} color={C.primary} />
                    </Pressable>
                  </View>
                </View>

                <View style={{ height: 120 }} />
              </ScrollView>
            )}

          {/* Sticky Add Button */}
          {selectedProduct && (
            <View style={styles.modalBottom}>
              <Pressable
                style={styles.addToCartButton}
                onPress={() => {
                  if (detailQty > 0) {
                    addItem({
                      productId: selectedProduct.productId,
                      productName: selectedProduct.name,
                      shopId: Number(id),
                      shopName: storeName,
                      price: selectedProduct.price,
                      quantity: detailQty,
                      deliveryFee,
                    });
                    setSelectedProduct(null);
                    setDetailQty(0);
                  }
                }}
              >
                <Icon name="shopping-cart" size={18} color={C.foreground} />
                <Text style={styles.addToCartText}>
                  {detailQty > 0 ? `Add ${detailQty} to Cart` : 'Select Quantity'}
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  loadingContainer: { paddingVertical: 40, justifyContent: 'center', alignItems: 'center' },
  empty: { justifyContent: 'center', alignItems: 'center', paddingVertical: 40, width: '100%' },
  emptyText: { color: C.mutedForeground, fontSize: 14, marginTop: 12 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.border, gap: 12 },
  storeInfo: { flex: 1 },
  storeName: { color: C.foreground, fontSize: 16, fontWeight: '700', marginBottom: 2 },
  storeRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { color: C.mutedForeground, fontSize: 11 },
  cartIcon: { position: 'relative', padding: 8 },
  badge: { position: 'absolute', top: 0, right: 0, backgroundColor: '#C84B43', borderRadius: 10, width: 18, height: 18, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: C.foreground, fontSize: 9, fontWeight: '700' },
  scroll: { flex: 1, paddingHorizontal: 8, paddingTop: 12 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 10, paddingHorizontal: 10, marginBottom: 14, marginHorizontal: 8, borderWidth: 1, borderColor: C.border },
  searchInput: { flex: 1, color: C.foreground, paddingVertical: 8, paddingHorizontal: 8, fontSize: 13 },

  // Product Grid
  columnWrapper: { justifyContent: 'flex-start', paddingHorizontal: 4, marginBottom: 8, gap: 8 },
  productsGrid: { paddingHorizontal: 4, paddingBottom: 16 },

  // Product Grid Card
  productGridCard: { width: '48%', backgroundColor: C.card, borderRadius: 12, padding: 10, borderWidth: 1, borderColor: C.border, alignItems: 'center' },
  productGridImage: { width: 70, height: 70, borderRadius: 12, backgroundColor: 'rgba(200, 107, 44, 0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  productGridInfo: { width: '100%', alignItems: 'center', marginBottom: 8 },
  productGridName: { color: C.foreground, fontSize: 12, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  productGridCategory: { color: C.mutedForeground, fontSize: 10, marginBottom: 4 },
  productGridPrice: { color: C.primary, fontSize: 14, fontWeight: '700', marginBottom: 8 },
  productGridButton: { width: '100%' },
  addButtonGrid: { backgroundColor: C.primary, borderRadius: 8, paddingVertical: 8, justifyContent: 'center', alignItems: 'center' },
  addButtonText: { color: C.foreground, fontSize: 12, fontWeight: '700' },
  qtyControlGrid: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(200, 107, 44, 0.15)', borderRadius: 8, paddingHorizontal: 4, paddingVertical: 4 },
  qtyBtn: { width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
  qtyTextGrid: { color: C.foreground, fontSize: 12, fontWeight: '600', minWidth: 20, textAlign: 'center' },

  // Product Detail Modal
  modalContainer: { flex: 1, backgroundColor: C.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.border },
  modalTitle: { color: C.foreground, fontSize: 16, fontWeight: '700' },
  modalScroll: { flex: 1, paddingHorizontal: 16 },
  detailImageSection: { paddingVertical: 20, alignItems: 'center' },
  detailImage: { width: 140, height: 140, borderRadius: 20, backgroundColor: 'rgba(200, 107, 44, 0.2)', justifyContent: 'center', alignItems: 'center' },
  detailInfo: { paddingVertical: 16 },
  detailName: { color: C.foreground, fontSize: 20, fontWeight: '700', marginBottom: 6 },
  detailCategory: { color: C.mutedForeground, fontSize: 13, marginBottom: 10 },
  ratingSection: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  ratingStars: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.card, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  ratingText: { color: C.foreground, fontSize: 12, fontWeight: '600' },
  ratingCount: { color: C.mutedForeground, fontSize: 12 },
  priceSection: { backgroundColor: C.card, padding: 14, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: C.border },
  priceLabel: { color: C.mutedForeground, fontSize: 12, marginBottom: 6 },
  priceValue: { color: C.primary, fontSize: 24, fontWeight: '700' },
  descriptionSection: { marginBottom: 20 },
  sectionTitle: { color: C.foreground, fontSize: 14, fontWeight: '700', marginBottom: 10 },
  descriptionText: { color: C.mutedForeground, fontSize: 13, lineHeight: 20 },
  detailsSection: { marginBottom: 20 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  detailLabel: { color: C.mutedForeground, fontSize: 13 },
  detailValue: { color: C.foreground, fontSize: 13, fontWeight: '600' },
  quantitySelectorSection: { marginBottom: 20 },
  quantityLarge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, backgroundColor: C.card, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: C.border },
  qtyBtnLarge: { width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(200, 107, 44, 0.1)', justifyContent: 'center', alignItems: 'center' },
  qtyValueLarge: { color: C.foreground, fontSize: 18, fontWeight: '700', minWidth: 30, textAlign: 'center' },
  modalBottom: { paddingHorizontal: 16, paddingVertical: 16, backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.border },
  addToCartButton: { backgroundColor: C.primary, borderRadius: 12, paddingVertical: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  addToCartText: { color: C.foreground, fontSize: 16, fontWeight: '700' },
});
