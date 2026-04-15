import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabNavigator } from './BottomTabNavigator';
import { OnboardingProfile } from '../screens/onboarding/OnboardingProfile';
import { GoalSelection } from '../screens/onboarding/GoalSelection';
import { database } from '../data/database';
import withObservables from '@nozbe/with-observables';

const Stack = createNativeStackNavigator();

const RootNavigatorBase = ({ userProfiles }: { userProfiles: any[] }) => {
  const isOnboarded = userProfiles.length > 0;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isOnboarded ? (
          <>
            <Stack.Screen name="Onboarding" component={OnboardingProfile} />
            <Stack.Screen name="GoalSelection" component={GoalSelection} />
            <Stack.Screen name="Main" component={BottomTabNavigator} />
          </>
        ) : (
          <Stack.Screen name="Main" component={BottomTabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Use withObservables to make the component reactive to database changes
export const RootNavigator = withObservables([], () => ({
  userProfiles: database.get('user_profile').query(),
}))(RootNavigatorBase);
