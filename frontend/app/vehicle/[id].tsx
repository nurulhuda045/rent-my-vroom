import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../../lib/api';
import { Vehicle } from '../../lib/types';
import { useAuth } from '../../context/AuthContext';

export default function VehicleDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000));
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    fetchVehicle();
  }, [id]);

  const fetchVehicle = async () => {
    try {
      const response = await api.get(`/vehicles/${id}`);
      setVehicle(response.data);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load vehicle details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = () => {
    if (!vehicle) return 0;
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return days * vehicle.pricePerDay;
  };

  const handleBooking = async () => {
    if (!vehicle) return;

    setBooking(true);
    try {
      await api.post('/bookings', {
        vehicleId: vehicle.id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      Alert.alert(
        'Booking Request Sent',
        'Your booking request has been sent to the merchant. You will be notified once it is approved.',
        [
          {
            text: 'OK',
            onPress: () => router.push('/(tabs)/dashboard'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Booking Failed', error.response?.data?.detail || 'Failed to create booking');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ title: 'Loading...' }} />
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!vehicle) return null;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: `${vehicle.make} ${vehicle.model}` }} />
      <ScrollView>
        {vehicle.images.length > 0 ? (
          <Image source={{ uri: vehicle.images[0] }} style={styles.mainImage} />
        ) : (
          <View style={[styles.mainImage, styles.placeholderImage]}>
            <Ionicons name="car" size={60} color="#9ca3af" />
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>
                {vehicle.make} {vehicle.model}
              </Text>
              <Text style={styles.subtitle}>
                {vehicle.year} • {vehicle.color}
              </Text>
            </View>
            <View style={styles.priceBox}>
              <Text style={styles.price}>${vehicle.pricePerDay}</Text>
              <Text style={styles.priceLabel}>per day</Text>
            </View>
          </View>

          <View style={styles.specs}>
            <View style={styles.specItem}>
              <Ionicons name="people" size={20} color="#6b7280" />
              <Text style={styles.specText}>{vehicle.seats} seats</Text>
            </View>
            <View style={styles.specItem}>
              <Ionicons name="speedometer" size={20} color="#6b7280" />
              <Text style={styles.specText}>{vehicle.transmission}</Text>
            </View>
            <View style={styles.specItem}>
              <Ionicons name="flash" size={20} color="#6b7280" />
              <Text style={styles.specText}>{vehicle.fuelType}</Text>
            </View>
          </View>

          {vehicle.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{vehicle.description}</Text>
            </View>
          )}

          {vehicle.features.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Features</Text>
              <View style={styles.features}>
                {vehicle.features.map((feature, index) => (
                  <View key={index} style={styles.featureChip}>
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {vehicle.location && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={20} color="#6366f1" />
                <Text style={styles.locationText}>{vehicle.location}</Text>
              </View>
            </View>
          )}

          {user?.role !== 'MERCHANT' && (
            <View style={styles.bookingSection}>
              <Text style={styles.sectionTitle}>Book this vehicle</Text>

              <View style={styles.dateRow}>
                <View style={styles.dateColumn}>
                  <Text style={styles.label}>Start Date</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowStartPicker(true)}
                  >
                    <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                    <Text style={styles.dateText}>{startDate.toLocaleDateString()}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.dateColumn}>
                  <Text style={styles.label}>End Date</Text>
                  <TouchableOpacity style={styles.dateButton} onPress={() => setShowEndPicker(true)}>
                    <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                    <Text style={styles.dateText}>{endDate.toLocaleDateString()}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {showStartPicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setShowStartPicker(Platform.OS === 'ios');
                    if (selectedDate) {
                      setStartDate(selectedDate);
                      if (selectedDate >= endDate) {
                        setEndDate(new Date(selectedDate.getTime() + 86400000));
                      }
                    }
                  }}
                  minimumDate={new Date()}
                />
              )}

              {showEndPicker && (
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setShowEndPicker(Platform.OS === 'ios');
                    if (selectedDate) setEndDate(selectedDate);
                  }}
                  minimumDate={startDate}
                />
              )}

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Price</Text>
                <Text style={styles.totalPrice}>${calculatePrice()}</Text>
              </View>

              <TouchableOpacity
                style={[styles.bookButton, booking && styles.bookButtonDisabled]}
                onPress={handleBooking}
                disabled={booking}
              >
                {booking ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.bookButtonText}>Request Booking</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#f3f4f6',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  priceBox: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#6366f1',
  },
  priceLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  specs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  specItem: {
    alignItems: 'center',
    gap: 8,
  },
  specText: {
    fontSize: 14,
    color: '#374151',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureChip: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  featureText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    fontSize: 15,
    color: '#374151',
  },
  bookingSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dateColumn: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  dateText: {
    fontSize: 15,
    color: '#374151',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6366f1',
  },
  bookButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    opacity: 0.6,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
