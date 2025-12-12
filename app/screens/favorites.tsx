import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { FavoriteCalculation } from '@/types';

export default function FavoritesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [favorites, setFavorites] = React.useState<FavoriteCalculation[]>([]);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [selectedItem, setSelectedItem] =
    React.useState<FavoriteCalculation | null>(null);

  React.useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem('favorite_calculations');
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  };

  const removeFavorite = async (id: string) => {
    try {
      const updated = favorites.filter((item) => item.id !== id);
      await AsyncStorage.setItem(
        'favorite_calculations',
        JSON.stringify(updated)
      );
      setFavorites(updated);
      setModalVisible(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };

  const filteredFavorites = React.useMemo(() => {
    if (!searchQuery.trim()) return favorites;
    const query = searchQuery.toLowerCase();
    return favorites.filter((item) => item.name.toLowerCase().includes(query));
  }, [favorites, searchQuery]);

  const formatSavedTime = (timestamp: number) => {
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffMinutes < 1) return 'Saved just now';
    if (diffMinutes < 60)
      return `Saved ${diffMinutes} ${
        diffMinutes === 1 ? 'minute' : 'minutes'
      } ago`;
    if (diffHours < 24)
      return `Saved ${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffDays < 7)
      return `Saved ${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    if (diffWeeks < 4)
      return `Saved ${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
    if (diffMonths < 12)
      return `Saved ${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;

    const diffYears = Math.floor(diffDays / 365);
    return `Saved ${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`;
  };

  const handleCardPress = (item: FavoriteCalculation) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const handleNavigate = () => {
    if (selectedItem) {
      setModalVisible(false);
      router.push(`/calculation/${selectedItem.slug}` as any);
      setSelectedItem(null);
    }
  };

  const renderItem = (item: FavoriteCalculation) => (
    <TouchableOpacity
      key={item.id}
      style={styles.card}
      onPress={() => handleCardPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardTimestamp}>
          {formatSavedTime(item.timestamp)}
        </Text>
      </View>
      <Ionicons name='chevron-forward' size={20} color='#9CA3AF' />
    </TouchableOpacity>
  );

  if (favorites.length === 0) {
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
          <Text style={styles.headerTitle}>Favorites</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name='heart-outline' size={48} color='#135bec' />
          </View>
          <Text style={styles.emptyTitle}>No Favorites Yet</Text>
          <Text style={styles.emptySubtitle}>
            Your favorite calculators will be shown here.
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
        <Text style={styles.headerTitle}>Favorites</Text>
        <View style={styles.headerSpacer} />
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
          placeholder='Search favorites'
          placeholderTextColor='#9CA3AF'
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredFavorites.map((item) => renderItem(item))}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType='fade'
        statusBarTranslucent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{selectedItem?.name}</Text>
              <Text style={styles.modalSubtitle}>
                What would you like to do?
              </Text>

              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleNavigate}
                activeOpacity={0.7}
              >
                <Ionicons name='calculator-outline' size={24} color='#135bec' />
                <Text style={styles.modalButtonText}>Open calculator</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonDanger]}
                onPress={() => selectedItem && removeFavorite(selectedItem.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name='heart-dislike-outline'
                  size={24}
                  color='#EF4444'
                />
                <Text
                  style={[styles.modalButtonText, styles.modalButtonTextDanger]}
                >
                  Remove from favorites
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
    paddingTop: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
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
    lineHeight: 24,
  },
  cardTimestamp: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#616f89',
    lineHeight: 20,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: 320,
    maxWidth: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: '#111318',
    marginBottom: 0,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#616f89',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6f6f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  modalButtonDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#135bec',
  },
  modalButtonTextDanger: {
    color: '#EF4444',
  },
  modalCancelButton: {
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  modalCancelText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#616f89',
  },
});
