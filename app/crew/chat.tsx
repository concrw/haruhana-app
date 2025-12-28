/**
 * 크루 채팅 화면
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { TYPOGRAPHY } from '../../constants/typography';
import { CREW_TEXTS, CREW_LIMITS } from '../../constants/crew';
import { Header } from '../../components/layout/Header';
import { useCrewStore } from '../../stores/crewStore';
import { useAuthStore } from '../../stores/authStore';
import type { CrewMessage } from '../../types/crew';

export default function ChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const {
    currentCrew,
    messages,
    members,
    isLoading,
    fetchCrewDetails,
    fetchMembers,
    fetchMessages,
    sendMessage,
    subscribeToMessages,
  } = useCrewStore();

  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (id) {
      loadData();
      const unsubscribe = subscribeToMessages(id);
      return () => {
        unsubscribe();
      };
    }
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    await fetchCrewDetails(id);
    await fetchMembers(id);
    await fetchMessages(id);
  };

  const handleSend = async () => {
    if (!id || !user?.id || !inputText.trim() || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(id, inputText.trim());
      setInputText('');
      // 새 메시지로 스크롤
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const getMemberInfo = (userId: string) => {
    const member = members.find((m) => m.userId === userId);
    return {
      name: member?.user?.name || '크루원',
      avatar: member?.user?.avatarUrl || null,
    };
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateHeader = (date: Date) => {
    const today = new Date();
    const messageDate = new Date(date);

    if (messageDate.toDateString() === today.toDateString()) {
      return '오늘';
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return '어제';
    }

    return messageDate.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
    });
  };

  const renderMessage = ({ item, index }: { item: CrewMessage; index: number }) => {
    const isMyMessage = item.senderId === user?.id;
    const isSystem = item.messageType === 'system';
    const memberInfo = getMemberInfo(item.senderId);

    // 날짜 구분선 체크
    const prevMessage = messages[index - 1];
    const showDateHeader =
      !prevMessage ||
      new Date(item.sentAt).toDateString() !==
        new Date(prevMessage.sentAt).toDateString();

    // 같은 사람의 연속 메시지인지 체크
    const isSameUser = prevMessage && prevMessage.senderId === item.senderId;
    const showAvatar = !isMyMessage && !isSystem && !isSameUser;

    return (
      <>
        {showDateHeader && (
          <View style={styles.dateHeader}>
            <Text style={styles.dateHeaderText}>
              {formatDateHeader(item.sentAt)}
            </Text>
          </View>
        )}

        {isSystem ? (
          <View style={styles.systemMessage}>
            <Text style={styles.systemMessageText}>{item.message}</Text>
          </View>
        ) : (
          <View
            style={[
              styles.messageRow,
              isMyMessage && styles.messageRowMine,
              !showAvatar && !isMyMessage && styles.messageRowContinue,
            ]}
          >
            {showAvatar && (
              <View style={styles.avatarContainer}>
                {memberInfo.avatar ? (
                  <Image source={{ uri: memberInfo.avatar }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {memberInfo.name.charAt(0)}
                    </Text>
                  </View>
                )}
              </View>
            )}

            <View style={[styles.messageBubbleContainer, isMyMessage && styles.myBubbleContainer]}>
              {showAvatar && (
                <Text style={styles.senderName}>{memberInfo.name}</Text>
              )}
              <View
                style={[
                  styles.messageBubble,
                  isMyMessage && styles.messageBubbleMine,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    isMyMessage && styles.messageTextMine,
                  ]}
                >
                  {item.message}
                </Text>
              </View>
              <Text
                style={[
                  styles.messageTime,
                  isMyMessage && styles.messageTimeMine,
                ]}
              >
                {formatTime(item.sentAt)}
              </Text>
            </View>
          </View>
        )}
      </>
    );
  };

  if (isLoading && messages.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <Header
        title={currentCrew?.name || CREW_TEXTS.chat.title}
        showBack
        onBack={() => router.back()}
      />

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: false })
        }
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <Text style={styles.emptyChatIcon}>💬</Text>
            <Text style={styles.emptyChatText}>
              아직 메시지가 없어요{'\n'}
              첫 메시지를 보내보세요!
            </Text>
          </View>
        }
      />

      <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 12 }]}>
        <TextInput
          style={styles.input}
          placeholder={CREW_TEXTS.chat.placeholder}
          placeholderTextColor={COLORS.textLight}
          value={inputText}
          onChangeText={setInputText}
          maxLength={CREW_LIMITS.messageMaxLength}
          multiline
          returnKeyType="default"
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || isSending) && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!inputText.trim() || isSending}
        >
          {isSending ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.sendButtonText}>전송</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundCream,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: LAYOUT.screenPaddingHorizontal,
    paddingBottom: LAYOUT.spacing.lg,
  },
  dateHeader: {
    alignItems: 'center',
    marginVertical: LAYOUT.spacing.lg,
  },
  dateHeaderText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textGray,
    backgroundColor: COLORS.backgroundLight,
    paddingVertical: LAYOUT.spacing.xs,
    paddingHorizontal: LAYOUT.spacing.md,
    borderRadius: LAYOUT.radius.full,
  },
  systemMessage: {
    alignItems: 'center',
    marginVertical: LAYOUT.spacing.sm,
  },
  systemMessageText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textGray,
    fontStyle: 'italic',
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: LAYOUT.spacing.sm,
  },
  messageRowMine: {
    flexDirection: 'row-reverse',
  },
  messageRowContinue: {
    marginLeft: 48, // avatar width + margin
  },
  avatarContainer: {
    marginRight: LAYOUT.spacing.sm,
    alignSelf: 'flex-end',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.grape,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: COLORS.white,
  },
  messageBubbleContainer: {
    maxWidth: '75%',
  },
  myBubbleContainer: {
    alignItems: 'flex-end',
  },
  senderName: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textGray,
    marginBottom: LAYOUT.spacing.xs,
    marginLeft: LAYOUT.spacing.xs,
  },
  messageBubble: {
    backgroundColor: COLORS.white,
    padding: LAYOUT.spacing.md,
    borderRadius: LAYOUT.radius.lg,
    borderBottomLeftRadius: LAYOUT.radius.xs,
  },
  messageBubbleMine: {
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: LAYOUT.radius.lg,
    borderBottomRightRadius: LAYOUT.radius.xs,
  },
  messageText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textDark,
    lineHeight: TYPOGRAPHY.fontSize.base * 1.4,
  },
  messageTextMine: {
    color: COLORS.textDark,
  },
  messageTime: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textLight,
    marginTop: LAYOUT.spacing.xs,
    marginLeft: LAYOUT.spacing.xs,
  },
  messageTimeMine: {
    marginLeft: 0,
    marginRight: LAYOUT.spacing.xs,
  },
  emptyChat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: LAYOUT.spacing.xxxl,
  },
  emptyChatIcon: {
    fontSize: 48,
    marginBottom: LAYOUT.spacing.md,
  },
  emptyChatText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.fontSize.base * 1.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: LAYOUT.spacing.md,
    paddingTop: LAYOUT.spacing.sm,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.backgroundLight,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: LAYOUT.radius.lg,
    paddingHorizontal: LAYOUT.spacing.lg,
    paddingVertical: LAYOUT.spacing.md,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textDark,
    maxHeight: 100,
    marginRight: LAYOUT.spacing.sm,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: LAYOUT.spacing.md,
    paddingHorizontal: LAYOUT.spacing.lg,
    borderRadius: LAYOUT.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.backgroundLight,
  },
  sendButtonText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.textDark,
  },
});
