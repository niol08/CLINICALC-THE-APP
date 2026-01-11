import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';

import Ionicons from '@expo/vector-icons/Ionicons';
import Octicons from '@expo/vector-icons/Octicons';
import Entypo from '@expo/vector-icons/Entypo';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: '#135bec',
        tabBarInactiveTintColor: '#9CA3AF',
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Octicons
              name={focused ? 'home-fill' : 'home'}
              size={focused ? 25 : 24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='categories'
        options={{
          title: 'Categories',
          tabBarIcon: ({ color, focused }) => (
            <Octicons name='stack' size={focused ? 26 : 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='conversion'
        options={{
          title: 'Conversion',
          tabBarIcon: ({ color, focused }) => (
            <Entypo name='swap' size={focused ? 26 : 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='chat'
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'chatbubbles' : 'chatbubbles-outline'}
              size={focused ? 26 : 24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
