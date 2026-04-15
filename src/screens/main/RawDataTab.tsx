import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Title, Text, Surface, Divider } from 'react-native-paper';
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';
import { COLORS } from '../../utils/theme';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Q } from '@nozbe/watermelondb';
import { SyncService } from '../../services/SyncService';

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
  else if (rawType === 'sync') { icon = 'sync'; color = COLORS.primary; }

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
  // Sync on mount to verify sensors live
  useEffect(() => {
    SyncService.syncAll().catch(err => console.error('Data tab sync failed', err));
  }, []);

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={2}>
        <Title style={styles.title}>Developer Logs</Title>
        <Text style={styles.subtitle}>Showing latest 50 live data points from sensors</Text>
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
  header: { padding: 20, backgroundColor: 'white', borderBottomLeftRadius: 24, borderBottomRightRadius: 24, marginBottom: 10 },
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
