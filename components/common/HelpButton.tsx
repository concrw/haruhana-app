import React, { useState, useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Modal,
  Animated,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { TYPOGRAPHY } from '../../constants/typography';

interface HelpButtonProps {
  position?: 'fixed' | 'inline';
  variant?: 'minimal' | 'labeled';
  onPress?: () => void;
  onLongPress?: () => void; // 3초 길게 누르기: 가족에게 도움 요청
  helpText?: string;
}

export const HelpButton: React.FC<HelpButtonProps> = ({
  position = 'inline',
  variant = 'labeled',
  onPress,
  onLongPress,
  helpText,
}) => {
  const [showHelp, setShowHelp] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const longPressProgress = useRef(new Animated.Value(0)).current;
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const handlePressIn = () => {
    setIsLongPressing(true);
    Animated.timing(longPressProgress, {
      toValue: 1,
      duration: 3000, // 3초
      useNativeDriver: false,
    }).start();

    longPressTimer.current = setTimeout(() => {
      if (onLongPress) {
        onLongPress();
      }
      resetLongPress();
    }, 3000);
  };

  const handlePressOut = () => {
    resetLongPress();
  };

  const resetLongPress = () => {
    setIsLongPressing(false);
    longPressProgress.setValue(0);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (helpText) {
      setShowHelp(true);
    }
  };

  const progressWidth = longPressProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const buttonContent = (
    <>
      <Text style={styles.icon}>❓</Text>
      {variant === 'labeled' && <Text style={styles.label}>도움</Text>}
    </>
  );

  const button = (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'minimal' && styles.minimalButton,
        position === 'fixed' && styles.fixedPosition,
        isLongPressing && styles.pressing,
      ]}
      onPress={handlePress}
      onPressIn={onLongPress ? handlePressIn : undefined}
      onPressOut={onLongPress ? handlePressOut : undefined}
      activeOpacity={0.8}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      {isLongPressing && (
        <Animated.View
          style={[
            styles.longPressProgress,
            { width: progressWidth },
          ]}
        />
      )}
      <View style={styles.content}>
        {buttonContent}
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      {button}

      {helpText && (
        <Modal
          visible={showHelp}
          transparent
          animationType="fade"
          onRequestClose={() => setShowHelp(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowHelp(false)}
          >
            <View style={styles.helpModal}>
              <Text style={styles.helpTitle}>💡 도움말</Text>
              <Text style={styles.helpText}>{helpText}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowHelp(false)}
              >
                <Text style={styles.closeButtonText}>닫기</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </>
  );
};

// SOS 버튼 (긴급 상황용)
interface SOSButtonProps {
  onPress: () => void;
}

export const SOSButton: React.FC<SOSButtonProps> = ({ onPress }) => {
  const [confirmVisible, setConfirmVisible] = useState(false);

  const handlePress = () => {
    setConfirmVisible(true);
  };

  const handleConfirm = () => {
    setConfirmVisible(false);
    onPress();
  };

  return (
    <>
      <TouchableOpacity
        style={styles.sosButton}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Text style={styles.sosIcon}>🆘</Text>
        <Text style={styles.sosLabel}>긴급 SOS</Text>
      </TouchableOpacity>

      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>긴급 연락</Text>
            <Text style={styles.confirmText}>
              가족에게 긴급 알림을 보낼까요?
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.cancelButton]}
                onPress={() => setConfirmVisible(false)}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, styles.sosConfirmButton]}
                onPress={handleConfirm}
              >
                <Text style={styles.sosConfirmText}>연락하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.backgroundLight,
    paddingVertical: LAYOUT.spacing.md,
    paddingHorizontal: LAYOUT.spacing.lg,
    borderRadius: LAYOUT.radius.lg,
    minWidth: LAYOUT.touchTarget.recommended,
    minHeight: LAYOUT.touchTarget.recommended,
    overflow: 'hidden',
  },
  minimalButton: {
    paddingVertical: LAYOUT.spacing.sm,
    paddingHorizontal: LAYOUT.spacing.md,
    minWidth: LAYOUT.touchTarget.minimum,
    minHeight: LAYOUT.touchTarget.minimum,
  },
  fixedPosition: {
    position: 'absolute',
    bottom: 100,
    right: 24,
    shadowColor: COLORS.textDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  pressing: {
    backgroundColor: COLORS.lemon,
  },
  longPressProgress: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: COLORS.orange,
    opacity: 0.3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT.spacing.xs,
  },
  icon: {
    fontSize: 24,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.textDark,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: LAYOUT.spacing.xl,
  },
  helpModal: {
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.radius.xl,
    padding: LAYOUT.spacing.xl,
    width: '100%',
    maxWidth: 320,
  },
  helpTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: LAYOUT.spacing.md,
  },
  helpText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textDark,
    lineHeight: TYPOGRAPHY.fontSize.lg * 1.6,
    marginBottom: LAYOUT.spacing.xl,
  },
  closeButton: {
    backgroundColor: COLORS.greenApple,
    paddingVertical: LAYOUT.spacing.md,
    paddingHorizontal: LAYOUT.spacing.xl,
    borderRadius: LAYOUT.radius.md,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.white,
  },

  // SOS Button
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error,
    paddingVertical: LAYOUT.spacing.lg,
    paddingHorizontal: LAYOUT.spacing.xl,
    borderRadius: LAYOUT.radius.lg,
    gap: LAYOUT.spacing.sm,
  },
  sosIcon: {
    fontSize: 24,
  },
  sosLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Confirm Modal
  confirmModal: {
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.radius.xl,
    padding: LAYOUT.spacing.xl,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  confirmTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: COLORS.error,
    marginBottom: LAYOUT.spacing.md,
  },
  confirmText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: LAYOUT.spacing.xl,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: LAYOUT.spacing.md,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: LAYOUT.spacing.md,
    paddingHorizontal: LAYOUT.spacing.lg,
    borderRadius: LAYOUT.radius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.backgroundLight,
  },
  cancelButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.textGray,
  },
  sosConfirmButton: {
    backgroundColor: COLORS.error,
  },
  sosConfirmText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default HelpButton;
