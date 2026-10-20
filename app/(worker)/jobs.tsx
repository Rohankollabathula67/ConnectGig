/**
 * ConnectGig — Worker Jobs Screen (Sprint 1 — §3.10)
 * Tabbed view of a worker's service requests:
 *   • Active   — currently accepted / in_progress jobs
 *   • Pending  — searching requests awaiting acceptance
 *   • History  — completed / cancelled jobs
 *
 * Connects to Firestore `serviceRequests` collection in real Firebase mode;
 * falls back to curated mock data in Demo / Simulation Mode.
 */

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  MessageCircle,
  Navigation,
  XCircle,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { Colors } from '../../constants/colors';
import { Radii, Shadows, Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ChipGroup } from '../../components/ui/ChipGroup';
import { db, IS_FIREBASE_ENABLED } from '../../services/firebase';
import { firestoreService } from '../../services/firestore';
import { useAuthStore } from '../../store/authStore';
import { useRequestStore } from '../../store/requestStore';
import { formatCurrency } from '../../utils/currency';
import type { ServiceRequest } from '../../types/serviceRequest';

// ── Tab config ────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'active', label: 'Active' },
  { id: 'pending', label: 'Pending' },
  { id: 'history', label: 'History' },
];

// ── Curated mock jobs for Demo Mode ──────────────────────────────────────────
const MOCK_ACTIVE: ServiceRequest[] = [
  {
    requestId: 'mock-req-active-1',
    clientId: 'mock-client-1',
    category: 'Electrician',
    description: 'Tripping circuit breaker needs inspection and fix.',
    budgetTier: 'standard',
    estimatedCost: 450,
    preferredDate: new Date().toDateString(),
    preferredTimeOfDay: 'afternoon',
    clientLocation: { lat: 17.385, lng: 78.486, geohash: '', address: '12 MG Road, Hyderabad' },
    status: 'in_progress',
    currentRadiusKm: 8,
    broadcastedProviderIds: [],
    acceptedProviderId: 'mock-worker-uid',
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    acceptedAt: new Date(Date.now() - 1000 * 60 * 20),
  },
];

const MOCK_PENDING: ServiceRequest[] = [
  {
    requestId: 'mock-req-pending-1',
    clientId: 'mock-client-2',
    category: 'Electrician',
    description: 'New AC installation and wiring.',
    budgetTier: 'premium',
    estimatedCost: 750,
    preferredDate: new Date(Date.now() + 86400000).toDateString(),
    preferredTimeOfDay: 'morning',
    clientLocation: { lat: 17.391, lng: 78.479, geohash: '', address: '5 Banjara Hills, Hyderabad' },
    status: 'searching',
    currentRadiusKm: 5,
    broadcastedProviderIds: [],
    acceptedProviderId: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
  },
];

