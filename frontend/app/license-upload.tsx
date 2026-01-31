import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function LicenseUploadScreen() {
  const { refreshUser } = useAuth();
  const [licenseImage, setLicenseImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photos');
      return;
    }

    const result = await ImagePicker.launchImagePickerAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [16, 10],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setLicenseImage(base64Image);
    }
  };

  const handleUpload = async () => {
    if (!licenseImage) {
      Alert.alert('Error', 'Please select a license image');
      return;
    }

    setUploading(true);
    try {
      await api.post('/users/upload-license', {
        licenseUrl: licenseImage,
      });
      await refreshUser();
      Alert.alert(
        'Success',
        'License uploaded successfully. Your license is pending approval.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to upload license');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Upload License' }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Ionicons name="document-text" size={60} color="#6366f1" />
          <Text style={styles.title}>Upload Driving License</Text>
          <Text style={styles.subtitle}>
            Upload a clear photo of your driving license to start booking vehicles
          </Text>
        </View>

        {licenseImage ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: licenseImage }} style={styles.image} resizeMode="contain" />
            <TouchableOpacity style={styles.changeButton} onPress={pickImage}>
              <Text style={styles.changeButtonText}>Change Photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.uploadArea} onPress={pickImage}>
            <Ionicons name="cloud-upload-outline" size={48} color="#6366f1" />
            <Text style={styles.uploadText}>Tap to select license photo</Text>
          </TouchableOpacity>
        )}

        <View style={styles.requirements}>
          <Text style={styles.requirementsTitle}>Requirements:</Text>
          <View style={styles.requirementItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            <Text style={styles.requirementText}>License must be valid and not expired</Text>
          </View>
          <View style={styles.requirementItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            <Text style={styles.requirementText}>Photo should be clear and readable</Text>
          </View>
          <View style={styles.requirementItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            <Text style={styles.requirementText}>All corners of license should be visible</Text>
          </View>
        </View>

        {licenseImage && (
          <TouchableOpacity
            style={[styles.submitButton, uploading && styles.submitButtonDisabled]}
            onPress={handleUpload}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Submit for Approval</Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  uploadArea: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 48,
    alignItems: 'center',
    marginBottom: 32,
  },
  uploadText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
  imageContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 8,
  },
  changeButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  changeButtonText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
  },
  requirements: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  requirementText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
