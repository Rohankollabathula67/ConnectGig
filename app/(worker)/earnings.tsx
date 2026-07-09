/**
 * ConnectGig — Worker Earnings Screen (§3.12)
 * Total balance card, weekly bar chart, completed jobs list
 */

import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { Spacing, Radii, Shadows } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const CHART_DATA = [45, 60, 30, 85, 55, 40, 70];
const MAX_CHART = Math.max(...CHART_DATA);

const COMPLETED_JOBS = [
  { title: 'Home Cleaning', date: 'Oct 24, 2025 · 2:30 PM', amount: '+$45.00', icon: '🧹' },
  { title: 'Grocery Delivery', date: 'Oct 23, 2025 · 11:15 AM', amount: '+$12.50', icon: '🛒' },
  { title: 'Sink Repair', date: 'Oct 22, 2025 · 09:00 AM', amount: '+$85.00', icon: '🔧' },
  { title: 'Garden Maintenance', date: 'Oct 21, 2025 · 4:45 PM', amount: '+$60.00', icon: '🌿' },
];

export default function EarningsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Earnings</Text>
          <Pressable style={styles.calendarBtn}>
            <Calendar size={20} color={Colors.textPrimary} strokeWidth={2} />
          </Pressable>
        </View>

        {/* Total Balance Card */}
        <View style={styles.section}>
          <LinearGradient
            colors={[Colors.earningsGradientStart, Colors.earningsGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceCard}
          >
            <View style={styles.balanceHeader}>
              <Text style={styles.balanceLabel}>Total Balance</Text>
              <Pressable style={styles.withdrawBtn}>
                <Text style={styles.withdrawText}>Withdraw</Text>
              </Pressable>
            </View>
            <Text style={styles.balanceAmount}>$1,240.50</Text>
            <View style={styles.balanceStats}>
              <View style={styles.balanceStat}>
                <Text style={styles.balanceStatLabel}>This Week</Text>
                <Text style={styles.balanceStatValue}>+$420.00</Text>
              </View>
              <View style={styles.balanceStatDivider} />
              <View style={styles.balanceStat}>
                <Text style={styles.balanceStatLabel}>Completed</Text>
                <Text style={styles.balanceStatValue}>14 Jobs</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Weekly Performance */}
        <View style={styles.section}>
          <Card variant="default">
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Weekly Performance</Text>
              <Text style={styles.chartRange}>Last 7 Days</Text>
            </View>
            <View style={styles.chart}>
              {DAYS.map((day, i) => {
                const height = (CHART_DATA[i] / MAX_CHART) * 120;
                const isHighlight = i === 3; // THU highlighted in mockup
                return (
                  <View key={day} style={styles.chartColumn}>
                    <View
                      style={[
                        styles.chartBar,
                        {
                          height,
                          backgroundColor: isHighlight ? Colors.primary : Colors.primaryBg,
                        },
                      ]}
                    />
                    <Text style={[styles.chartLabel, isHighlight && styles.chartLabelActive]}>
                      {day}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Card>
        </View>

        {/* Completed Jobs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Completed Jobs</Text>
            <Pressable>
              <Text style={styles.viewAll}>View All</Text>
            </Pressable>
          </View>

          <Card variant="default" padding={0}>
            {COMPLETED_JOBS.map((job, index) => (
              <View
                key={index}
                style={[
                  styles.jobItem,
                  index < COMPLETED_JOBS.length - 1 && styles.jobItemBorder,
                ]}
              >
                <View style={styles.jobIcon}>
                  <Text style={{ fontSize: 20 }}>{job.icon}</Text>
                </View>
                <View style={styles.jobInfo}>
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <Text style={styles.jobDate}>{job.date}</Text>
                </View>
                <View style={styles.jobRight}>
                  <Text style={styles.jobAmount}>{job.amount}</Text>
                  <Badge type="paid" />
                </View>
              </View>
            ))}
          </Card>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  scrollContent: { paddingBottom: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.screenPadding, paddingTop: Spacing.lg, paddingBottom: Spacing.md, backgroundColor: Colors.background },
  title: { ...Typography.title1, color: Colors.textPrimary },
  calendarBtn: { width: 40, height: 40, borderRadius: Radii.sm, borderWidth: 1, borderColor: Colors.inputBorder, justifyContent: 'center', alignItems: 'center' },
  section: { paddingHorizontal: Spacing.screenPadding, marginTop: Spacing.xl },

  // Balance Card
  balanceCard: { borderRadius: Radii.xl, padding: Spacing.xl },
  balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  balanceLabel: { ...Typography.body2, color: 'rgba(255,255,255,0.7)' },
  withdrawBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: Radii.sm, paddingVertical: 6, paddingHorizontal: 14 },
  withdrawText: { ...Typography.caption, color: Colors.textWhite, fontWeight: '600' },
  balanceAmount: { ...Typography.statHero, color: Colors.textWhite, marginBottom: Spacing.lg },
  balanceStats: { flexDirection: 'row', alignItems: 'center' },
  balanceStat: { flex: 1 },
  balanceStatLabel: { ...Typography.caption, color: 'rgba(255,255,255,0.6)', marginBottom: 4 },
  balanceStatValue: { ...Typography.body2SemiBold, color: Colors.textWhite },
  balanceStatDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: Spacing.lg },

  // Chart
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xl },
  chartTitle: { ...Typography.body2SemiBold, color: Colors.textPrimary, fontStyle: 'italic' },
  chartRange: { ...Typography.caption, color: Colors.textMuted },
  chart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 140 },
  chartColumn: { flex: 1, alignItems: 'center', gap: 8 },
  chartBar: { width: '60%', borderRadius: 6, minHeight: 8 },
  chartLabel: { ...Typography.micro, color: Colors.textMuted },
  chartLabelActive: { color: Colors.primary, fontWeight: '700' },

  // Jobs
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { ...Typography.body2SemiBold, color: Colors.textPrimary },
  viewAll: { ...Typography.body2SemiBold, color: Colors.primary },
  jobItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xl },
  jobItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.divider },
  jobIcon: { width: 40, height: 40, borderRadius: Radii.sm, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center' },
  jobInfo: { flex: 1, gap: 2 },
  jobTitle: { ...Typography.body2SemiBold, color: Colors.textPrimary },
  jobDate: { ...Typography.caption, color: Colors.textMuted },
  jobRight: { alignItems: 'flex-end', gap: 4 },
  jobAmount: { ...Typography.body2SemiBold, color: Colors.textPrimary },
});
