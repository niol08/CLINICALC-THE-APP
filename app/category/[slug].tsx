import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMetadata } from '../../hooks/useMetadata';
import { Calculation } from '../../types/calculations';

import { useRecentCategories } from '@/hooks/useRecentCategories';

export default function CategoryDetailScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data, loading } = useMetadata();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(
    new Set()
  );

  const { addRecentCategory } = useRecentCategories();

  const category = React.useMemo(() => {
    return data?.categories.find((cat) => cat.slug === slug);
  }, [data, slug]);

  const filteredCalculations = React.useMemo(() => {
    if (!category?.calculations) return [];
    if (!searchQuery.trim()) return category.calculations;

    const query = searchQuery.toLowerCase();
    return category.calculations.filter(
      (calc) =>
        calc.name.toLowerCase().includes(query) ||
        calc.description?.toLowerCase().includes(query)
    );
  }, [category, searchQuery]);

  React.useEffect(() => {
    if (category) {
      addRecentCategory(category.slug, category.title);
    }
  }, [category]);

  const toggleExpanded = (itemKey: string, event: any) => {
    event?.stopPropagation?.();
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemKey)) {
        newSet.delete(itemKey);
      } else {
        newSet.add(itemKey);
      }
      return newSet;
    });
  };

  const renderCalculation = ({
    item,
    index,
  }: {
    item: Calculation;
    index: number;
  }) => {
    const itemKey = item.slug || item.name || index.toString();
    const isExpanded = expandedItems.has(itemKey);
    const hasLongDescription = (item.description?.length || 0) > 50;

    return (
      <TouchableOpacity
        style={styles.calculationCard}
        onPress={() =>
          router.push(`/calculation/${item.slug || item.name}` as any)
        }
        activeOpacity={0.7}
      >
        <View style={styles.calculationContent}>
          <Text style={styles.calculationTitle}>{item.name}</Text>
          {item.description && (
            <View>
              <Text
                style={styles.calculationDescription}
                numberOfLines={isExpanded ? undefined : 2}
              >
                {item.description}
              </Text>
              {hasLongDescription && (
                <TouchableOpacity
                  onPress={(e) => toggleExpanded(itemKey, e)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.showMoreText}>
                    {isExpanded ? 'Show less' : 'Show more'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
        {item.result_unit && (
          <View style={styles.unitButton}>
            <Text style={styles.unitButtonText}>{item.result_unit}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading && !category) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='#135bec' />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!category) {
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
          <Text style={styles.headerTitle} numberOfLines={2}>
            Category Not Found
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name='alert-circle-outline' size={48} color='#9CA3AF' />
          <Text style={styles.errorText}>Category not found</Text>
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
        <Text style={styles.headerTitle} numberOfLines={2}>
          {category.title}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <View style={styles.searchIconContainer}>
            <Ionicons name='search' size={20} color='#9CA3AF' />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder='Search calculators...'
            placeholderTextColor='#9CA3AF'
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredCalculations}
        renderItem={renderCalculation}
        keyExtractor={(item, index) =>
          item.slug || item.name || index.toString()
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name='calculator-outline' size={48} color='#9CA3AF' />
            <Text style={styles.emptyText}>No calculations found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f8',
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 231, 235, 0.8)',
    minHeight: 60,
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
    fontFamily: 'Inter_600SemiBold',
    color: '#111318',
    letterSpacing: -0.015,
    paddingHorizontal: 8,
    lineHeight: 24,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchWrapper: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
  },
  searchIconContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    borderWidth: 1,
    borderRightWidth: 0,
    borderColor: '#E5E7EB',
    paddingLeft: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#111318',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  calculationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
  },
  calculationContent: {
    flex: 1,
    gap: 4,
  },
  calculationTitle: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#111318',
    lineHeight: 22,
  },
  calculationDescription: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#616f89',
    lineHeight: 20,
    marginTop: 4,
  },
  showMoreText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#135bec',
    marginTop: 6,
  },
  unitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 40,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(19, 91, 236, 0.1)',
    borderRadius: 8,
  },
  unitButtonText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#135bec',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#616f89',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#616f89',
    textAlign: 'center',
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#616f89',
  },
});
