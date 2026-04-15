import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { QuestTab } from '../screens/main/QuestTab';
import { LevelTab } from '../screens/main/LevelTab';
import { ProfileTab } from '../screens/main/ProfileTab';
import { ChallengesTab } from '../screens/main/ChallengesTab';
import { COLORS } from '../utils/theme';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { RawDataTab } from '../screens/main/RawDataTab';

const Tab = createBottomTabNavigator();

export const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'help-circle';
          if (route.name === 'Quest') iconName = focused ? 'lightning-bolt' : 'lightning-bolt-outline';
          else if (route.name === 'Level') iconName = focused ? 'octagram' : 'octagram-outline';
          else if (route.name === 'Profile') iconName = focused ? 'chart-box' : 'chart-box-outline';
          else if (route.name === 'Challenges') iconName = focused ? 'shield-star' : 'shield-star-outline';
          else if (route.name === 'Data') iconName = focused ? 'database-eye' : 'database-eye-outline';
          return <MaterialCommunityIcons name={iconName} size={size + 4} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopWidth: 0,
          elevation: 10,
          height: 70,
          paddingBottom: 10,
        },
        headerStyle: {
          backgroundColor: COLORS.surface,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          fontWeight: '700',
          color: COLORS.text,
        },
        headerShown: true,
      })}
    >
      <Tab.Screen name="Quest" component={QuestTab} />
      <Tab.Screen name="Level" component={LevelTab} />
      <Tab.Screen name="Profile" component={ProfileTab} />
      <Tab.Screen name="Challenges" component={ChallengesTab} />
      <Tab.Screen name="Data" component={RawDataTab} />
    </Tab.Navigator>
  );
};
