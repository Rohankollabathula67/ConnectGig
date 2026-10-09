/**
 * ConnectGig — All Services Screen
 * Lists all available gig service categories in a clean grid catalog.
 */

import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { safeGoBack } from '../utils/navigation';
import { ChevronLeft } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { Spacing, Radii } from '../constants/spacing';
import { Typography } from '../constants/typography';
import { GigCard } from '../components/GigCard';
import { CATEGORIES } from '../constants/categories';

export default function AllServicesScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => safeGoBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.textPrimary} strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>All Services</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Grid */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>
          Choose a service category to specify your request and connect with nearby certified experts.
        </Text>

        <View style={styles.servicesGrid}>
          {CATEGORIES.map((cat) => (
            <View key={cat.id} style={styles.serviceItem}>
              <GigCard
                label={cat.label}
                icon={cat.icon}
                color={cat.color}
                onPress={() =>
                  router.push({
                    pathname: '/service-request',
                    params: { category: cat.label },
                  })
                }
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    backgroundColor: Colors.surface,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: Radii.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { ...Typography.title3, color: Colors.textPrimary },
  scrollContent: { paddingHorizontal: Spacing.screenPadding, paddingTop: Spacing.lg, paddingBottom: 40 },
  subtitle: { ...Typography.body2, color: Colors.textSecondary, marginBottom: Spacing.xl },

  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  serviceItem: {
    width: '50%',
    padding: Spacing.xs,
  },
});
