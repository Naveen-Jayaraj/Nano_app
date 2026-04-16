import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Title, Text, Surface, Divider } from 'react-native-paper';
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';
import { COLORS } from '../../utils/theme';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Q } from '@nozbe/watermelondb';
import { SyncService, SyncStatus } from '../../services/SyncService';
import { Button, ActivityIndicator, Banner } from 'react-native-paper';

const LogItem = ({ log }: { log: any }) => {
  if (!log) return null;
  
  // DEFENSIVE CODING: Fallbacks for every field to prevent crashes
  const timestamp = log.timestamp || Date.now();
  const date = new Date(timestamp);
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  
  const rawType = log.type || 'unknown';
  const typeStr = rawType.toString().toUpperCase();
  const value = log.value !== undefined ? log.value.toString() : '?';
  const unit = log.unit || '';
  
  let icon = 'database';
  let color = COLORS.muted;
  
  if (rawType === 'steps') { icon = 'walk'; color = '#22c55e'; }
  else if (rawType === 'battery') { icon = 'battery'; color = '#f59e0b'; }
  else if (rawType === 'charging') { icon = 'flash'; color = '#3b82f6'; }
  else if (rawType === 'temperature') { icon = 'thermometer'; color = '#ef4444'; }
  else if (rawType === 'uptime') { icon = 'clock-outline'; color = '#8b5cf6'; }
  else if (rawType.startsWith('location')) { icon = 'map-marker'; color = '#ec4899'; }
  else if (rawType === 'sync') { icon = 'sync'; color = COLORS.primary; }
  else if (rawType === 'screen_time') { icon = 'cellphone-dock'; color = '#06b6d4'; }
  else if (rawType === 'unlocks') { icon = 'lock-open-outline'; color = '#f43f5e'; }
  else if (rawType === 'notifications') { icon = 'bell-outline'; color = '#a855f7'; }
  else if (rawType.startsWith('app')) { icon = 'application-cog'; color = '#10b981'; }

  return (
    <View style={styles.logItem}>
      <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
        <MaterialCommunityIcons name={icon} size={20} color={color} />
      </View>
      <View style={styles.logInfo}>
        <Text style={styles.logTitle}>{typeStr}: {value} {unit}</Text>
        <Text style={styles.logTime}>{timeStr} • {date.toLocaleDateString()}</Text>
      </View>
      <Text style={styles.logId}>#{log.id ? log.id.slice(-4) : '????'}</Text>
    </View>
  );
};

const RawDataTabBase = ({ logs }: { logs: any[] }) => {
  const [syncStatus, setSyncStatus] = React.useState<SyncStatus>(SyncService.status);
  const [lastError, setLastError] = React.useState<string | null>(SyncService.lastError);

  // Sync on mount and subscribe to updates
  useEffect(() => {
    const unsubscribe = SyncService.subscribe((status, error) => {
      setSyncStatus(status);
      setLastError(error);
    });
    
    SyncService.syncAll().catch(err => console.error('Data tab sync failed', err));
    
    return unsubscribe;
  }, []);

  const handleManualSync = () => {
    SyncService.syncAll();
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={2}>
        <View style={styles.headerMain}>
          <View>
            <Title style={styles.title}>Developer Logs</Title>
            <Text style={styles.subtitle}>Showing latest 50 live data points</Text>
          </View>
          <Button 
            mode="contained-tonal" 
            onPress={handleManualSync}
            loading={syncStatus === 'syncing'}
            disabled={syncStatus === 'syncing'}
            style={styles.syncButton}
          >
            Sync Now
          </Button>
        </View>

        <Divider style={styles.headerDivider} />

        <View style={styles.statusRow}>
          <View style={styles.statusLabel}>
            {syncStatus === 'syncing' ? (
              <ActivityIndicator size={14} color={COLORS.primary} />
            ) : (
              <MaterialCommunityIcons 
                name={syncStatus === 'failed' ? 'alert-circle' : 'check-circle'} 
                size={16} 
                color={syncStatus === 'failed' ? '#ef4444' : '#22c55e'} 
              />
            )}
            <Text style={[
              styles.statusText, 
              { color: syncStatus === 'failed' ? '#ef4444' : COLORS.muted }
            ]}>
              Status: {syncStatus.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.logCount}>{logs.length} entries</Text>
        </View>
      </Surface>

      {lastError && (
        <Banner
          visible={!!lastError}
          actions={[{ label: 'Dismiss', onPress: () => setLastError(null) }]}
          icon="alert"
          style={styles.errorBanner}
        >
          {lastError}
        </Banner>
      )}

      <Surface style={styles.specialAccess} elevation={1}>
        <Text style={styles.specialTitle}>Special Permissions Needed</Text>
        <Text style={styles.specialSub}>For App Usage, Screen Time & Notifications</Text>
        <View style={styles.specialButtons}>
          <Button 
            mode="outlined" 
            compact 
            onPress={() => PermissionService.openUsageAccessSettings()}
            style={styles.accessBtn}
            labelStyle={{ fontSize: 11 }}
          >
            Usage Access
          </Button>
          <Button 
            mode="outlined" 
            compact 
            onPress={() => PermissionService.openNotificationListenerSettings()}
            style={styles.accessBtn}
            labelStyle={{ fontSize: 11 }}
          >
            Notification Access
          </Button>
        </View>
      </Surface>
      
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id || Math.random().toString()}
        renderItem={({ item }) => <LogItem log={item} />}
        ItemSeparatorComponent={() => <Divider style={styles.divider} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="database-off-outline" size={48} color={COLORS.muted} />
            <Text style={styles.emptyText}>No sensor data recorded yet.</Text>
            <Text style={styles.emptySub}>Ensure permissions are granted and Health Connect is set up.</Text>
          </View>
        }
      />
    </View>
  );
};

const enhance = withObservables([], ({ database }: any) => ({
  logs: database.get('health_logs').query(
    Q.sortBy('timestamp', Q.desc),
    Q.take(50)
  ).observe(),
}));

export const RawDataTab = withDatabase(enhance(RawDataTabBase));

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { 
    padding: 20, 
    backgroundColor: 'white', 
    borderBottomLeftRadius: 24, 
    borderBottomRightRadius: 24, 
    marginBottom: 10 
  },
  headerMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerDivider: {
    marginVertical: 10,
    backgroundColor: '#f1f5f9',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  logCount: {
    fontSize: 12,
    color: COLORS.muted,
  },
  syncButton: {
    borderRadius: 12,
  },
  errorBanner: {
    backgroundColor: '#fef2f2',
    marginHorizontal: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  specialAccess: {
    marginHorizontal: 15,
    padding: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  specialTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  specialSub: {
    fontSize: 11,
    color: COLORS.muted,
    marginBottom: 10,
  },
  specialButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  accessBtn: {
    borderRadius: 8,
    flex: 1,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  subtitle: { color: COLORS.muted, fontSize: 13 },
  listContent: { padding: 15 },
  logItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  logInfo: { flex: 1 },
  logTitle: { fontWeight: '700', color: COLORS.text, fontSize: 14 },
  logTime: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  logId: { fontSize: 10, color: '#94a3b8', fontStyle: 'italic' },
  divider: { backgroundColor: '#f1f5f9' },
  empty: { padding: 50, alignItems: 'center', justifyContent: 'center' },
  emptyText: { marginTop: 15, color: COLORS.muted, fontWeight: 'bold' },
  emptySub: { marginTop: 5, color: COLORS.muted, fontSize: 12, textAlign: 'center' },
});
