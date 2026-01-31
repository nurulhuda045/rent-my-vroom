import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../lib/api';
import { Booking, BookingStatus } from '../../lib/types';
import { useAuth } from '../../context/AuthContext';

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      // First try renter endpoint, then merchant
      let response;
      try {
        const renterRes = await api.get('/bookings/renter');
        const found = renterRes.data.find((b: Booking) => b.id === id);
        if (found) {
          response = { data: found };
        }
      } catch (e) {}

      if (!response) {
        const merchantRes = await api.get('/bookings/merchant');
        const found = merchantRes.data.find((b: Booking) => b.id === id);
        if (found) {
          response = { data: found };
        }
      }

      if (response) {
        setBooking(response.data);
      } else {
        throw new Error('Booking not found');
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load booking details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!booking) return;
    setActionLoading(true);
    try {
      await api.patch(`/bookings/${booking.id}/accept`, {});
      Alert.alert('Success', 'Booking accepted', [{ text: 'OK', onPress: fetchBooking }]);
      console.log('Mock Notification: Booking approved email sent to renter');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to accept booking');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!booking) return;
    Alert.alert('Reject Booking', 'Are you sure you want to reject this booking?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(true);
          try {
            await api.patch(`/bookings/${booking.id}/reject`, {});
            Alert.alert('Success', 'Booking rejected', [{ text: 'OK', onPress: fetchBooking }]);
          } catch (error: any) {
            Alert.alert('Error', error.response?.data?.detail || 'Failed to reject booking');
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const handleComplete = async () => {
    if (!booking) return;
    Alert.alert('Complete Booking', 'Mark this booking as completed?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Complete',
        onPress: async () => {
          setActionLoading(true);
          try {
            await api.patch(`/bookings/${booking.id}/complete`, {});
            Alert.alert('Success', 'Booking completed', [{ text: 'OK', onPress: fetchBooking }]);
          } catch (error: any) {
            Alert.alert('Error', error.response?.data?.detail || 'Failed to complete booking');
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
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

  if (loading) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ title: 'Loading...' }} />
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!booking) return null;

  const isMerchant = user?.id === booking.merchantId;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Booking Details' }} />
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.statusBadge} style={{ backgroundColor: getStatusColor(booking.status) + '20' }}>
            <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
              {booking.status}
            </Text>
          </View>
        </View>

        {booking.vehicle && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vehicle</Text>
            <Text style={styles.vehicleText}>
              {booking.vehicle.make} {booking.vehicle.model}
            </Text>
            <Text style={styles.subtitle}>
              {booking.vehicle.year} • {booking.vehicle.color} • {booking.vehicle.licensePlate}
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rental Period</Text>
          <View style={styles.dateRow}>
            <View style={styles.dateBox}>
              <Ionicons name="calendar-outline" size={20} color="#6366f1" />
              <Text style={styles.dateLabel}>Start</Text>
              <Text style={styles.dateText}>{new Date(booking.startDate).toLocaleDateString()}</Text>
            </View>
            <View style={styles.dateBox}>
              <Ionicons name="calendar-outline" size={20} color="#6366f1" />
              <Text style={styles.dateLabel}>End</Text>
              <Text style={styles.dateText}>{new Date(booking.endDate).toLocaleDateString()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isMerchant ? 'Renter' : 'Merchant'}</Text>
          <Text style={styles.contactText}>
            {isMerchant && booking.renter
              ? `${booking.renter.firstName} ${booking.renter.lastName}`
              : booking.merchant
              ? `${booking.merchant.firstName} ${booking.merchant.lastName}`
              : 'N/A'}
          </Text>
          {((isMerchant && booking.renter?.email) || booking.merchant?.email) && (
            <Text style={styles.contactSubtext}>
              {isMerchant ? booking.renter?.email : booking.merchant?.email}
            </Text>
          )}
        </View>

        {booking.renterNotes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Renter Notes</Text>
            <Text style={styles.notesText}>{booking.renterNotes}</Text>
          </View>
        )}

        {booking.merchantNotes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Merchant Notes</Text>
            <Text style={styles.notesText}>{booking.merchantNotes}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Total Price</Text>
          <Text style={styles.priceText}>${booking.totalPrice}</Text>
        </View>

        {booking.status === BookingStatus.APPROVED && (
          <TouchableOpacity
            style={styles.messageButton}
            onPress={() => router.push(`/messages/${booking.id}`)}
          >
            <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
            <Text style={styles.messageButtonText}>Send Message</Text>
          </TouchableOpacity>
        )}

        {isMerchant && booking.status === BookingStatus.PENDING && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={handleReject}
              disabled={actionLoading}
            >
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={handleAccept}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.acceptButtonText}>Accept</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {isMerchant && booking.status === BookingStatus.APPROVED && (
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={handleComplete}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.completeButtonText}>Mark as Completed</Text>
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '700',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  vehicleText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateBox: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 4,
  },
  contactText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  contactSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  notesText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  priceText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#6366f1',
  },
  messageButton: {
    flexDirection: 'row',
    backgroundColor: '#6366f1',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  messageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  rejectButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  acceptButton: {
    backgroundColor: '#10b981',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: '#6366f1',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 32,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
