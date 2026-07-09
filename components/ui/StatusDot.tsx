/**
 * ConnectGig — StatusDot Component
 * Small colored indicator for online/offline/busy status
 */

import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';

type StatusType = 'online' | 'offline' | 'busy';

interface StatusDotProps {
  status?: StatusType;
  size?: number;
  style?: ViewStyle;
}

const STATUS_COLORS: Record<StatusType, string> = {
  online: Colors.online,
  offline: Colors.textMuted,
  busy: Colors.warning,
};

export function StatusDot({ status = 'online', size = 8, style }: StatusDotProps) {
  return (
    <View
      style={[
        styles.dot,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: STATUS_COLORS[status],
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  dot: {},
});
