import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getExplanation } from '@/services/calculation';

interface FavoriteCalculation {
  id: string;
  name: string;
  slug: string;
  timestamp: number;
}

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    name: string;
    slug: string;
    result: string;
    unit?: string;
    inputs?: string;
    params?: string;
  }>();

  const [showCopiedAlert, setShowCopiedAlert] = React.useState(false);
  const [showInputs, setShowInputs] = React.useState(true);
  const [isFavorite, setIsFavorite] = React.useState(false);
  const [showFavoriteAlert, setShowFavoriteAlert] = React.useState(false);
  const [interpretation, setInterpretation] = React.useState<string>('');
  const [isLoadingInterpretation, setIsLoadingInterpretation] =
    React.useState(false);
  const [interpretationError, setInterpretationError] =
    React.useState<string>('');

  React.useEffect(() => {
    checkIfFavorite();
  }, []);

  React.useEffect(() => {
    fetchInterpretation();
  }, []);

  const fetchInterpretation = async () => {
    setIsLoadingInterpretation(true);
    setInterpretationError('');

    try {
      let parameters: Record<string, any> = {};
      if (params.params) {
        try {
          parameters = JSON.parse(params.params);
        } catch (e) {
          console.error('Failed to parse params:', e);
        }
      }

      console.log('Sending to /explain:', {
        calc_name: params.name,
        result: params.result,
        parameters: parameters,
      });

      const response = await getExplanation({
        calc_name: params.name,
        result: params.result,
        parameters: parameters,
      });

      setInterpretation(response.explanation);
    } catch (error) {
      console.error('Failed to fetch interpretation:', error);

      let errorMessage = 'Failed to load interpretation';

      if (error instanceof Error) {
        const errorText = error.message.toLowerCase();
        if (errorText.includes('quota') || errorText.includes('429')) {
          errorMessage =
            'AI interpretation temporarily unavailable. Please try again later.';
        } else if (
          errorText.includes('network') ||
          errorText.includes('fetch')
        ) {
          errorMessage = 'Network error. Please check your connection.';
        } else {
          errorMessage = error.message;
        }
      }

      setInterpretationError(errorMessage);
    } finally {
      setIsLoadingInterpretation(false);
    }
  };

  const checkIfFavorite = async () => {
    try {
      const stored = await AsyncStorage.getItem('favorite_calculations');
      if (stored) {
        const favorites: FavoriteCalculation[] = JSON.parse(stored);
        const exists = favorites.some((fav) => fav.slug === params.slug);
        setIsFavorite(exists);
      }
    } catch (error) {
      console.error('Failed to check favorite status:', error);
    }
  };

  const roundedResult = React.useMemo(() => {
    const numResult = parseFloat(params.result);
    return isNaN(numResult) ? params.result : numResult.toFixed(2);
  }, [params.result]);

  const parsedInputs = React.useMemo(() => {
    if (!params.inputs) return [];
    try {
      return JSON.parse(params.inputs as string);
    } catch {
      return [];
    }
  }, [params.inputs]);

  const handleCopyToClipboard = async () => {
    if (params.result) {
      const textToCopy = params.unit
        ? `${roundedResult} ${params.unit}`
        : roundedResult;
      await Clipboard.setStringAsync(textToCopy);
      setShowCopiedAlert(true);
      setTimeout(() => {
        setShowCopiedAlert(false);
      }, 2000);
    }
  };

  const handleRecalculate = () => {
    router.back();
  };

  const handleShare = async () => {
    try {
      const inputsText = parsedInputs
        .map(
          (input: { label: string; value: string; unit?: string }) =>
            `${input.label}: ${input.value}${
              input.unit && input.unit !== 'N/A' ? ' ' + input.unit : ''
            }`
        )
        .join('\n');

      const message = `${params.name}\n\nResult: ${roundedResult}${
        params.unit && params.unit !== 'N/A' ? ' ' + params.unit : ''
      }\n\nInputs:\n${inputsText}\n\nCalculated with ClinicalC`;

      await Share.share({
        message: message,
        title: params.name,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleFavorite = async () => {
    try {
      const stored = await AsyncStorage.getItem('favorite_calculations');
      let favorites: FavoriteCalculation[] = stored ? JSON.parse(stored) : [];

      if (isFavorite) {
        favorites = favorites.filter((fav) => fav.slug !== params.slug);
        setIsFavorite(false);
      } else {
        const newFavorite: FavoriteCalculation = {
          id: Date.now().toString(),
          name: params.name,
          slug: params.slug,
          timestamp: Date.now(),
        };
        favorites.unshift(newFavorite);
        setIsFavorite(true);
        setShowFavoriteAlert(true);
        setTimeout(() => {
          setShowFavoriteAlert(false);
        }, 2000);
      }

      await AsyncStorage.setItem(
        'favorite_calculations',
        JSON.stringify(favorites)
      );
    } catch (error) {
      console.error('Failed to update favorites:', error);
    }
  };

  return (
    <>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name='arrow-back' size={24} color='#111318' />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={2}>
            {params.name}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.resultCard}>
            <View style={styles.resultContent}>
              <Text style={styles.resultLabel}>{params.name}</Text>
              <Text style={styles.resultValue}>{roundedResult}</Text>
              <View style={styles.resultFooter}>
                <View style={styles.unitContainer}>
                  {params.unit && params.unit !== 'N/A' && (
                    <Text style={styles.unitText}>{params.unit}</Text>
                  )}
                  <TouchableOpacity
                    style={styles.copyButton}
                    onPress={handleCopyToClipboard}
                    activeOpacity={0.7}
                  >
                    <Ionicons name='copy-outline' size={16} color='#135bec' />
                    <Text style={styles.copyButtonText}>Copy</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {parsedInputs.length > 0 && (
            <View style={styles.inputSummaryContainer}>
              <TouchableOpacity
                style={styles.inputSummaryHeader}
                onPress={() => setShowInputs(!showInputs)}
                activeOpacity={0.7}
              >
                <Text style={styles.inputSummaryTitle}>
                  View Calculation Inputs
                </Text>
                <Ionicons
                  name={showInputs ? 'chevron-up' : 'chevron-down'}
                  size={24}
                  color='#111318'
                />
              </TouchableOpacity>
              {showInputs && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.inputSummaryContent}>
                    {parsedInputs.map(
                      (
                        input: { label: string; value: string; unit?: string },
                        index: number
                      ) => (
                        <Text key={index} style={styles.inputSummaryText}>
                          {input.label}: {input.value}
                          {input.unit && input.unit !== 'N/A'
                            ? ` ${input.unit}`
                            : ''}
                        </Text>
                      )
                    )}
                  </View>
                </>
              )}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interpretation</Text>
            <View style={styles.aiDisclaimerBox}>
              <Ionicons name='sparkles' size={16} color='#7C3AED' />
              <Text style={styles.aiDisclaimerText}>
                AI-powered interpretation
              </Text>
            </View>
            {isLoadingInterpretation ? (
              <Text style={styles.sectionText}>Loading interpretation...</Text>
            ) : interpretationError ? (
              <Text style={styles.errorText}>{interpretationError}</Text>
            ) : interpretation ? (
              <>
                <Text style={styles.sectionText}>
                  {interpretation
                    .replace(/\*\*/g, '')
                    .replace(/\*/g, '')
                    .replace(/\s+/g, ' ')
                    .trim()}
                </Text>
                <View style={styles.aiWarningBox}>
                  <Ionicons
                    name='information-circle-outline'
                    size={16}
                    color='#616f89'
                  />
                  <Text style={styles.aiWarningText}>
                    AI can make mistakes. Verify important information.
                  </Text>
                </View>
              </>
            ) : (
              <Text style={styles.sectionText}>
                Interpretation will be available soon.
              </Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Disclaimer</Text>
            <Text style={styles.disclaimerText}>
              This tool is for informational purposes only and is not a
              substitute for professional medical advice. AI-generated
              interpretations should be verified by a healthcare professional.
              Always consult a healthcare provider for any health concerns.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.bottomContainer}>
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleShare}
              activeOpacity={0.7}
            >
              <Ionicons name='share-outline' size={24} color='#111318' />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconButton, isFavorite && styles.iconButtonActive]}
              onPress={handleFavorite}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isFavorite ? 'star' : 'star-outline'}
                size={24}
                color={isFavorite ? '#135bec' : '#111318'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.recalculateButton}
              onPress={handleRecalculate}
              activeOpacity={0.8}
            >
              <Text style={styles.recalculateButtonText}>Recalculate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <Modal
        visible={showCopiedAlert}
        transparent={true}
        animationType='fade'
        statusBarTranslucent={true}
      >
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <View style={styles.alertIconContainer}>
              <Ionicons name='checkmark-circle' size={32} color='#135bec' />
            </View>
            <Text style={styles.alertTitle}>Copied!</Text>
            <Text style={styles.alertMessage}>
              {params.unit ? `${roundedResult} ${params.unit}` : roundedResult}{' '}
              copied to clipboard
            </Text>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showFavoriteAlert}
        transparent={true}
        animationType='fade'
        statusBarTranslucent={true}
      >
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <View style={styles.alertIconContainer}>
              <Ionicons name='star' size={32} color='#135bec' />
            </View>
            <Text style={styles.alertTitle}>Added to Favorites!</Text>
            <Text style={styles.alertMessage}>
              {params.name} has been added to your favorites
            </Text>
          </View>
        </View>
      </Modal>
    </>
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
    lineHeight: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  resultContent: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  resultLabel: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#616f89',
    lineHeight: 20,
  },
  resultValue: {
    fontSize: 64,
    fontFamily: 'Inter_700Bold',
    color: '#111318',
    letterSpacing: -2,
    lineHeight: 72,
  },
  resultFooter: {
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  unitContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  unitText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#616f89',
    lineHeight: 24,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(19, 91, 236, 0.1)',
    borderRadius: 20,
  },
  copyButtonText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#135bec',
  },
  inputSummaryContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  inputSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  inputSummaryTitle: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#111318',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  inputSummaryContent: {
    padding: 16,
    gap: 8,
  },
  inputSummaryText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#616f89',
    lineHeight: 24,
  },
  section: {
    gap: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: '#111318',
    letterSpacing: -0.015,
    paddingTop: 8,
    paddingBottom: 4,
  },
  aiDisclaimerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  aiDisclaimerText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#7C3AED',
  },
  sectionText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#111318',
    lineHeight: 24,
  },
  disclaimerText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#616f89',
    lineHeight: 20,
  },
  bottomContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonActive: {
    backgroundColor: '#E5E7EB',
  },
  recalculateButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#135bec',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recalculateButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#ffffff',
  },
  alertOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  alertBox: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    minWidth: 280,
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  alertIconContainer: {
    marginBottom: 12,
  },
  alertTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: '#111318',
    marginBottom: 8,
  },
  alertMessage: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#616f89',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#EF4444',
    lineHeight: 20,
  },
  aiWarningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f6f6f8',
    // paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  aiWarningText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#616f89',
    flex: 1,
  },
});
