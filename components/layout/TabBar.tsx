import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { TYPOGRAPHY } from '../../constants/typography';

interface TabItem {
  key: string;
  label: string;
  icon: string;
  activeIcon?: string;
}

interface TabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabPress: (key: string) => void;
  badge?: { [key: string]: number }; // 탭별 뱃지 카운트
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTab,
  onTabPress,
  badge = {},
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: insets.bottom > 0 ? insets.bottom : LAYOUT.spacing.md },
      ]}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const badgeCount = badge[tab.key] || 0;

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onTabPress(tab.key)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Text style={[styles.icon, isActive && styles.activeIcon]}>
                {isActive && tab.activeIcon ? tab.activeIcon : tab.icon}
              </Text>
              {badgeCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// 기본 탭 설정
export const DEFAULT_TABS: TabItem[] = [
  { key: 'index', label: '홈', icon: '🏠', activeIcon: '🏠' },
  { key: 'orchard', label: '과수원', icon: '🌳', activeIcon: '🌳' },
  { key: 'family', label: '가족', icon: '👨‍👩‍👧', activeIcon: '👨‍👩‍👧' },
  { key: 'profile', label: '내정보', icon: '👤', activeIcon: '👤' },
];

// 빠른 액션 버튼 (탭바 위에 떠있는 버튼)
interface FloatingActionButtonProps {
  icon: string;
  label?: string;
  onPress: () => void;
  color?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  label,
  onPress,
  color = COLORS.greenApple,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <TouchableOpacity
      style={[
        styles.fab,
        { backgroundColor: color },
        { bottom: LAYOUT.tabBar.height + insets.bottom + LAYOUT.spacing.lg },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.fabIcon}>{icon}</Text>
      {label && <Text style={styles.fabLabel}>{label}</Text>}
    </TouchableOpacity>
  );
};

// 하단 액션 바 (게임 등에서 사용)
interface BottomActionBarProps {
  children: React.ReactNode;
}

export const BottomActionBar: React.FC<BottomActionBarProps> = ({
  children,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bottomActionBar,
        { paddingBottom: insets.bottom + LAYOUT.spacing.md },
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.backgroundLight,
    paddingTop: LAYOUT.spacing.sm,
    shadowColor: COLORS.textDark,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: LAYOUT.spacing.sm,
    minHeight: LAYOUT.touchTarget.recommended,
  },
  iconContainer: {
    position: 'relative',
  },
  icon: {
    fontSize: LAYOUT.tabBar.iconSize,
    opacity: 0.5,
  },
  activeIcon: {
    opacity: 1,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textGray,
    marginTop: LAYOUT.spacing.xs,
  },
  activeLabel: {
    color: COLORS.textDark,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.white,
    fontWeight: '700',
  },

  // FAB
  fab: {
    position: 'absolute',
    right: LAYOUT.screenPaddingHorizontal,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: LAYOUT.spacing.md,
    paddingHorizontal: LAYOUT.spacing.lg,
    borderRadius: LAYOUT.radius.full,
    shadowColor: COLORS.textDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    gap: LAYOUT.spacing.sm,
  },
  fabIcon: {
    fontSize: 24,
  },
  fabLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.white,
  },

  // Bottom Action Bar
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingTop: LAYOUT.spacing.lg,
    paddingHorizontal: LAYOUT.screenPaddingHorizontal,
    borderTopWidth: 1,
    borderTopColor: COLORS.backgroundLight,
    shadowColor: COLORS.textDark,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default TabBar;
