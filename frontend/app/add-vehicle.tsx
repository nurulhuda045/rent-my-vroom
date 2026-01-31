import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api from '../lib/api';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function AddVehicleScreen() {
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    color: '',
    licensePlate: '',
    pricePerHour: '',
    pricePerDay: '',
    seats: '',
    fuelType: '',
    transmission: 'Automatic',
    mileage: '',
    description: '',
    features: '',
    location: '',
  });
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photos');
      return;
    }

    const result = await ImagePicker.launchImagePickerAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setImages([...images, base64Image]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (
      !formData.make ||
      !formData.model ||
      !formData.year ||
      !formData.color ||
      !formData.licensePlate ||
      !formData.pricePerHour ||
      !formData.pricePerDay ||
      !formData.seats ||
      !formData.fuelType
    ) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const vehicleData = {
        ...formData,
        year: parseInt(formData.year),
        pricePerHour: parseFloat(formData.pricePerHour),
        pricePerDay: parseFloat(formData.pricePerDay),
        seats: parseInt(formData.seats),
        mileage: formData.mileage ? parseInt(formData.mileage) : undefined,
        features: formData.features
          .split(',')
          .map((f) => f.trim())
          .filter((f) => f),
        images: images,
      };

      await api.post('/vehicles', vehicleData);
      Alert.alert('Success', 'Vehicle added successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to add vehicle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Add Vehicle' }} />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid
        extraScrollHeight={20}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Photos</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
            {images.map((image, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri: image }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="close-circle" size={24} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
              <Ionicons name="camera" size={32} color="#6366f1" />
              <Text style={styles.addImageText}>Add Photo</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <TextInput
            style={styles.input}
            placeholder="Make *"
            value={formData.make}
            onChangeText={(text) => setFormData({ ...formData, make: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Model *"
            value={formData.model}
            onChangeText={(text) => setFormData({ ...formData, model: text })}
          />
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Year *"
              value={formData.year}
              onChangeText={(text) => setFormData({ ...formData, year: text })}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Color *"
              value={formData.color}
              onChangeText={(text) => setFormData({ ...formData, color: text })}
            />
          </View>
          <TextInput
            style={styles.input}
            placeholder="License Plate *"
            value={formData.licensePlate}
            onChangeText={(text) => setFormData({ ...formData, licensePlate: text })}
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing</Text>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Price per Hour *"
              value={formData.pricePerHour}
              onChangeText={(text) => setFormData({ ...formData, pricePerHour: text })}
              keyboardType="decimal-pad"
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Price per Day *"
              value={formData.pricePerDay}
              onChangeText={(text) => setFormData({ ...formData, pricePerDay: text })}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specifications</Text>
          <TextInput
            style={styles.input}
            placeholder="Number of Seats *"
            value={formData.seats}
            onChangeText={(text) => setFormData({ ...formData, seats: text })}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Fuel Type *"
            value={formData.fuelType}
            onChangeText={(text) => setFormData({ ...formData, fuelType: text })}
          />
          <View style={styles.transmissionRow}>
            <Text style={styles.label}>Transmission:</Text>
            <View style={styles.transmissionButtons}>
              <TouchableOpacity
                style={[
                  styles.transmissionButton,
                  formData.transmission === 'Automatic' && styles.transmissionButtonActive,
                ]}
                onPress={() => setFormData({ ...formData, transmission: 'Automatic' })}
              >
                <Text
                  style={[
                    styles.transmissionButtonText,
                    formData.transmission === 'Automatic' && styles.transmissionButtonTextActive,
                  ]}
                >
                  Automatic
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.transmissionButton,
                  formData.transmission === 'Manual' && styles.transmissionButtonActive,
                ]}
                onPress={() => setFormData({ ...formData, transmission: 'Manual' })}
              >
                <Text
                  style={[
                    styles.transmissionButtonText,
                    formData.transmission === 'Manual' && styles.transmissionButtonTextActive,
                  ]}
                >
                  Manual
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Mileage (optional)"
            value={formData.mileage}
            onChangeText={(text) => setFormData({ ...formData, mileage: text })}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Details</Text>
          <TextInput
            style={styles.input}
            placeholder="Location"
            value={formData.location}
            onChangeText={(text) => setFormData({ ...formData, location: text })}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
            numberOfLines={4}
          />
          <TextInput
            style={styles.input}
            placeholder="Features (comma-separated)"
            value={formData.features}
            onChangeText={(text) => setFormData({ ...formData, features: text })}
          />
          <Text style={styles.helperText}>Example: AC, GPS, Bluetooth, USB Charging</Text>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Add Vehicle</Text>
          )}
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  imageScroll: {
    marginBottom: 8,
  },
  imageContainer: {
    marginRight: 12,
    position: 'relative',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  addImageButton: {
    width: 120,
    height: 120,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageText: {
    fontSize: 12,
    color: '#6366f1',
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  transmissionRow: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  transmissionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  transmissionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  transmissionButtonActive: {
    borderColor: '#6366f1',
    backgroundColor: '#eef2ff',
  },
  transmissionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  transmissionButtonTextActive: {
    color: '#6366f1',
  },
  helperText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: -8,
  },
  submitButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 32,
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
