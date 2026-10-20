/**
 * ConnectGig — All Services Screen (Sprint 1 — §3.3)
 * Full service catalog with:
 *   • Live search filter
 *   • Category group filter chips (All, Repairs, Home Care, Tech & Tutoring)
 *   • Grid vs. List view toggle
 *   • Pre-filled navigation to Service Request
 */

import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { safeGoBack } from '../utils/navigation';
import {
  ChevronLeft,
  Grid,
  List,
  Search,
  ArrowRight,
  Sparkles,
  Wrench,
  Zap,
  Paintbrush,
  Flower2,
  Monitor,
  Hammer,
  GraduationCap,
} from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { Spacing, Radii, Shadows } from '../constants/spacing';
import { Typography } from '../constants/typography';
import { SearchBar } from '../components/ui/SearchBar';
import { ChipGroup } from '../components/ui/ChipGroup';
import { Card } from '../components/ui/Card';
import { CATEGORIES, ServiceCategory } from '../constants/categories';

const ICON_MAP: Record<string, React.ElementType> = {
  wrench: Wrench,
  zap: Zap,
  sparkles: Sparkles,
  paintbrush: Paintbrush,
  'flower-2': Flower2,
  monitor: Monitor,
  hammer: Hammer,
  'graduation-cap': GraduationCap,
};

const FILTER_CHIPS = [
  { id: 'all', label: 'All Services' },
  { id: 'repairs', label: 'Home Repairs' },
  { id: 'cleaning', label: 'Cleaning & Care' },
  { id: 'specialized', label: 'Tech & Skills' },
];

const GROUP_CATEGORIES: Record<string, string[]> = {
  repairs: ['plumber', 'electrician', 'handyman'],
  cleaning: ['cleaner', 'painter', 'gardener'],
  specialized: ['it_support', 'tutor'],
};

// Starting estimates for display in list view
const STARTING_PRICES: Record<string, number> = {
  plumber: 350,
  electrician: 300,
  cleaner: 250,
  painter: 400,
  gardener: 200,
  it_support: 500,
  handyman: 280,
  tutor: 450,
};

