import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  FlatList,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { sellerService } from '@/services/sellerService';
import { useCallback } from 'react';

const C = {
  primary: '#C86B2C',
  background: '#22312B',
  foreground: '#FFFFFF',
  border: '#496057',
  mutedForeground: '#758078',
  card: '#2B3E35',
  success: '#3E8B62',
};

function Icon({
  name,
  size = 20,
  color = C.foreground,
}: {
  name: keyof typeof Feather.glyphMap;
  size?: number;
  color?: string;
}) {
  return <Feather name={name} size={size} color={color} />;
}


function ProductCard({
  product,
  onEdit,
  onDelete,
}: {
  product: any;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    Alert.alert('Delete Product', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setIsDeleting(true);
          try {
            await sellerService.deleteProduct(product.productId || product.id);
            onDelete();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete product');
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
  };

  return (
    <Pressable style={styles.productCard} onPress={onEdit} disabled={isDeleting}>
      <View style={styles.productImage}>
        {product.image ? (
          <Image source={{ uri: product.image }} style={styles.image} />
        ) : (
          <Icon name="package" size={32} color={C.mutedForeground} />
        )}
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productCategory}>{product.category}</Text>
        <View style={styles.productFooter}>
          <Text style={styles.productPrice}>₹{product.price}</Text>
          <View
            style={[
              styles.statusBadge,
              (product.quantity || 0) === 0 &&
                styles.statusBadgeOutOfStock,
            ]}
          >
            <Text style={styles.statusText}>
              {(product.quantity || 0) === 0 ? 'Out of Stock' : `${product.quantity} left`}
            </Text>
          </View>
        </View>
      </View>

    </Pressable>
  );
}

export default function ProductsScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [])
  );

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await sellerService.getMyProducts();
      if (res.data) {
        setProducts(Array.isArray(res.data) ? res.data : []);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const filteredProducts = products.filter(
    (p) =>
      p.isActive !== false &&
      ((p.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color={C.mutedForeground} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor={C.mutedForeground}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Products</Text>
          <Text style={styles.headerSubtitle}>
            {filteredProducts.length} total products
          </Text>
        </View>
        <Pressable
          style={styles.addButton}
          onPress={() => router.push('/(seller-edit-modal)/products/add')}
        >
          <Icon name="plus" size={20} color={C.foreground} />
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      {/* Products List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => (item.productId || item.id || Math.random()).toString()}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onEdit={() => router.push(`/(seller-edit-modal)/products/${item.productId || item.id}/edit`)}
              onDelete={() => {
                setProducts(products.filter((p) => (p.productId || p.id) !== (item.productId || item.id)));
              }}
            />
          )}
          scrollEnabled={false}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Icon name="package" size={48} color={C.mutedForeground} />
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  searchInput: {
    flex: 1,
    color: C.foreground,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerTitle: {
    color: C.foreground,
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: C.mutedForeground,
    fontSize: 12,
    marginTop: 4,
  },
  addButton: {
    backgroundColor: C.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addButtonText: {
    color: C.foreground,
    fontWeight: '600',
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 16,
  },
  productCard: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: 'rgba(200, 107, 44, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    color: C.foreground,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  productCategory: {
    color: C.mutedForeground,
    fontSize: 12,
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    color: C.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  statusBadge: {
    backgroundColor: 'rgba(62, 139, 98, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeOutOfStock: {
    backgroundColor: 'rgba(200, 75, 67, 0.2)',
  },
  statusText: {
    color: C.success,
    fontSize: 11,
    fontWeight: '600',
  },
  productActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 8,
  },
  actionBtn: {
    padding: 6,
  },
  empty: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    color: C.mutedForeground,
    fontSize: 14,
    marginTop: 12,
  },
});
