import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';

const { width } = Dimensions.get('window');

// ─── Bible Promises ───────────────────────────────────────────────────────────
const BIBLE_QUOTES = [
  {
    id: '1',
    quote: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
    verse: 'John 3:16',
    accent: '#F6AD55',
  },
  {
    id: '2',
    quote: 'I can do all this through him who gives me strength.',
    verse: 'Philippians 4:13',
    accent: '#68D391',
  },
  {
    id: '3',
    quote: 'The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures.',
    verse: 'Psalm 23:1-2',
    accent: '#76E4F7',
  },
  {
    id: '4',
    quote: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him.',
    verse: 'Proverbs 3:5-6',
    accent: '#B794F4',
  },
  {
    id: '5',
    quote: 'Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.',
    verse: 'Joshua 1:9',
    accent: '#FC8181',
  },
  {
    id: '6',
    quote: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
    verse: 'Romans 8:28',
    accent: '#F6E05E',
  },
  {
    id: '7',
    quote: 'Come to me, all you who are weary and burdened, and I will give you rest.',
    verse: 'Matthew 11:28',
    accent: '#9AE6B4',
  },
  {
    id: '8',
    quote: 'The Lord bless you and keep you; the Lord make his face shine on you and be gracious to you.',
    verse: 'Numbers 6:24-25',
    accent: '#F687B3',
  },
  {
    id: '9',
    quote: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.',
    verse: 'Philippians 4:6',
    accent: '#63B3ED',
  },
  {
    id: '10',
    quote: 'The Lord is close to the brokenhearted and saves those who are crushed in spirit.',
    verse: 'Psalm 34:18',
    accent: '#FBD38D',
  },
  {
    id: '11',
    quote: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.',
    verse: 'Jeremiah 29:11',
    accent: '#9F7AEA',
  },
  {
    id: '12',
    quote: 'He gives strength to the weary and increases the power of the weak.',
    verse: 'Isaiah 40:29',
    accent: '#48BB78',
  },
  {
    id: '13',
    quote: 'Cast all your anxiety on him because he cares for you.',
    verse: '1 Peter 5:7',
    accent: '#F6AD55',
  },
  {
    id: '14',
    quote: 'This is the day the Lord has made; let us rejoice and be glad in it.',
    verse: 'Psalm 118:24',
    accent: '#76E4F7',
  },
];

// ─── Pick today's quote (same all day, changes at midnight) ───────────────────
function getTodaysQuote() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return BIBLE_QUOTES[dayOfYear % BIBLE_QUOTES.length];
}

// ─── Format today's date nicely ──────────────────────────────────────────────
function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ─── Schedule daily 6 AM notification ───────────────────────────────────────
async function scheduleDailyReminder(quote: typeof BIBLE_QUOTES[0]) {
  // Cancel any existing scheduled notifications first
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '✦ Today\'s Promise ✦',
      body: `"${quote.quote}" — ${quote.verse}`,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 6,
      minute: 0,
    },
  });
}

// ─── Request notification permissions ────────────────────────────────────────
async function requestPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const todaysQuote = getTodaysQuote();
  const [reminderSet, setReminderSet] = useState(false);

  useEffect(() => {
    setupNotification();
  }, []);

  const setupNotification = async () => {
    const granted = await requestPermissions();
    if (granted) {
      await scheduleDailyReminder(todaysQuote);
      setReminderSet(true);
    }
  };

  const handleReminderPress = async () => {
    const granted = await requestPermissions();
    if (!granted) {
      Alert.alert(
        'Permission Required',
        'Please allow notifications in your phone settings to receive daily promises.',
        [{ text: 'OK' }]
      );
      return;
    }
    await scheduleDailyReminder(todaysQuote);
    setReminderSet(true);
    Alert.alert(
      '🔔 Reminder Set!',
      "You'll receive today's promise every day at 6:00 AM.",
      [{ text: 'Amen 🙏' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerLabel}>✦ DAILY PROMISE ✦</Text>
        <Text style={styles.headerTitle}>God's Word</Text>
        <Text style={styles.headerDate}>{formatDate(new Date())}</Text>
      </View>

      {/* Quote Card */}
      <View style={styles.cardWrapper}>
        {/* Background glow */}
        <View style={[styles.glowBlob, { backgroundColor: todaysQuote.accent + '25' }]} />

        <View style={styles.card}>
          {/* Top accent bar */}
          <View style={[styles.accentLine, { backgroundColor: todaysQuote.accent }]} />

          {/* Open quote mark */}
          <Text style={[styles.quoteSymbol, { color: todaysQuote.accent }]}>"</Text>

          {/* The promise */}
          <Text style={styles.quoteText}>{todaysQuote.quote}</Text>

          {/* Close quote mark */}
          <Text style={[styles.quoteSymbolEnd, { color: todaysQuote.accent }]}>"</Text>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: todaysQuote.accent + '50' }]} />

          {/* Verse reference */}
          <Text style={[styles.verse, { color: todaysQuote.accent }]}>
            — {todaysQuote.verse}
          </Text>
        </View>
      </View>

      {/* Reminder Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.reminderBtn,
            reminderSet && { borderColor: todaysQuote.accent + '80' },
          ]}
          onPress={handleReminderPress}
          activeOpacity={0.7}
        >
          <Text style={styles.reminderIcon}>{reminderSet ? '🔔' : '🔕'}</Text>
          <Text style={[styles.reminderText, reminderSet && { color: todaysQuote.accent }]}>
            {reminderSet ? 'Daily Reminder Active · 6:00 AM' : 'Set Daily Reminder'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          A new promise unlocks every day at midnight ✦
        </Text>
      </View>

    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },

  // Header
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 12,
    paddingHorizontal: 24,
  },
  headerLabel: {
    color: '#555',
    fontSize: 11,
    letterSpacing: 4,
    fontWeight: '600',
    marginBottom: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  headerDate: {
    color: '#444',
    fontSize: 13,
    letterSpacing: 0.5,
  },

  // Card
  cardWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  glowBlob: {
    position: 'absolute',
    width: width * 0.85,
    height: width * 0.85,
    borderRadius: 999,
  },
  card: {
    backgroundColor: '#13131A',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    borderWidth: 1,
    borderColor: '#1E1E2E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
    elevation: 20,
  },
  accentLine: {
    height: 3,
    width: 48,
    borderRadius: 2,
    marginBottom: 20,
  },
  quoteSymbol: {
    fontSize: 64,
    lineHeight: 56,
    fontWeight: '900',
    marginBottom: 4,
    opacity: 0.9,
  },
  quoteText: {
    color: '#E2E8F0',
    fontSize: 18,
    lineHeight: 30,
    fontWeight: '400',
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  quoteSymbolEnd: {
    fontSize: 64,
    lineHeight: 40,
    fontWeight: '900',
    textAlign: 'right',
    opacity: 0.9,
  },
  divider: {
    height: 1,
    marginVertical: 20,
    borderRadius: 1,
  },
  verse: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.5,
    textAlign: 'right',
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 16,
  },
  reminderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#13131A',
    borderRadius: 50,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#1E1E2E',
    width: '100%',
    justifyContent: 'center',
  },
  reminderIcon: {
    fontSize: 18,
  },
  reminderText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  footerNote: {
    color: '#333',
    fontSize: 12,
    letterSpacing: 1,
    textAlign: 'center',
  },
});
