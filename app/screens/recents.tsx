import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RecentCalculation {
  id: string;
  name: string;
  slug: string;
  inputs: string;
  result: string;
  unit?: string;
  timestamp: number;
}

export default function RecentsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [recents, setRecents] = React.useState<RecentCalculation[]>([]);

  React.useEffect(() => {
    loadRecents();
  }, []);

  const loadRecents = async () => {
    try {
      const stored = await AsyncStorage.getItem('recent_calculations');
      if (stored) {
        setRecents(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load recents:', error);
    }
  };

  const clearRecents = async () => {
    try {
      await AsyncStorage.removeItem('recent_calculations');
      setRecents([]);
    } catch (error) {
      console.error('Failed to clear recents:', error);
    }
  };

  const filteredRecents = React.useMemo(() => {
    if (!searchQuery.trim()) return recents;
    const query = searchQuery.toLowerCase();
    return recents.filter((item) => item.name.toLowerCase().includes(query));
  }, [recents, searchQuery]);

  const groupedRecents = React.useMemo(() => {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).getTime();
    const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;

    const today: RecentCalculation[] = [];
    const yesterday: RecentCalculation[] = [];
    const older: RecentCalculation[] = [];

    filteredRecents.forEach((item) => {
      if (item.timestamp >= todayStart) {
        today.push(item);
      } else if (item.timestamp >= yesterdayStart) {
        yesterday.push(item);
      } else {
        older.push(item);
      }
    });

    return { today, yesterday, older };
  }, [filteredRecents]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  const formatInputs = (inputs: string) => {
    try {
      const parsed = JSON.parse(inputs);
      return parsed
        .map(
          (input: any) =>
            `${input.label}: ${input.value}${
              input.unit ? ' ' + input.unit : ''
            }`
        )
        .join(', ');
    } catch {
      return '';
    }
  };

  const handleItemPress = (item: RecentCalculation) => {
    router.push(`/calculation/${item.slug}` as any);
  };

  const renderItem = ({ item }: { item: RecentCalculation }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleItemPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardInputs}>{formatInputs(item.inputs)}</Text>
        <Text style={styles.cardResult}>
          Result: {parseFloat(item.result).toFixed(2)}
          {item.unit ? ` ${item.unit}` : ''}
        </Text>
      </View>
      <View style={styles.cardRight}>
        <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderSection = (title: string, data: RecentCalculation[]) => {
    if (data.length === 0) return null;
    return (
      <View key={title}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {data.map((item) => (
          <View key={item.id}>{renderItem({ item })}</View>
        ))}
      </View>
    );
  };

  if (recents.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name='arrow-back' size={24} color='#111318' />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Recents</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name='time-outline' size={48} color='#135bec' />
          </View>
          <Text style={styles.emptyTitle}>No Recent Activity</Text>
          <Text style={styles.emptySubtitle}>
            Your calculation history will be shown here.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name='arrow-back' size={24} color='#111318' />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recents</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={clearRecents}
          activeOpacity={0.7}
        >
          <Ionicons name='trash-outline' size={22} color='#616f89' />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons
          name='search'
          size={20}
          color='#9CA3AF'
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder='Search calculations'
          placeholderTextColor='#9CA3AF'
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {renderSection('Today', groupedRecents.today)}
        {renderSection('Yesterday', groupedRecents.yesterday)}
        {renderSection('Older', groupedRecents.older)}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f8',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 231, 235, 0.8)',
  },
  backButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerSpacer: {
    width: 48,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: '#111318',
    letterSpacing: -0.015,
  },
  clearButton: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#135bec',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    height: 48,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#111318',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: '#111318',
    letterSpacing: -0.015,
    marginTop: 16,
    marginBottom: 8,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#111318',
    lineHeight: 22,
  },
  cardInputs: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#616f89',
    lineHeight: 20,
  },
  cardResult: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: '#135bec',
    lineHeight: 20,
  },
  cardRight: {
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  timestamp: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#616f89',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(19, 91, 236, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: '#111318',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#616f89',
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomSpacing: {
    height: 20,
  },
  headerButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
