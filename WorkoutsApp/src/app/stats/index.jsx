import { View, StyleSheet, useWindowDimensions, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { useWorkoutStats } from '../../hooks/useWorkoutStats';
import { colors, spacing, Icon } from '@/design-systems/tokens';
import { Text } from '@/design-systems/components';

// Importar tabs
import OverviewTab from '../../components/stats/OverviewTab';
import PerformanceTab from '../../components/stats/PerformanceTab';
import RecordsTab from '../../components/stats/RecordsTab';

export default function StatsScreen() {
  const layout = useWindowDimensions();
  const { deviceId } = useLocalSearchParams();
  
  const [currentPeriod, setCurrentPeriod] = useState('all');
  const { data: stats, isLoading, error } = useWorkoutStats(deviceId, currentPeriod);

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'overview', title: 'Resumen', icon: 'home' },
    { key: 'performance', title: 'Rendimiento', icon: 'analytics' },
    { key: 'records', title: 'Records', icon: 'trophy' },
  ]);

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text variant="bodyMedium" color="neutral.gray500" style={{ marginTop: spacing.md }}>
          Calculando estadísticas...
        </Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="error" size={48} color={colors.danger.main} />
        <Text variant="h3" color="danger.main" style={{ marginTop: spacing.md }}>
          Error al cargar
        </Text>
        <Text variant="body" color="neutral.gray500" align="center" style={{ marginTop: spacing.sm }}>
          {error.message}
        </Text>
      </View>
    );
  }

  // Empty state
  if (!stats || stats.totalWorkouts === 0) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="dumbbell" size={64} color={colors.neutral.gray300} />
        <Text variant="h3" color="neutral.gray800" style={{ marginTop: spacing.lg }}>
          Sin estadísticas aún
        </Text>
        <Text variant="body" color="neutral.gray500" align="center" style={{ marginTop: spacing.sm, maxWidth: 280 }}>
          Completa algunos entrenamientos para ver tus estadísticas
        </Text>
      </View>
    );
  }

  // Render scenes
  const renderScene = SceneMap({
    overview: () => (
      <OverviewTab 
        stats={stats} 
        onPeriodChange={setCurrentPeriod}
        currentPeriod={currentPeriod}
      />
    ),
    performance: () => (
    <PerformanceTab 
      stats={stats} 
      onPeriodChange={setCurrentPeriod}
      currentPeriod={currentPeriod}
    />
  ),
    records: () => <RecordsTab stats={stats} />,
  });

  // Custom tab bar
  const renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={styles.tabIndicator}
      style={styles.tabBar}
      labelStyle={styles.tabLabel}
      activeColor={colors.primary.main}
      inactiveColor={colors.neutral.gray500}
      renderIcon={({ route, focused }) => (
        <Icon
          name={route.icon}
          size={20}
          color={focused ? colors.primary.main : colors.neutral.gray500}
        />
      )}
      renderLabel={({ route, focused }) => (
        <Text
          variant="bodySmall"
          color={focused ? "primary.main" : "neutral.gray500"}
          bold={focused}
        >
          {route.title}
        </Text>
      )}
    />
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Estadísticas',
          headerBackTitle: 'Atrás',
        }}
      />

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.gray100,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.neutral.gray100,
  },

  // Tab Bar
  tabBar: {
    backgroundColor: colors.neutral.white,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray200,
  },
  tabIndicator: {
    backgroundColor: colors.primary.main,
    height: 3,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'none',
  },
});