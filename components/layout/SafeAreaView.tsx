import React from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  ViewStyle,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';

interface SafeAreaViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  statusBarStyle?: 'light-content' | 'dark-content';
}

export const SafeAreaView: React.FC<SafeAreaViewProps> = ({
  children,
  style,
  backgroundColor = COLORS.backgroundCream,
  edges = ['top', 'bottom'],
  statusBarStyle = 'dark-content',
}) => {
  const insets = useSafeAreaInsets();

  const paddingStyle: ViewStyle = {
    paddingTop: edges.includes('top') ? insets.top : 0,
    paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
    paddingLeft: edges.includes('left') ? insets.left : 0,
    paddingRight: edges.includes('right') ? insets.right : 0,
  };

  return (
    <View style={[styles.container, { backgroundColor }, paddingStyle, style]}>
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={backgroundColor}
        translucent={Platform.OS === 'android'}
      />
      {children}
    </View>
  );
};

// 스크린 래퍼 (SafeArea + 기본 패딩)
interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
  withPadding?: boolean;
  withBottomPadding?: boolean;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  style,
  backgroundColor = COLORS.backgroundCream,
  withPadding = true,
  withBottomPadding = true,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.screenContainer,
        { backgroundColor },
        withPadding && styles.screenPadding,
        {
          paddingTop: insets.top + (withPadding ? LAYOUT.spacing.lg : 0),
          paddingBottom: withBottomPadding
            ? insets.bottom + LAYOUT.tabBar.height
            : insets.bottom,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

// 콘텐츠 컨테이너 (최대 너비 제한)
interface ContentContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  center?: boolean;
}

export const ContentContainer: React.FC<ContentContainerProps> = ({
  children,
  style,
  center = false,
}) => {
  return (
    <View
      style={[
        styles.contentContainer,
        center && styles.centered,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
  screenPadding: {
    paddingHorizontal: LAYOUT.screenPaddingHorizontal,
  },
  contentContainer: {
    width: '100%',
    maxWidth: LAYOUT.contentWidth + LAYOUT.screenPaddingHorizontal * 2,
    alignSelf: 'center',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SafeAreaView;
