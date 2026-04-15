import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { RootNavigator } from './src/navigation/RootNavigator';
import { database } from './src/data/database';
import { DatabaseProvider } from '@nozbe/watermelondb/DatabaseProvider';
import { theme } from './src/utils/theme';
import { PermissionService } from './src/services/PermissionService';
import { SyncService } from './src/services/SyncService';

const App = (): React.JSX.Element => {
  const isDarkMode = useColorScheme() === 'dark';

  React.useEffect(() => {
    // 1. Initial permission request
    PermissionService.requestAll();
    
    // 2. Initial sync
    SyncService.syncAll();

    // 3. Periodic sync every 30 minutes
    const interval = setInterval(() => {
      SyncService.syncAll();
    }, 1000 * 60 * 30);

    return () => clearInterval(interval);
  }, []);

  return (
    <DatabaseProvider database={database}>
      <PaperProvider theme={theme}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.surface} />
        <RootNavigator />
      </PaperProvider>
    </DatabaseProvider>
  );
}

export default App;
