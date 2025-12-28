import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useWalkingStore } from '../../stores/walkingStore';
import { COLORS } from '../../constants/colors';
import { WALKING_TEXTS } from '../../constants/walkingTexts';

export default function WalkingHistory() {
  const { weeklyData, fetchWeeklyData } = useWalkingStore();

  useEffect(() => {
    fetchWeeklyData();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{WALKING_TEXTS.history.title}</Text>

      {weeklyData.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{WALKING_TEXTS.history.noHistory}</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {weeklyData.map((day) => {
            const date = new Date(day.date);
            const dayName = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
            const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;

            return (
              <View key={day.date} style={styles.historyItem}>
                <View style={styles.dateContainer}>
                  <Text style={styles.dayName}>{dayName}</Text>
                  <Text style={styles.dateText}>{dateStr}</Text>
                </View>

                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {day.totalSteps.toLocaleString()}
                    </Text>
                    <Text style={styles.statLabel}>{WALKING_TEXTS.units.steps}</Text>
                  </View>

                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {(day.distanceMeters / 1000).toFixed(2)}
                    </Text>
                    <Text style={styles.statLabel}>{WALKING_TEXTS.units.km}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundWarm,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 20,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textGray,
  },
  list: {
    gap: 12,
  },
  historyItem: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    alignItems: 'center',
    width: 60,
  },
  dayName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  dateText: {
    fontSize: 14,
    color: COLORS.textGray,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textGray,
    marginTop: 2,
  },
});
