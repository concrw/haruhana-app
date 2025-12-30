import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { TYPOGRAPHY } from '../../constants/typography';
import { useFamilyStore } from '../../stores/familyStore';

interface TabIconProps {
  icon: string;
  label: string;
  focused: boolean;
  badge?: number;
}

const TabIcon: React.FC<TabIconProps> = ({ icon, label, focused, badge }) => {
  return (
    <View style={styles.tabIconContainer}>
      <View style={styles.iconWrapper}>
        <Text style={[styles.icon, focused && styles.iconFocused]}>{icon}</Text>
        {badge && badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {badge > 99 ? '99+' : badge}
            </Text>
          </View>
        )}
      </View>
      <Text style={[styles.label, focused && styles.labelFocused]}>{label}</Text>
    </View>
  );
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { unreadCount } = useFamilyStore();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.backgroundLight,
          borderTopWidth: 1,
          height: LAYOUT.tabBar.height + insets.bottom,
          paddingTop: LAYOUT.spacing.sm,
          paddingBottom: insets.bottom || LAYOUT.spacing.md,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🏠" label="홈" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="orchard"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🌳" label="과수원" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="family"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon="👨‍👩‍👧"
              label="가족"
              focused={focused}
              badge={unreadCount}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="👤" label="내정보" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: LAYOUT.spacing.xs,
  },
  iconWrapper: {
    position: 'relative',
  },
  icon: {
    fontSize: LAYOUT.tabBar.iconSize,
    opacity: 0.5,
  },
  iconFocused: {
    opacity: 1,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textGray,
    marginTop: LAYOUT.spacing.xs,
  },
  labelFocused: {
    color: COLORS.textDark,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.white,
    fontWeight: '700',
  },
});