export default function AllServicesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredCategories = useMemo(() => {
    return CATEGORIES.filter((cat) => {
      // Group filter
      if (selectedFilter !== 'all') {
        const allowedIds = GROUP_CATEGORIES[selectedFilter] || [];
        if (!allowedIds.includes(cat.id)) return false;
      }

      // Search query
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase();
        const matchesLabel = cat.label.toLowerCase().includes(query);
        const matchesDesc = cat.description.toLowerCase().includes(query);
        return matchesLabel || matchesDesc;
      }

      return true;
    });
  }, [searchQuery, selectedFilter]);

  const handleSelectCategory = (cat: ServiceCategory) => {
    router.push({
      pathname: '/service-request',
      params: { category: cat.label },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => safeGoBack()}
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
        >
          <ChevronLeft size={24} color={Colors.textPrimary} strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>All Services</Text>
        <View style={styles.viewToggle}>
          <Pressable
            onPress={() => setViewMode('grid')}
            style={[styles.toggleBtn, viewMode === 'grid' && styles.toggleBtnActive]}
          >
            <Grid
              size={18}
              color={viewMode === 'grid' ? Colors.primary : Colors.textMuted}
            />
          </Pressable>
          <Pressable
            onPress={() => setViewMode('list')}
            style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]}
          >
            <List
              size={18}
              color={viewMode === 'list' ? Colors.primary : Colors.textMuted}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search bar */}
        <View style={styles.searchSection}>
          <SearchBar
            placeholder="Search plumber, electrician, painting…"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter chips */}
        <View style={styles.filterSection}>
          <ChipGroup
            items={FILTER_CHIPS}
            selectedId={selectedFilter}
            onSelect={setSelectedFilter}
            scrollable
          />
        </View>

        {/* Section title & count */}
        <View style={styles.resultsMeta}>
          <Text style={styles.resultsCount}>
            {filteredCategories.length}{' '}
            {filteredCategories.length === 1 ? 'service available' : 'services available'}
          </Text>
          {selectedFilter !== 'all' || searchQuery.length > 0 ? (
            <Pressable
              onPress={() => {
                setSelectedFilter('all');
                setSearchQuery('');
              }}
            >
              <Text style={styles.resetText}>Clear filters</Text>
            </Pressable>
          ) : null}
        </View>

        {/* Catalog items */}
        {filteredCategories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Search size={44} color={Colors.textMuted} strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>No matching services</Text>
            <Text style={styles.emptySubtitle}>
              Try searching with different keywords like repairs, cleaning, or tutoring.
            </Text>
            <Pressable
              style={styles.emptyResetBtn}
              onPress={() => {
                setSearchQuery('');
                setSelectedFilter('all');
              }}
            >
              <Text style={styles.emptyResetText}>View All Services</Text>
            </Pressable>
          </View>
        ) : viewMode === 'grid' ? (
          <View style={styles.gridContainer}>
            {filteredCategories.map((cat) => {
              const IconComp = ICON_MAP[cat.icon] || Wrench;
              return (
                <Pressable
                  key={cat.id}
                  style={({ pressed }) => [styles.gridCard, pressed && styles.cardPressed]}
                  onPress={() => handleSelectCategory(cat)}
                >
                  <View style={[styles.gridIconWrap, { backgroundColor: cat.color + '15' }]}>
                    <IconComp size={28} color={cat.color} strokeWidth={2} />
                  </View>
                  <Text style={styles.gridCardTitle}>{cat.label}</Text>
                  <Text style={styles.gridCardDesc} numberOfLines={2}>
                    {cat.description}
                  </Text>
                  <View style={styles.gridCardFooter}>
                    <Text style={styles.gridStartingRate}>
                      From ₹{STARTING_PRICES[cat.id] ?? 299}
                    </Text>
                    <ArrowRight size={14} color={Colors.primary} />
                  </View>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filteredCategories.map((cat) => {
              const IconComp = ICON_MAP[cat.icon] || Wrench;
              return (
                <Pressable
                  key={cat.id}
                  style={({ pressed }) => [styles.listCard, pressed && styles.cardPressed]}
                  onPress={() => handleSelectCategory(cat)}
                >
                  <View style={[styles.listIconWrap, { backgroundColor: cat.color + '15' }]}>
                    <IconComp size={24} color={cat.color} strokeWidth={2} />
                  </View>
                  <View style={styles.listInfo}>
                    <View style={styles.listTitleRow}>
                      <Text style={styles.listTitle}>{cat.label}</Text>
                      <Text style={styles.listStartingRate}>
                        From ₹{STARTING_PRICES[cat.id] ?? 299}
                      </Text>
                    </View>
                    <Text style={styles.listDesc} numberOfLines={2}>
                      {cat.description}
                    </Text>
                  </View>
                  <ArrowRight size={16} color={Colors.textMuted} />
                </Pressable>
              );
            })}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
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
  backButtonPressed: {
    opacity: 0.6,
  },
  headerTitle: {
    ...Typography.title3,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.inputBg,
    borderRadius: Radii.md,
    padding: 3,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  toggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: Radii.sm,
  },
  toggleBtnActive: {
    backgroundColor: Colors.surface,
    ...Shadows.card,
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.lg,
  },
  searchSection: {
    marginBottom: Spacing.md,
  },
  filterSection: {
    marginBottom: Spacing.lg,
  },
  resultsMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  resultsCount: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  resetText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },

  // Grid
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  gridCard: {
    width: '47.5%',
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    ...Shadows.card,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  gridIconWrap: {
    width: 52,
    height: 52,
    borderRadius: Radii.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  gridCardTitle: {
    ...Typography.body2SemiBold,
    color: Colors.textPrimary,
    fontWeight: '700',
    marginBottom: 4,
  },
  gridCardDesc: {
    ...Typography.caption,
    color: Colors.textMuted,
    lineHeight: 16,
    height: 32,
    marginBottom: Spacing.sm,
  },
  gridCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  gridStartingRate: {
    ...Typography.micro,
    color: Colors.primary,
    fontWeight: '700',
  },

  // List
  listContainer: {
    gap: Spacing.sm,
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: Spacing.md,
    ...Shadows.card,
  },
  listIconWrap: {
    width: 48,
    height: 48,
    borderRadius: Radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listInfo: {
    flex: 1,
    gap: 2,
  },
  listTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listTitle: {
    ...Typography.body2SemiBold,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  listStartingRate: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '700',
  },
  listDesc: {
    ...Typography.caption,
    color: Colors.textMuted,
    lineHeight: 18,
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: Spacing.sm,
  },
  emptyTitle: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  emptySubtitle: {
    ...Typography.body2,
    color: Colors.textMuted,
    textAlign: 'center',
    maxWidth: 280,
  },
  emptyResetBtn: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: Radii.button,
  },
  emptyResetText: {
    ...Typography.caption,
    color: Colors.textWhite,
    fontWeight: '700',
  },
});
