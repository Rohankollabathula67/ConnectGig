/**
 * ConnectGig — Worker Tab Layout
 * Bottom tab bar: Dashboard, Earnings, center "+" action, Jobs, Profile
 */

import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { LayoutDashboard, DollarSign, Plus, CalendarDays, User } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Shadows, Layout } from '../../constants/spacing';

export default function WorkerLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.tabActive,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarLabelStyle: { ...Typography.micro, marginTop: 2 },
        tabBarStyle: {
          ...Shadows.tabBar,
          backgroundColor: Colors.tabBarBg,
          borderTopColor: Colors.tabBarBorder,
          height: Layout.tabBarHeight,
          paddingBottom: 10,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: 'Earnings',
          tabBarIcon: ({ color, size }) => <DollarSign size={size} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: '',
          tabBarIcon: () => (
            <View style={styles.elevatedTab}>
              <Plus size={28} color={Colors.textWhite} strokeWidth={2.5} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} strokeWidth={2} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  elevatedTab: {
    width: Layout.tabBarElevatedSize,
    height: Layout.tabBarElevatedSize,
    borderRadius: Layout.tabBarElevatedSize / 2,
    backgroundColor: Colors.tabElevatedBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    ...Shadows.floating,
  },
});
