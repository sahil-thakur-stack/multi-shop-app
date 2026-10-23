import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { sellerService } from '@/services/sellerService';
import { useToast } from '@/context/ToastContext';

const C = {
  primary: '#C86B2C',
  background: '#22312B',
  foreground: '#FFFFFF',
  border: '#496057',
  mutedForeground: '#758078',
  card: '#2B3E35',
};

function Icon({ name, size = 20, color = C.foreground }: any) {
  return <Feather name={name} size={size} color={color} />;
}

function Input({ label, placeholder, value, onChangeText, keyboardType = 'default', multiline = false }: any) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        placeholder={placeholder}
        placeholderTextColor={C.mutedForeground}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
      />
    </View>
  );
}

export default function EditProductScreen() {
  const { id } = useLocalSearchParams();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Redirect if no valid ID
    if (!id || id === 'undefined') {
      router.replace('/(seller-tabs)/products');
      return;
    }
    loadProductData();
  }, [id]);

  const loadProductData = async () => {
    try {
      setIsLoading(true);
      const res = await sellerService.getMyProducts();
      const products = res.data || [];
      const product = products.find((p: any) => String(p.productId) === String(id));

      if (product) {
        setName(product.name || '');
        setPrice(String(product.price || ''));
        setQuantity(String(product.quantity || ''));
        setDescription(product.description || '');
      }
    } catch (error) {
      console.error('Failed to load product:', error);
      showToast('Failed to load product data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProduct = async () => {
    if (!name.trim() || !price.trim()) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await sellerService.updateProduct(Number(id), {
        name: name.trim(),
        price: parseFloat(price),
        quantity: parseInt(quantity),
        description: description.trim() || '',
      });

      showToast('Product updated successfully!', 'success');
      setTimeout(() => router.back(), 1500);
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Failed to update product', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await sellerService.deleteProduct(Number(id));
      Alert.alert('Success', 'Product deleted!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Icon name="arrow-left" size={24} />
        </Pressable>
        <Text style={styles.headerTitle}>Edit Product</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.form}>
        <Input label="Product Name" placeholder="Enter product name" value={name} onChangeText={setName} />

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Input label="Price (₹)" placeholder="Enter price" value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
          </View>
          <View style={styles.halfInput}>
            <Input label="Quantity" placeholder="Enter quantity" value={quantity} onChangeText={setQuantity} keyboardType="number-pad" />
          </View>
        </View>

        <Input label="Description" placeholder="Enter description" value={description} onChangeText={setDescription} multiline />

        <Pressable style={[styles.submitButton, isLoading && styles.submitButtonDisabled]} onPress={handleUpdateProduct} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color={C.foreground} />
          ) : (
            <>
              <Icon name="save" size={18} color={C.foreground} />
              <Text style={styles.submitButtonText}>Update Product</Text>
            </>
          )}
        </Pressable>

        <Pressable style={[styles.deleteButton, isDeleting && styles.submitButtonDisabled]} onPress={() => {
          Alert.alert('Delete Product', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: handleDelete },
          ]);
        }} disabled={isDeleting}>
          <Icon name="trash-2" size={18} color="#C84B43" />
          <Text style={styles.deleteButtonText}>{isDeleting ? 'Deleting...' : 'Delete Product'}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background, paddingHorizontal: 16, paddingVertical: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  headerTitle: { color: C.foreground, fontSize: 18, fontWeight: '700' },
  form: { marginBottom: 32 },
  inputGroup: { marginBottom: 16 },
  label: { color: C.foreground, fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: C.card, borderRadius: 10, borderWidth: 1, borderColor: C.border, paddingHorizontal: 12, paddingVertical: 10, color: C.foreground, fontSize: 14 },
  textArea: { height: 100 },
  row: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1 },
  submitButton: { backgroundColor: C.primary, borderRadius: 12, paddingVertical: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 24, marginBottom: 12 },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: C.foreground, fontSize: 16, fontWeight: '700' },
  deleteButton: { borderRadius: 12, paddingVertical: 14, borderWidth: 1, borderColor: '#C84B43', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  deleteButtonText: { color: '#C84B43', fontSize: 16, fontWeight: '600' },
});
