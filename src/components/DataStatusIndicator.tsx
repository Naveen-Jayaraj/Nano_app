import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import { Text, Surface, IconButton } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SyncService } from '../services/SyncService';

/**
 * A floating indicator that shows up in the corner if there was a sync error.
 * This ensures the app is "hang-proof" by giving visual feedback without blocking the UI.
 */
export const DataStatusIndicator = () => {
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const opacity = useState(new Animated.Value(0))[0];

  const show = useCallback(() => {
    setVisible(true);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [opacity]);

  const hide = useCallback(() => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  }, [opacity]);

  useEffect(() => {
    const checkStatus = setInterval(() => {
      if (SyncService.lastError && SyncService.lastError !== error) {
        setError(SyncService.lastError);
        show();
      } else if (!SyncService.lastError && error) {
        setError(null);
        hide();
      }
    }, 2000);

    return () => clearInterval(checkStatus);
  }, [error, show, hide]);

  if (!visible && !error) return null;

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <Surface style={styles.surface} elevation={4}>
        <TouchableOpacity 
          style={styles.content} 
          onPress={() => Alert.alert('Sync Issue', error || 'Unknown error')}
        >
          <MaterialCommunityIcons name="alert-circle" size={18} color="#ef4444" />
          <Text style={styles.text}>Sensor Sync Issue</Text>
        </TouchableOpacity>
        <IconButton 
          icon="close" 
          size={14} 
          style={styles.closeBtn} 
          onPress={hide}
        />
      </Surface>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 9999,
  },
  surface: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingLeft: 12,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    color: '#b91c1c',
    marginLeft: 6,
    marginRight: 4,
  },
  closeBtn: {
    margin: 0,
  },
});
