import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMetadata } from '../../hooks/useMetadata';
import { Calculation } from '../../types/calculations';

export default function SearchScreen() {
  const router = useRouter();
  const { q } = useLocalSearchParams<{ q?: string }>();
  const { data, loading } = useMetadata();
  const [searchQuery, setSearchQuery] = React.useState(q || '');
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(
    new Set()
  );
  const inputRef = React.useRef<TextInput>(null);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timeout);
  }, []);

  const allCalculations = React.useMemo(() => {
    if (!data?.categories) return [];

    const calculations: (Calculation & { categoryTitle: string })[] = [];
    data.categories.forEach((category) => {
      category.calculations.forEach((calc) => {
        calculations.push({
          ...calc,
          categoryTitle: category.title,
        });
      });
    });
    return calculations;
  }, [data]);

  const filteredCalculations = React.useMemo(() => {
    if (!searchQuery.trim()) return allCalculations;

    const query = searchQuery.toLowerCase();
    return allCalculations.filter(
      (calc) =>
        calc.name.toLowerCase().includes(query) ||
        calc.description?.toLowerCase().includes(query) ||
        calc.categoryTitle.toLowerCase().includes(query) ||
        calc.result_unit?.toLowerCase().includes(query)
    );
  }, [allCalculations, searchQuery]);

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
    item: Calculation & { categoryTitle: string };
    index: number;
  }) => {
    const itemKey = item.slug || item.name || index.toString();
    const isExpanded = expandedItems.has(itemKey);
    const hasLongDescription = (item.description?.length || 0) > 50;

    return (
      <TouchableOpacity
        style={styles.calculationCard}
        onPress={() => {
          Keyboard.dismiss();
          router.push(`/calculation/${item.slug || item.name}` as any);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.calculationContent}>
          <Text style={styles.calculationTitle}>{item.name}</Text>
          <Text style={styles.categoryBadge}>{item.categoryTitle}</Text>
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

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size='large' color='#135bec' />
          <Text style={styles.emptyText}>Searching...</Text>
        </View>
      );
    }

    if (!searchQuery.trim()) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name='search-outline' size={64} color='#D1D5DB' />
          <Text style={styles.emptyTitle}>Start searching</Text>
          <Text style={styles.emptyDescription}>
            Search for medical calculations across all categories
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name='file-tray-outline' size={64} color='#D1D5DB' />
        <Text style={styles.emptyTitle}>No results found</Text>
        <Text style={styles.emptyDescription}>
          Sorry, we don&apos;t have that calculation yet. Try searching for
          another calculation, browse all categories, or report an issue so we
          can add it for you.
        </Text>
      </View>
    );
  };

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
        <Text style={styles.headerTitle}>Search Calculations</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <View style={styles.searchIconContainer}>
            <Ionicons name='search' size={20} color='#9CA3AF' />
          </View>
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Search calculations, e.g., 'BMI', 'GFR'..."
            placeholderTextColor='#9CA3AF'
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType='search'
            autoCapitalize='none'
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
              activeOpacity={0.7}
            >
              <Ionicons name='close-circle' size={20} color='#9CA3AF' />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {searchQuery.trim() && (
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {filteredCalculations.length}{' '}
            {filteredCalculations.length === 1 ? 'result' : 'results'}
          </Text>
        </View>
      )}

      <FlatList
        data={filteredCalculations}
        renderItem={renderCalculation}
        keyExtractor={(item, index) =>
          item.slug || item.name || index.toString()
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        keyboardShouldPersistTaps='handled'
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f8',
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
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
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
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 8,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#111318',
  },
  clearButton: {
    backgroundColor: '#ffffff',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 0,
    borderColor: '#E5E7EB',
    paddingRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  resultsCount: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#111318',
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
    gap: 12,
    flexGrow: 1,
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
  categoryBadge: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#135bec',
    marginTop: 2,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#111318',
    textAlign: 'center',
    marginTop: 8,
  },
  emptyDescription: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#616f89',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#616f89',
  },
});
