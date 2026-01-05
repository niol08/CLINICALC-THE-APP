import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useMetadata } from '../../hooks/useMetadata';
import { Category } from '../../types/calculations';

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  'medical-dosage': 'medical',
  'patient-monitoring': 'pulse',
  'nutrition-fluid-management': 'water',
  pharmacokinetics: 'flask',
  'blood-lab-values': 'analytics',
  'cardiovascular-health': 'heart',
  'body-mechanisms-growth': 'body',
  'infection-control-epidemiology': 'shield-checkmark',
  'electrolyte-replacement': 'flash',
  others: 'file-tray-full',
  'statistical-calculations': 'stats-chart',
};

const DEFAULT_ICON: keyof typeof Ionicons.glyphMap = 'folder-open';

export default function CategoriesScreen() {
  const router = useRouter();
  const { data, loading, error, refetch } = useMetadata();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [expandedCategories, setExpandedCategories] = React.useState<
    Set<string>
  >(new Set());

  const filteredCategories = React.useMemo(() => {
    if (!data?.categories) return [];
    if (!searchQuery.trim()) return data.categories;

    const query = searchQuery.toLowerCase();
    return data.categories.filter(
      (cat) =>
        cat.title.toLowerCase().includes(query) ||
        cat.description?.toLowerCase().includes(query)
    );
  }, [data, searchQuery]);

  const toggleExpanded = (slug: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(slug)) {
        newSet.delete(slug);
      } else {
        newSet.add(slug);
      }
      return newSet;
    });
  };

  const renderCategory = ({ item }: { item: Category }) => {
    const iconName = CATEGORY_ICONS[item.slug] || DEFAULT_ICON;
    const isExpanded = expandedCategories.has(item.slug);
    const hasLongDescription = (item.description?.length || 0) > 80;

    return (
      <View style={styles.categoryItem}>
        <TouchableOpacity
          style={styles.categoryTouchable}
          onPress={() => router.push(`/category/${item.slug}` as any)}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <Ionicons name={iconName} size={24} color='#135bec' />
          </View>
          <View style={styles.categoryContent}>
            <Text style={styles.categoryTitle}>{item.title}</Text>
            {item.description && (
              <>
                <Text
                  style={styles.categoryDescription}
                  numberOfLines={isExpanded ? undefined : 2}
                  ellipsizeMode='tail'
                >
                  {item.description}
                </Text>
                {hasLongDescription && (
                  <TouchableOpacity
                    onPress={() => toggleExpanded(item.slug)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.showMoreText}>
                      {isExpanded ? 'Show less' : 'Show more'}
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
          <Ionicons name='chevron-forward' size={24} color='#9CA3AF' />
        </TouchableOpacity>
      </View>
    );
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle} numberOfLines={2}>
            Categories
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name='alert-circle-outline' size={48} color='#EF4444' />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle} numberOfLines={2}>
          Categories
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
            placeholder='Search calculators or categories'
            placeholderTextColor='#9CA3AF'
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {loading && !data ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='#135bec' />
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCategories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.slug}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refetch}
              colors={['#135bec']}
              tintColor='#135bec'
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name='file-tray-outline' size={48} color='#9CA3AF' />
              <Text style={styles.emptyText}>No categories found</Text>
            </View>
          }
        />
      )}
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
    paddingBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 231, 235, 0.8)',
    minHeight: 60,
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
    lineHeight: 24,
  },
  searchIcon: {
    marginRight: 8,
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
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIconContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    // borderWidth: 1,
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
    // borderWidth: 1,
    borderLeftWidth: 0,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#111318',
  },
  listContent: {
    padding: 16,
    gap: 8,
  },
  categoryItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    minHeight: 72,
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(19, 91, 236, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryContent: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  categoryTitle: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#111318',
    lineHeight: 22,
  },
  categoryDescription: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#616f89',
    lineHeight: 20,
  },
  showMoreText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#135bec',
    marginTop: 4,
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
  retryButton: {
    backgroundColor: '#135bec',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#ffffff',
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
