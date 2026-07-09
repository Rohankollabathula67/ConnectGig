/**
 * ConnectGig — Client Tab Layout
 * Bottom tab bar with 5 tabs, center elevated map pin button
 */

import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Home, CalendarDays, MapPin, MessageCircle, User } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Shadows, Layout } from '../../constants/spacing';

export default function ClientLayout() {
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
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color, size }) => <CalendarDays size={size} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: '',
          tabBarIcon: () => (
            <View style={styles.elevatedTab}>
              <MapPin size={24} color={Colors.textWhite} strokeWidth={2.5} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, size }) => <MessageCircle size={size} color={color} strokeWidth={2} />,
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
