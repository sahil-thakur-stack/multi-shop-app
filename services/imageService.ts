import * as ImagePicker from 'expo-image-picker';
import FormData from 'form-data';
import api from './api';

export const imageService = {
  pickImage: async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.cancelled) {
        return result.assets[0];
      }
      return null;
    } catch (error) {
      console.error('Image picker error:', error);
      return null;
    }
  },

  uploadProductImage: async (imageUri: string, productId: number) => {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: `product-${productId}.jpg`,
      } as any);

      const res = await api.post('/api/seller/products/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  },

  uploadDocument: async (fileUri: string, documentType: string) => {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        type: 'application/pdf',
        name: `${documentType}.pdf`,
      } as any);
      formData.append('documentType', documentType);

      const res = await api.post('/api/seller/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  },
};
