/**
 * ConnectGig — Worker Jobs Screen
 * Job history / calendar view
 */

import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalendarDays } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { ChipGroup } from '../../components/ui/ChipGroup';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

const TABS = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'past', label: 'Past' },
];

export default function WorkerJobsScreen() {
  const [activeTab, setActiveTab] = useState('upcoming');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Jobs</Text>
      </View>
      <View style={styles.tabs}>
        <ChipGroup items={TABS} selectedId={activeTab} onSelect={setActiveTab} scrollable={false} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        <View style={styles.empty}>
          <CalendarDays size={48} color={Colors.textMuted} strokeWidth={1.5} />
          <Text style={styles.emptyText}>
            {activeTab === 'upcoming' ? 'No upcoming jobs' : 'No past jobs yet'}
          </Text>
          <Text style={styles.emptySubtext}>
            {activeTab === 'upcoming' ? 'Stay online to receive new requests' : 'Completed jobs will appear here'}
          </Text>
        </View>
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
  list: { paddingHorizontal: Spacing.screenPadding, paddingTop: Spacing.lg },
  empty: { alignItems: 'center', paddingTop: 80, gap: Spacing.md },
  emptyText: { ...Typography.body, color: Colors.textSecondary },
  emptySubtext: { ...Typography.body2, color: Colors.textMuted, textAlign: 'center' },
});
