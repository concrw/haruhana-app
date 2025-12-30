import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { TYPOGRAPHY } from '../../constants/typography';
import { Encouragement, EncouragementType } from '../../types/family';

export interface EncouragementCardProps {
  encouragement: Encouragement;
  onPress?: () => void;
  showFullContent?: boolean;
  showSender?: boolean;
}

const TYPE_ICONS: Record<EncouragementType, string> = {
  text: '💬',
  voice: '🎙️',
  video: '🎬',
  photo: '📷',
};

export const EncouragementCard: React.FC<EncouragementCardProps> = ({
  encouragement,
  onPress,
  showFullContent = false,
  showSender = true,
}) => {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;

    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        !encouragement.isRead && styles.unreadContainer,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      disabled={!onPress}
    >
      {/* 프로필 */}
      <View style={styles.avatarContainer}>
        {encouragement.fromUser?.avatarUrl ? (
          <Image
            source={{ uri: encouragement.fromUser.avatarUrl }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {encouragement.fromUser?.name?.charAt(0) || '?'}
            </Text>
          </View>
        )}
        {!encouragement.isRead && <View style={styles.unreadDot} />}
      </View>

      {/* 내용 */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>
            {encouragement.fromUser?.name || '가족'}
          </Text>
          <Text style={styles.typeIcon}>
            {TYPE_ICONS[encouragement.type]}
          </Text>
        </View>

        {encouragement.type === 'text' && (
          <Text
            style={styles.text}
            numberOfLines={showFullContent ? undefined : 2}
          >
            {encouragement.content}
          </Text>
        )}

        {encouragement.type === 'voice' && (
          <View style={styles.mediaIndicator}>
            <Text style={styles.mediaIcon}>🔊</Text>
            <Text style={styles.mediaText}>음성 메시지</Text>
          </View>
        )}

        {encouragement.type === 'video' && (
          <View style={styles.mediaIndicator}>
            <Text style={styles.mediaIcon}>▶️</Text>
            <Text style={styles.mediaText}>영상 메시지</Text>
          </View>
        )}

        {encouragement.type === 'photo' && encouragement.mediaUrl && (
          <Image
            source={{ uri: encouragement.mediaUrl }}
            style={styles.photoPreview}
            resizeMode="cover"
          />
        )}

        <Text style={styles.time}>
          {formatTime(new Date(encouragement.createdAt))}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// 미리보기 카드 (홈 화면용)
interface EncouragementPreviewProps {
  encouragement: Encouragement;
  onPress?: () => void;
}

export const EncouragementPreview: React.FC<EncouragementPreviewProps> = ({
  encouragement,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.previewContainer}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.previewAvatar}>
        {encouragement.fromUser?.avatarUrl ? (
          <Image
            source={{ uri: encouragement.fromUser.avatarUrl }}
            style={styles.previewAvatarImage}
          />
        ) : (
          <Text style={styles.previewAvatarText}>
            {encouragement.fromUser?.name?.charAt(0) || '?'}
          </Text>
        )}
      </View>
      <View style={styles.speechBubble}>
        <Text style={styles.previewName}>
          {encouragement.fromUser?.name || '가족'}
        </Text>
        {encouragement.type === 'text' ? (
          <Text style={styles.previewText} numberOfLines={1}>
            {encouragement.content}
          </Text>
        ) : (
          <Text style={styles.previewText}>
            {TYPE_ICONS[encouragement.type]}{' '}
            {encouragement.type === 'voice'
              ? '음성 메시지'
              : encouragement.type === 'video'
              ? '영상 메시지'
              : '사진'}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

// 응원 보내기 입력 카드
interface SendEncouragementCardProps {
  onSendText: (text: string) => void;
  onSendVoice: () => void;
  onSendPhoto: () => void;
}

export const SendEncouragementCard: React.FC<SendEncouragementCardProps> = ({
  onSendText,
  onSendVoice,
  onSendPhoto,
}) => {
  const [text, setText] = React.useState('');

  const handleSend = () => {
    if (text.trim()) {
      onSendText(text.trim());
      setText('');
    }
  };

  return (
    <View style={styles.sendContainer}>
      <Text style={styles.sendTitle}>응원 메시지 보내기</Text>
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickButton} onPress={onSendVoice}>
          <Text style={styles.quickIcon}>🎙️</Text>
          <Text style={styles.quickLabel}>음성</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickButton} onPress={onSendPhoto}>
          <Text style={styles.quickIcon}>📷</Text>
          <Text style={styles.quickLabel}>사진</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // 기본 카드
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: LAYOUT.spacing.lg,
    borderRadius: LAYOUT.radius.lg,
    shadowColor: COLORS.textDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    gap: LAYOUT.spacing.md,
  },
  unreadContainer: {
    backgroundColor: COLORS.primaryLight,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.grape,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.white,
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.error,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: LAYOUT.spacing.xs,
  },
  name: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  typeIcon: {
    fontSize: 16,
  },
  text: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textDark,
    lineHeight: TYPOGRAPHY.fontSize.base * 1.5,
    marginBottom: LAYOUT.spacing.sm,
  },
  mediaIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT.spacing.xs,
    marginBottom: LAYOUT.spacing.sm,
  },
  mediaIcon: {
    fontSize: 20,
  },
  mediaText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
  },
  photoPreview: {
    width: '100%',
    height: 120,
    borderRadius: LAYOUT.radius.md,
    marginBottom: LAYOUT.spacing.sm,
  },
  time: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textLight,
  },

  // 미리보기
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT.spacing.md,
  },
  previewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.grape,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  previewAvatarText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.white,
  },
  speechBubble: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
    padding: LAYOUT.spacing.md,
    borderRadius: LAYOUT.radius.lg,
    borderTopLeftRadius: LAYOUT.radius.xs,
  },
  previewName: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.textGray,
    marginBottom: LAYOUT.spacing.xs,
  },
  previewText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textDark,
  },

  // 보내기 카드
  sendContainer: {
    backgroundColor: COLORS.white,
    padding: LAYOUT.spacing.lg,
    borderRadius: LAYOUT.radius.lg,
  },
  sendTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: LAYOUT.spacing.lg,
  },
  quickActions: {
    flexDirection: 'row',
    gap: LAYOUT.spacing.md,
  },
  quickButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: LAYOUT.spacing.lg,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: LAYOUT.radius.md,
  },
  quickIcon: {
    fontSize: 32,
    marginBottom: LAYOUT.spacing.sm,
  },
  quickLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textDark,
  },
});

export default EncouragementCard;
