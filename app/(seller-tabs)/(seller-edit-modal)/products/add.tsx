import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { sellerService } from '@/services/sellerService';
import { useToast } from '@/context/ToastContext';

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

function Input({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  multiline = false,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: string;
  multiline?: boolean;
}) {
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
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );
}

function Selector({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.selectorGroup}>
        {options.map((option) => (
          <Pressable
            key={option}
            style={[
              styles.selectorButton,
              selected === option && styles.selectorButtonActive,
            ]}
            onPress={() => onSelect(option)}
          >
            <Text
              style={[
                styles.selectorButtonText,
                selected === option && styles.selectorButtonTextActive,
              ]}
            >
              {option}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function AddProductScreen() {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddProduct = async () => {
    if (!name.trim() || !price.trim() || !quantity.trim()) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await sellerService.createProduct({
        name: name.trim(),
        price: parseFloat(price),
        quantity: parseInt(quantity),
        description: description.trim() || '',
      });

      showToast('Product added successfully!', 'success');
      // Navigate back after a short delay
      setTimeout(() => router.replace('/(seller-tabs)/products'), 1500);
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Failed to add product', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.replace('/(seller-tabs)/products')}>
          <Icon name="arrow-left" size={24} />
        </Pressable>
        <Text style={styles.headerTitle}>Add New Product</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Input
          label="Product Name *"
          placeholder="Enter product name"
          value={name}
          onChangeText={setName}
        />

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Input
              label="Price (₹) *"
              placeholder="Enter price"
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.halfInput}>
            <Input
              label="Quantity *"
              placeholder="Enter quantity"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <Input
          label="Description"
          placeholder="Enter description"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        {/* Submit Button */}
        <Pressable
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleAddProduct}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={C.foreground} />
          ) : (
            <>
              <Icon name="plus" size={18} color={C.foreground} />
              <Text style={styles.submitButtonText}>Add Product</Text>
            </>
          )}
        </Pressable>

        <Pressable
          style={styles.cancelButton}
          onPress={() => router.replace('/(seller-tabs)/products')}
          disabled={isLoading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    color: C.foreground,
    fontSize: 18,
    fontWeight: '700',
  },
  form: {
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    color: C.foreground,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: C.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: C.foreground,
    fontSize: 14,
  },
  textArea: {
    height: 100,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  selectorGroup: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  selectorButton: {
    backgroundColor: C.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  selectorButtonActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  selectorButtonText: {
    color: C.foreground,
    fontSize: 13,
    fontWeight: '500',
  },
  selectorButtonTextActive: {
    color: C.foreground,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    marginBottom: 12,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: C.foreground,
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  cancelButtonText: {
    color: C.mutedForeground,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
