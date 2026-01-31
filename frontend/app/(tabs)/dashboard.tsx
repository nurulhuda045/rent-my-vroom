import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { UserRole, Vehicle, Booking, BookingStatus } from '../../lib/types';

export default function DashboardScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      if (user?.role === UserRole.MERCHANT) {
        const [vehiclesRes, bookingsRes] = await Promise.all([
          api.get('/vehicles/my'),
          api.get('/bookings/merchant'),
        ]);
        setVehicles(vehiclesRes.data);
        setBookings(bookingsRes.data);
      } else {
        const response = await api.get('/bookings/renter');
        setBookings(response.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.APPROVED:
        return '#10b981';
      case BookingStatus.REJECTED:
      case BookingStatus.CANCELLED:
        return '#ef4444';
      case BookingStatus.COMPLETED:
        return '#6b7280';
      default:
        return '#f59e0b';
    }
  };

  const renderVehicleCard = ({ item }: { item: Vehicle }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/vehicle/${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardTitle}>
            {item.make} {item.model}
          </Text>
          <Text style={styles.cardSubtitle}>
            {item.year} • {item.licensePlate}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: item.isAvailable ? '#d1fae5' : '#fee2e2' }]}>
          <Text style={{ color: item.isAvailable ? '#10b981' : '#ef4444', fontWeight: '600' }}>
            {item.isAvailable ? 'Available' : 'Unavailable'}
          </Text>
        </View>
      </View>
      <Text style={styles.price}>${item.pricePerDay}/day</Text>
    </TouchableOpacity>
  );

  const renderBookingCard = ({ item }: { item: Booking }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/booking/${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>
            {item.vehicle ? `${item.vehicle.make} ${item.vehicle.model}` : 'Vehicle'}
          </Text>
          <Text style={styles.cardSubtitle}>
            {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
          </Text>
          {user?.role === UserRole.MERCHANT && item.renter && (
            <Text style={styles.cardSubtitle}>
              Renter: {item.renter.firstName} {item.renter.lastName}
            </Text>
          )}
        </View>
        <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={{ color: getStatusColor(item.status), fontWeight: '600', fontSize: 12 }}>
            {item.status}
          </Text>
        </View>
      </View>
      <Text style={styles.price}>${item.totalPrice}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {user?.role === UserRole.MERCHANT ? (
        <FlatList
          data={vehicles}
          renderItem={renderVehicleCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListHeaderComponent={
            <View>
              <View style={styles.headerSection}>
                <Text style={styles.sectionTitle}>My Vehicles</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => router.push('/add-vehicle')}
                >
                  <Ionicons name="add" size={20} color="#fff" />
                  <Text style={styles.addButtonText}>Add Vehicle</Text>
                </TouchableOpacity>
              </View>
              {vehicles.length === 0 && (
                <View style={styles.emptySection}>
                  <Text style={styles.emptyText}>No vehicles yet</Text>
                </View>
              )}
            </View>
          }
          ListFooterComponent={
            bookings.length > 0 ? (
              <View>
                <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Booking Requests</Text>
                {bookings.map((booking) => (
                  <View key={booking.id}>{renderBookingCard({ item: booking })}</View>
                ))}
              </View>
            ) : null
          }
        />
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBookingCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListHeaderComponent={
            <Text style={styles.sectionTitle}>My Bookings</Text>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="calendar-outline" size={60} color="#d1d5db" />
              <Text style={styles.emptyText}>No bookings yet</Text>
              <Text style={styles.emptySubtext}>Browse vehicles to make your first booking</Text>
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
    backgroundColor: '#f9fafb',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#6366f1',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    gap: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 2,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6366f1',
    marginTop: 4,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptySection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
});
