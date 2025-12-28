import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { TYPOGRAPHY } from '../../constants/typography';

interface HeaderProps {
  title?: string;
  greeting?: boolean;
  userName?: string;
  showBack?: boolean;
  showHelp?: boolean;
  rightElement?: React.ReactNode;
  leftElement?: React.ReactNode;
  onBack?: () => void;
  onHelp?: () => void;
  style?: ViewStyle;
  transparent?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  greeting = false,
  userName,
  showBack = false,
  showHelp = false,
  rightElement,
  leftElement,
  onBack,
  onHelp,
  style,
  transparent = false,
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '좋은 아침이에요';
    if (hour < 18) return '좋은 오후예요';
    return '좋은 저녁이에요';
  };

  if (greeting) {
    return (
      <View style={[styles.greetingContainer, style]}>
        <View>
          <Text style={styles.greetingText}>
            {getGreeting()}, {userName || ''}님 ☀️
          </Text>
          <Text style={styles.subGreeting}>
            오늘도 건강한 하루 시작해요
          </Text>
        </View>
        {rightElement}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        transparent && styles.transparent,
        style,
      ]}
    >
      {/* 왼쪽 영역 */}
      <View style={styles.leftSection}>
        {showBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        )}
        {leftElement}
      </View>

      {/* 타이틀 */}
      {title && (
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      )}

      {/* 오른쪽 영역 */}
      <View style={styles.rightSection}>
        {showHelp && (
          <TouchableOpacity
            style={styles.helpButton}
            onPress={onHelp}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.helpIcon}>❓</Text>
          </TouchableOpacity>
        )}
        {rightElement}
      </View>
    </View>
  );
};

// 섹션 헤더 (홈 화면의 섹션 타이틀)
interface SectionHeaderProps {
  title: string;
  actionText?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  actionText,
  onAction,
  style,
}) => {
  return (
    <View style={[styles.sectionContainer, style]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionText && (
        onAction ? (
          <TouchableOpacity onPress={onAction}>
            <Text style={styles.sectionAction}>{actionText}</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.sectionActionText}>{actionText}</Text>
        )
      )}
    </View>
  );
};

// 페이지 헤더 (전체 화면 타이틀)
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  style?: ViewStyle;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon,
  style,
}) => {
  return (
    <View style={[styles.pageHeaderContainer, style]}>
      {icon && <Text style={styles.pageIcon}>{icon}</Text>}
      <Text style={styles.pageTitle}>{title}</Text>
      {subtitle && <Text style={styles.pageSubtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  // 기본 헤더
  container: {
    height: LAYOUT.header.height,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: LAYOUT.screenPaddingHorizontal,
    backgroundColor: COLORS.backgroundCream,
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 60,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 60,
    justifyContent: 'flex-end',
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -LAYOUT.spacing.md,
  },
  backIcon: {
    fontSize: 28,
    color: COLORS.textDark,
  },
  title: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '600',
    color: COLORS.textDark,
    textAlign: 'center',
  },
  helpButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -LAYOUT.spacing.md,
  },
  helpIcon: {
    fontSize: 24,
  },

  // 인사 헤더
  greetingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: LAYOUT.screenPaddingHorizontal,
    paddingVertical: LAYOUT.spacing.lg,
  },
  greetingText: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: COLORS.textDark,
  },
  subGreeting: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
    marginTop: LAYOUT.spacing.xs,
  },

  // 섹션 헤더
  sectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  sectionAction: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
  },
  sectionActionText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
  },

  // 페이지 헤더
  pageHeaderContainer: {
    alignItems: 'center',
    paddingVertical: LAYOUT.spacing.xl,
  },
  pageIcon: {
    fontSize: 48,
    marginBottom: LAYOUT.spacing.md,
  },
  pageTitle: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: '700',
    color: COLORS.textDark,
  },
  pageSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textGray,
    marginTop: LAYOUT.spacing.sm,
    textAlign: 'center',
  },
});

export default Header;