const MOCK_HISTORY: ServiceRequest[] = [
  {
    requestId: 'mock-req-hist-1',
    clientId: 'mock-client-3',
    category: 'Electrician',
    description: 'Chandelier installation in dining room.',
    budgetTier: 'standard',
    estimatedCost: 380,
    preferredDate: new Date(Date.now() - 86400000 * 2).toDateString(),
    preferredTimeOfDay: 'afternoon',
    clientLocation: { lat: 17.41, lng: 78.49, geohash: '', address: '8 Jubilee Hills, Hyderabad' },
    status: 'completed',
    currentRadiusKm: 8,
    broadcastedProviderIds: [],
    acceptedProviderId: 'mock-worker-uid',
    createdAt: new Date(Date.now() - 86400000 * 2),
    acceptedAt: new Date(Date.now() - 86400000 * 2 + 600000),
    completedAt: new Date(Date.now() - 86400000 * 2 + 7200000),
  },
  {
    requestId: 'mock-req-hist-2',
    clientId: 'mock-client-4',
    category: 'Electrician',
    description: 'Power socket replacement — 3 rooms.',
    budgetTier: 'quick_fix',
    estimatedCost: 250,
    preferredDate: new Date(Date.now() - 86400000 * 5).toDateString(),
    preferredTimeOfDay: 'morning',
    clientLocation: { lat: 17.372, lng: 78.472, geohash: '', address: '21 Madhapur, Hyderabad' },
    status: 'cancelled',
    currentRadiusKm: 8,
    broadcastedProviderIds: [],
    acceptedProviderId: null,
    createdAt: new Date(Date.now() - 86400000 * 5),
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `${days}d ago`;
  if (hrs > 0) return `${hrs}h ago`;
  return `${mins}m ago`;
}

function statusColor(status: ServiceRequest['status']): string {
  switch (status) {
    case 'in_progress': return Colors.primary;
    case 'accepted': return '#10B981';
    case 'searching': return Colors.warning ?? '#F59E0B';
    case 'completed': return '#10B981';
    case 'cancelled': return Colors.error ?? '#EF4444';
    default: return Colors.textMuted;
  }
}

function statusLabel(status: ServiceRequest['status']): string {
  switch (status) {
    case 'in_progress': return 'In Progress';
    case 'accepted': return 'Accepted';
    case 'searching': return 'Open Request';
    case 'completed': return 'Completed';
    case 'cancelled': return 'Cancelled';
    case 'expired': return 'Expired';
    default: return status;
  }
}

// ── Job Card ──────────────────────────────────────────────────────────────────
interface JobCardProps {
  job: ServiceRequest;
  tab: string;
  onAccept?: (id: string) => void;
  onNavigate?: (id: string) => void;
  onMessage?: (id: string) => void;
  onComplete?: (id: string) => void;
}

function JobCard({ job, tab, onAccept, onNavigate, onMessage, onComplete }: JobCardProps) {
  const isActive = tab === 'active';
  const isPending = tab === 'pending';
  const isHistory = tab === 'history';
  const isCompleted = job.status === 'completed';
  const isCancelled = job.status === 'cancelled';

  return (
    <Card variant="elevated" style={styles.jobCard}>
      {/* Status bar */}
      <View style={[styles.statusBar, { backgroundColor: statusColor(job.status) }]} />

      <View style={styles.jobContent}>
        {/* Header row */}
        <View style={styles.jobHeader}>
          <View style={styles.jobTitleRow}>
            <Text style={styles.jobCategory}>{job.category}</Text>
            <View style={[styles.statusPill, { backgroundColor: statusColor(job.status) + '20' }]}>
              <Text style={[styles.statusPillText, { color: statusColor(job.status) }]}>
                {statusLabel(job.status)}
              </Text>
            </View>
          </View>
          <Text style={styles.jobAmount}>{formatCurrency(job.estimatedCost)}</Text>
        </View>

        {/* Description */}
        <Text style={styles.jobDesc} numberOfLines={2}>{job.description}</Text>

        {/* Location row */}
        {job.clientLocation?.address && (
          <View style={styles.jobMeta}>
            <MapPin size={12} color={Colors.textMuted} />
            <Text style={styles.jobMetaText} numberOfLines={1}>{job.clientLocation.address}</Text>
          </View>
        )}

        {/* Date row */}
        <View style={styles.jobMeta}>
          <Clock size={12} color={Colors.textMuted} />
          <Text style={styles.jobMetaText}>
            {isCompleted && job.completedAt
              ? `Completed ${timeAgo(new Date(job.completedAt))}`
              : `Requested ${timeAgo(new Date(job.createdAt))}`}
          </Text>
        </View>

        {/* Action buttons */}
        {isActive && (
          <View style={styles.actionRow}>
            <Button
              variant="ghost"
              size="sm"
              onPress={() => onMessage?.(job.clientId)}
              style={styles.actionBtn}
            >
              <MessageCircle size={14} color={Colors.primary} />
              <Text style={styles.actionBtnText}>Message</Text>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onPress={() => onNavigate?.(job.requestId)}
              style={styles.actionBtn}
            >
              <Navigation size={14} color={Colors.primary} />
              <Text style={styles.actionBtnText}>Navigate</Text>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onPress={() => onComplete?.(job.requestId)}
              style={[styles.actionBtn, styles.completeBtn]}
            >
              <CheckCircle2 size={14} color="#fff" />
              <Text style={styles.completeBtnText}>Complete</Text>
            </Button>
          </View>
        )}

        {isPending && (
          <View style={styles.actionRow}>
            <Button
              variant="primary"
              size="sm"
              onPress={() => onAccept?.(job.requestId)}
              style={[styles.actionBtn, styles.acceptBtn]}
            >
              <Text style={styles.completeBtnText}>Accept Job</Text>
            </Button>
          </View>
        )}

        {isHistory && isCompleted && (
          <View style={styles.historyRow}>
            <CheckCircle2 size={14} color="#10B981" />
            <Text style={[styles.jobMetaText, { color: '#10B981' }]}>Job completed successfully</Text>
          </View>
        )}

        {isHistory && isCancelled && (
          <View style={styles.historyRow}>
            <XCircle size={14} color={Colors.error ?? '#EF4444'} />
            <Text style={[styles.jobMetaText, { color: Colors.error ?? '#EF4444' }]}>Request was cancelled</Text>
          </View>
        )}
      </View>
    </Card>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function WorkerJobsScreen() {
  const [activeTab, setActiveTab] = useState('active');
  const [activeJobs, setActiveJobs] = useState<ServiceRequest[]>([]);
  const [pendingJobs, setPendingJobs] = useState<ServiceRequest[]>([]);
  const [historyJobs, setHistoryJobs] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuthStore();
  const { acceptRequest, completeRequest } = useRequestStore();
  const workerId = user?.uid ?? 'mock-worker-uid';

  // ── Subscribe to Firestore job collections ────────────────────────────────
  useEffect(() => {
    if (!IS_FIREBASE_ENABLED) {
      // Demo mode: use curated mock data
      setActiveJobs(MOCK_ACTIVE);
      setPendingJobs(MOCK_PENDING);
      setHistoryJobs(MOCK_HISTORY);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Active jobs — accepted or in_progress by this worker
    const activeQ = query(
      collection(db, 'serviceRequests'),
      where('acceptedProviderId', '==', workerId),
      where('status', 'in', ['accepted', 'in_progress']),
      orderBy('acceptedAt', 'desc')
    );

    // Pending — open requests in the worker's categories (simplified: all searching)
    const pendingQ = query(
      collection(db, 'serviceRequests'),
      where('status', '==', 'searching'),
      orderBy('createdAt', 'desc')
    );

    // History — completed or cancelled by this worker
    const historyQ = query(
      collection(db, 'serviceRequests'),
      where('acceptedProviderId', '==', workerId),
      where('status', 'in', ['completed', 'cancelled']),
      orderBy('createdAt', 'desc')
    );

    const unsubActive = onSnapshot(activeQ, (snap) => {
      setActiveJobs(snap.docs.map((d) => ({ requestId: d.id, ...(d.data() as Omit<ServiceRequest, 'requestId'>) })));
      setLoading(false);
    }, () => { setActiveJobs(MOCK_ACTIVE); setLoading(false); });

    const unsubPending = onSnapshot(pendingQ, (snap) => {
      setPendingJobs(snap.docs.map((d) => ({ requestId: d.id, ...(d.data() as Omit<ServiceRequest, 'requestId'>) })));
    }, () => setPendingJobs(MOCK_PENDING));

    const unsubHistory = onSnapshot(historyQ, (snap) => {
      setHistoryJobs(snap.docs.map((d) => ({ requestId: d.id, ...(d.data() as Omit<ServiceRequest, 'requestId'>) })));
    }, () => setHistoryJobs(MOCK_HISTORY));

    return () => { unsubActive(); unsubPending(); unsubHistory(); };
  }, [workerId]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAccept = async (requestId: string) => {
    await acceptRequest(requestId, workerId, user?.displayName ?? 'Worker', 4.8);
  };

  const handleComplete = (requestId: string) => {
    Alert.alert(
      'Complete Job',
      'Mark this job as completed? The client will be prompted to rate you.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            await completeRequest(requestId);
            router.push('/rating');
          },
        },
      ]
    );
  };

  const handleNavigate = (requestId: string) => {
    router.push('/job-tracking');
  };

  const handleMessage = (clientId: string) => {
    router.push({ pathname: '/chat/[id]', params: { id: clientId } } as any);
  };

  // ── Current tab data ──────────────────────────────────────────────────────
  const currentJobs =
    activeTab === 'active' ? activeJobs :
    activeTab === 'pending' ? pendingJobs :
    historyJobs;

  const tabCounts = {
    active: activeJobs.length,
    pending: pendingJobs.length,
    history: historyJobs.length,
  };

  const tabItems = TABS.map((t) => ({
    ...t,
    label: tabCounts[t.id as keyof typeof tabCounts] > 0
      ? `${t.label} (${tabCounts[t.id as keyof typeof tabCounts]})`
      : t.label,
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <Text style={styles.title}>My Jobs</Text>
          {activeJobs.length > 0 && (
            <Badge type="online" label={`${activeJobs.length} Active`} />
          )}
        </View>
        <View style={styles.tabs}>
          <ChipGroup items={tabItems} selectedId={activeTab} onSelect={setActiveTab} scrollable={false} />
        </View>
      </LinearGradient>

      {/* Job list */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading jobs…</Text>
          </View>
        ) : currentJobs.length === 0 ? (
          <View style={styles.empty}>
            {activeTab === 'active' ? (
              <Briefcase size={52} color={Colors.textMuted} strokeWidth={1.5} />
            ) : activeTab === 'pending' ? (
              <Clock size={52} color={Colors.textMuted} strokeWidth={1.5} />
            ) : (
              <CalendarDays size={52} color={Colors.textMuted} strokeWidth={1.5} />
            )}
            <Text style={styles.emptyText}>
              {activeTab === 'active'
                ? 'No active jobs right now'
                : activeTab === 'pending'
                ? 'No open requests nearby'
                : 'No job history yet'}
            </Text>
            <Text style={styles.emptySubtext}>
              {activeTab === 'active'
                ? 'Stay online to receive and accept new requests'
                : activeTab === 'pending'
                ? 'New client requests will appear here'
                : 'Completed and cancelled jobs will appear here'}
            </Text>
          </View>
        ) : (
          currentJobs.map((job) => (
            <JobCard
              key={job.requestId}
              job={job}
              tab={activeTab}
              onAccept={handleAccept}
              onComplete={handleComplete}
              onNavigate={handleNavigate}
              onMessage={handleMessage}
            />
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    paddingBottom: Spacing.md,
    backgroundColor: Colors.background,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  title: {
    ...Typography.title1,
    color: Colors.textPrimary,
  },
  tabs: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.sm,
  },
  list: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  centered: {
    alignItems: 'center',
    paddingTop: 80,
    gap: Spacing.md,
  },
  loadingText: {
    ...Typography.body2,
    color: Colors.textMuted,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  emptySubtext: {
    ...Typography.body2,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Job card
  jobCard: {
    overflow: 'hidden',
    padding: 0,
  },
  statusBar: {
    height: 3,
    width: '100%',
  },
  jobContent: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  jobTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  jobCategory: {
    ...Typography.body2SemiBold,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.full,
  },
  statusPillText: {
    ...Typography.micro,
    fontWeight: '600',
  },
  jobAmount: {
    ...Typography.title3,
    color: Colors.primary,
    fontWeight: '700',
  },
  jobDesc: {
    ...Typography.body2,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  jobMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  jobMetaText: {
    ...Typography.caption,
    color: Colors.textMuted,
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    flexWrap: 'wrap',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  actionBtnText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  completeBtn: {
    backgroundColor: Colors.primary,
    flex: 1.5,
  },
  acceptBtn: {
    flex: 1,
  },
  completeBtnText: {
    ...Typography.caption,
    color: '#fff',
    fontWeight: '700',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: Spacing.xs,
  },
});
