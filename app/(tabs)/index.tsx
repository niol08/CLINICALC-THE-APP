import Feather from '@expo/vector-icons/Feather';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeaderWithMenu } from '@/components/header-with-menu';
import { Ionicons } from '@expo/vector-icons';

// import { CATEGORY_ICONS, DEFAULT_ICON } from '@/constants/categoryIcons';
// import { useRecentCategories } from '@/hooks/useRecentCategories';
// import { useMetadata } from '@/hooks/useMetadata';

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIconContainer}>
        <Ionicons name={icon} size={24} color='#135bec' />
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  // const { recentCategories } = useRecentCategories();
  // const { data } = useMetadata();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(
        `/screens/search?q=${encodeURIComponent(searchQuery.trim())}` as any
      );
    }
  };

  // const displayCategories = React.useMemo(() => {
  //   if (recentCategories.length > 0) {
  //     return recentCategories.map((cat) => ({
  //       ...cat,
  //       icon: CATEGORY_ICONS[cat.slug] || DEFAULT_ICON,
  //     }));
  //   }
  //   return (
  //     data?.categories?.slice(0, 3).map((cat) => ({
  //       slug: cat.slug,
  //       title: cat.title,
  //       timestamp: Date.now(),
  //       icon: CATEGORY_ICONS[cat.slug] || DEFAULT_ICON,
  //     })) || []
  //   );
  // }, [recentCategories, data]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <HeaderWithMenu />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Your essential medical calculator</Text>
        <View
          style={[
            styles.searchContainer,
            isFocused && styles.searchContainerFocused,
          ]}
        >
          <Feather
            name='search'
            size={20}
            color='#616f89'
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder='Search calculations, e.g. BMI, GFR...'
            placeholderTextColor='#616f89'
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onSubmitEditing={handleSearch}
            returnKeyType='search'
            numberOfLines={1}
            multiline={false}
          />
        </View>

        <View style={styles.card}>
          <View style={styles.cardImageContainer}>
            <Image
              source={require('../../assets/images/Nurse.png')}
              style={styles.cardImage}
              resizeMode='contain'
            />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardNumber}>100+</Text>
            <Text style={styles.cardDescription}>
              Validated formulas and converters at your fingertips.
            </Text>
          </View>
        </View>

        <View style={styles.featuresSection}>
          <FeatureItem
            icon='shield-checkmark'
            title='Clinically Validated'
            description='Evidence-based formulas'
          />
          <FeatureItem
            icon='flash'
            title='Lightning Fast'
            description='Instant calculations'
          />
          <FeatureItem
            icon='sparkles'
            title='AI Insights'
            description='Smart interpretation of results'
          />
          <FeatureItem
            icon='heart'
            title='Save Favorites'
            description='Quick access to your tools'
          />
        </View>
        {/* {data && displayCategories.length > 0 && (
          <View style={styles.recentCategoriesSection}>
            <Text style={styles.sectionTitle}>Quick Categories</Text>
            <View style={styles.categoryGrid}>
              {displayCategories.map((category) => (
                <TouchableOpacity
                  key={category.slug}
                  style={styles.categoryCard}
                  onPress={() =>
                    router.push(`/category/${category.slug}` as any)
                  }
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={category.icon || DEFAULT_ICON}
                    size={24}
                    color='#135bec'
                  />
                  <Text style={styles.categoryCardTitle} numberOfLines={2}>
                    {category.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        <View style={{ flex: 1 }} /> */}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={() => router.push('/categories' as any)}
          >
            <Text style={styles.buttonText}>Browse All Categories</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f8',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'regular',
    textTransform: 'uppercase',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'Inter_600SemiBold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingLeft: 16,
    paddingRight: 2,
    paddingVertical: 12,
    marginTop: 8,
    minHeight: 48,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  searchContainerFocused: {
    borderWidth: 2,
    borderColor: '#135bec',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#111318',
    padding: 0,
    lineHeight: 20,
  },
  card: {
    marginTop: 20,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardContent: {
    padding: 24,
    gap: 4,
  },
  cardNumber: {
    fontSize: 36,
    fontFamily: 'Inter_700Bold',
    color: '#135bec',
    letterSpacing: -0.54,
    lineHeight: 40,
  },
  cardDescription: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#616f89',
    lineHeight: 24,
  },
  cardImageContainer: {
    width: '100%',
    aspectRatio: 2 / 1,
    backgroundColor: '#E0F2FE',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  buttonContainer: {
    paddingVertical: 20,
  },
  button: {
    backgroundColor: '#135bec',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    shadowColor: '#135bec',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.24,
  },
  featuresSection: {
    marginTop: 24,
    gap: 12,
  },
  // featureItem: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   backgroundColor: '#fff',
  //   borderRadius: 12,
  //   padding: 16,
  //   gap: 16,
  //   shadowColor: '#000',
  //   shadowOffset: { width: 0, height: 1 },
  //   shadowOpacity: 0.05,
  //   shadowRadius: 4,
  //   elevation: 2,
  // },
  // featureIconContainer: {
  //   width: 48,
  //   height: 48,
  //   borderRadius: 24,
  //   backgroundColor: 'rgba(19, 91, 236, 0.1)',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderLeftWidth: 2.5,
    borderLeftColor: '#135bec',
    paddingLeft: 16,
    paddingVertical: 12,
    gap: 16,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(19, 91, 236, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    flex: 1,
    gap: 2,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#111318',
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#616f89',
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: '#111318',
    marginBottom: 12,
  },
  recentCategoriesSection: {
    marginTop: 24,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryCardTitle: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#111318',
    textAlign: 'center',
  },
});
