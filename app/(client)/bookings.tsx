/**
 * ConnectGig — Client Bookings Screen
 * Booking history with status tabs
 */

import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalendarDays, Clock, CheckCircle2, XCircle } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Spacing, Radii, Shadows } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { ChipGroup } from '../../components/ui/ChipGroup';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';

const TABS = [
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

const MOCK_BOOKINGS = [
  { id: '1', service: 'Kitchen Sink Repair', worker: 'David Chen', status: 'active', date: 'Today, 2:00 PM', amount: '$45', category: 'Plumber' },
  { id: '2', service: 'Home Deep Cleaning', worker: 'Sarah Jenkins', status: 'completed', date: 'Oct 24, 2025', amount: '$45', category: 'Cleaner' },
  { id: '3', service: 'AC Installation', worker: 'Marcus Rivera', status: 'completed', date: 'Oct 22, 2025', amount: '$85', category: 'Electrician' },
];

export default function BookingsScreen() {
  const [activeTab, setActiveTab] = useState('active');

  const filteredBookings = MOCK_BOOKINGS.filter((b) => b.status === activeTab);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Bookings</Text>
      </View>

      <View style={styles.tabs}>
        <ChipGroup
          items={TABS}
          selectedId={activeTab}
          onSelect={setActiveTab}
          scrollable={false}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {filteredBookings.length === 0 ? (
          <View style={styles.empty}>
            <CalendarDays size={48} color={Colors.textMuted} strokeWidth={1.5} />
            <Text style={styles.emptyText}>No {activeTab} bookings</Text>
          </View>
        ) : (
          filteredBookings.map((booking) => (
            <Card key={booking.id} variant="default" style={styles.bookingCard}>
              <View style={styles.bookingRow}>
                <Avatar name={booking.worker} size="md" />
                <View style={styles.bookingInfo}>
                  <Text style={styles.bookingService}>{booking.service}</Text>
                  <Text style={styles.bookingWorker}>{booking.worker}</Text>
                  <Text style={styles.bookingDate}>{booking.date}</Text>
                </View>
                <View style={styles.bookingRight}>
                  <Text style={styles.bookingAmount}>{booking.amount}</Text>
                  <Badge
                    type={booking.status === 'active' ? 'online' : booking.status === 'completed' ? 'paid' : 'urgent'}
                    label={booking.status === 'active' ? 'Active' : booking.status === 'completed' ? 'Done' : 'Cancelled'}
                  />
                </View>
              </View>
            </Card>
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: { paddingHorizontal: Spacing.screenPadding, paddingTop: Spacing.lg, paddingBottom: Spacing.md, backgroundColor: Colors.background },
  title: { ...Typography.title1, color: Colors.textPrimary },
  tabs: { paddingHorizontal: Spacing.screenPadding, paddingBottom: Spacing.lg, backgroundColor: Colors.background },
  list: { paddingHorizontal: Spacing.screenPadding, paddingTop: Spacing.lg, gap: Spacing.md },
  bookingCard: { },
  bookingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  bookingInfo: { flex: 1, gap: 2 },
  bookingService: { ...Typography.body2SemiBold, color: Colors.textPrimary },
  bookingWorker: { ...Typography.caption, color: Colors.textSecondary },
  bookingDate: { ...Typography.caption, color: Colors.textMuted },
  bookingRight: { alignItems: 'flex-end', gap: 6 },
  bookingAmount: { ...Typography.body2SemiBold, color: Colors.textPrimary },
  empty: { alignItems: 'center', paddingTop: 80, gap: Spacing.lg },
  emptyText: { ...Typography.body, color: Colors.textMuted },
});
