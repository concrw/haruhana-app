// 가족 관련 타입 정의

export type EncouragementType = 'text' | 'voice' | 'video' | 'photo';
export type RelationshipType = '아들' | '딸' | '손자' | '손녀' | '며느리' | '사위' | '배우자' | '형제' | '자매' | '기타';

export interface Family {
  id: string;
  name: string;
  inviteCode: string;
  createdBy: string;
  createdAt: Date;
}

export interface FamilyMember {
  id: string;
  familyId: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    avatarUrl: string | null;
    role: 'senior' | 'family';
  };
  relationship: RelationshipType | string;
  role?: 'senior' | 'family';  // direct role access
  nickname?: string;  // display name
  isPrimarySenior: boolean;
  joinedAt: Date;
}

export interface Encouragement {
  id: string;
  fromUserId: string;
  toUserId: string;
  familyId: string;
  type: EncouragementType;
  content: string | null;  // 텍스트 내용
  mediaUrl: string | null; // 음성/영상/사진 URL
  relatedRitualId: string | null;
  relatedGameSessionId: string | null;
  isRead: boolean;
  createdAt: Date;

  // 조인 데이터
  fromUser?: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export interface PreRecordedMessage {
  id: string;
  userId: string;
  targetUserId: string;
  familyId: string;
  type: 'voice' | 'video';
  mediaUrl: string;
  trigger: MessageTrigger;
  isActive: boolean;
  createdAt: Date;
}

export type MessageTrigger =
  | 'morning_start'     // 아침 첫 활동 시작
  | 'daily_complete'    // 오늘 목표 달성
  | 'streak_7days'      // 7일 연속
  | 'streak_30days'     // 30일 연속
  | 'streak_100days'    // 100일 연속
  | 'comeback'          // 쉬었다가 복귀
  | 'birthday'          // 생일
  | 'custom';           // 커스텀

export interface FamilyFeed {
  date: Date;
  items: FamilyFeedItem[];
}

export interface FamilyFeedItem {
  id: string;
  type: 'ritual_complete' | 'game_complete' | 'encouragement' | 'milestone';
  userId: string;
  userName: string;
  userAvatar: string | null;
  content: string;
  timestamp: Date;
  data?: {
    ritualId?: string;
    ritualTitle?: string;
    gameType?: string;
    score?: number;
    streak?: number;
    encouragementId?: string;
  };
}

export interface WeeklyReport {
  userId: string;
  weekStart: Date;
  weekEnd: Date;

  // 의식 통계
  ritualsCompleted: number;
  ritualsTotal: number;
  ritualCompletionRate: number;

  // 게임 통계
  gameSessions: number;
  avgAccuracy: number;
  avgReactionTime: number;
  accuracyChange: number;  // 전주 대비 변화

  // 기타
  currentStreak: number;
  encouragementsReceived: number;

  // 트렌드 데이터
  dailyData: {
    date: Date;
    ritualsCompleted: number;
    gameScore: number;
    accuracy: number;
  }[];
}
