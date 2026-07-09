/**
 * ConnectGig — ChipGroup Component
 * Horizontal scrollable chip selector matching filter chips from mockups
 */

import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { Radii, Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';

interface ChipItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface ChipGroupProps {
  items: ChipItem[];
  selectedId?: string;
  selectedIds?: string[];
  onSelect?: (id: string) => void;
  multiSelect?: boolean;
  scrollable?: boolean;
  style?: ViewStyle;
}

export function ChipGroup({
  items,
  selectedId,
  selectedIds = [],
  onSelect,
  multiSelect = false,
  scrollable = true,
  style,
}: ChipGroupProps) {
  const isSelected = (id: string) => {
    if (multiSelect) return selectedIds.includes(id);
    return selectedId === id;
  };

  const chipContent = items.map((item) => {
    const active = isSelected(item.id);
    return (
      <Pressable
        key={item.id}
        onPress={() => onSelect?.(item.id)}
        style={[styles.chip, active && styles.chipActive]}
      >
        {item.icon}
        <Text style={[styles.chipText, active && styles.chipTextActive]}>{item.label}</Text>
      </Pressable>
    );
  });

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContainer, style]}
      >
        {chipContent}
      </ScrollView>
    );
  }

  return <View style={[styles.wrapContainer, style]}>{chipContent}</View>;
}

const styles = StyleSheet.create({
  scrollContainer: {
    gap: Spacing.sm,
    paddingRight: Spacing.xl,
  },
  wrapContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: Radii.chip,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    backgroundColor: Colors.background,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    ...Typography.body2Medium,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.textWhite,
  },
});
