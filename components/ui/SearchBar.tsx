/**
 * ConnectGig — SearchBar Component
 * Rounded search input matching "What service do you need?" from Client Home
 */

import React from 'react';
import { StyleSheet, Text, TextInput, View, ViewStyle } from 'react-native';
import { Search } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Radii, Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onFocus?: () => void;
  editable?: boolean;
  style?: ViewStyle;
}

export function SearchBar({
  placeholder = 'What service do you need?',
  value,
  onChangeText,
  onFocus,
  editable = true,
  style,
}: SearchBarProps) {
  return (
    <View style={[styles.container, style]}>
      <Search size={18} color={Colors.textMuted} strokeWidth={2} />
      {editable ? (
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
        />
      ) : (
        <Text style={styles.placeholder}>{placeholder}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBg,
    borderRadius: Radii.input,
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  input: {
    flex: 1,
    ...Typography.body2,
    color: Colors.textPrimary,
    padding: 0,
  },
  placeholder: {
    flex: 1,
    ...Typography.body2,
    color: Colors.textMuted,
  },
});
