import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { COLORS } from '../../constants/colors';
import type { DailySteps } from '../../types/walking';

interface WeeklyStepsChartProps {
  data: DailySteps[];
  goalSteps?: number;
}

const screenWidth = Dimensions.get('window').width;

export const WeeklyStepsChart: React.FC<WeeklyStepsChartProps> = ({
  data,
  goalSteps = 5000,
}) => {
  // 최근 7일 데이터 준비
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const chartData = last7Days.map((date) => {
    const dayData = data.find((d) => d.date === date);
    return dayData?.totalSteps || 0;
  });

  const labels = last7Days.map((date) => {
    const d = new Date(date);
    return ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
  });

  return (
    <View style={styles.container}>
      <BarChart
        data={{
          labels,
          datasets: [
            {
              data: chartData,
            },
          ],
        }}
        width={screenWidth - 48}
        height={220}
        yAxisLabel=""
        yAxisSuffix="보"
        chartConfig={{
          backgroundColor: COLORS.white,
          backgroundGradientFrom: COLORS.white,
          backgroundGradientTo: COLORS.white,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(105, 219, 124, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(144, 144, 144, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          barPercentage: 0.7,
          propsForBackgroundLines: {
            strokeDasharray: '',
            stroke: COLORS.backgroundLight,
            strokeWidth: 1,
          },
        }}
        style={styles.chart}
        showValuesOnTopOfBars
        fromZero
      />
      {goalSteps > 0 && (
        <View style={styles.goalLine}>
          <View style={styles.dashedLine} />
          <Text style={styles.goalLabel}>목표: {goalSteps.toLocaleString()}보</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  goalLine: {
    position: 'absolute',
    top: 80,
    left: 60,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: COLORS.orange,
  },
  goalLabel: {
    marginLeft: 8,
    fontSize: 12,
    color: COLORS.orange,
    fontWeight: '600',
  },
});
