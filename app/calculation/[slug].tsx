import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMetadata } from '../../hooks/useMetadata';
import { Parameter } from '../../types/calculations';
import { computeCalculation } from '../../services/calculation';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { FormValues, FormErrors } from '@/types';

const saveToRecents = async (calculationData: {
  name: string;
  slug: string;
  inputs: string;
  result: string;
  unit?: string;
}) => {
  try {
    const stored = await AsyncStorage.getItem('recent_calculations');
    const recents = stored ? JSON.parse(stored) : [];

    const newItem = {
      id: Date.now().toString(),
      ...calculationData,
      timestamp: Date.now(),
    };

    const updated = [newItem, ...recents].slice(0, 50);
    await AsyncStorage.setItem('recent_calculations', JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save to recents:', error);
  }
};

export default function CalculationInputScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data, loading } = useMetadata();
  const [formValues, setFormValues] = React.useState<FormValues>({});
  const [formErrors, setFormErrors] = React.useState<FormErrors>({});
  const [calculating, setCalculating] = React.useState(false);

  const calculation = React.useMemo(() => {
    if (!data?.categories) return null;
    for (const category of data.categories) {
      const calc = category.calculations.find(
        (c) => (c.slug || c.name) === slug
      );
      if (calc) return calc;
    }
    return null;
  }, [data, slug]);

  React.useEffect(() => {
    if (calculation) {
      const defaults: FormValues = {};
      calculation.parameters.forEach((param) => {
        if (param.options || param.enum) {
          const value = param.enum ? param.enum[0] : param.options?.[0];
          if (value !== undefined) {
            defaults[param.name] = value;
          }
        } else if (param.default !== undefined) {
          defaults[param.name] = param.default;
        }
      });
      setFormValues(defaults);
    }
  }, [calculation]);

  const handleInputChange = (paramName: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [paramName]: value }));
    if (formErrors[paramName]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[paramName];
        return newErrors;
      });
    }
  };

  const handleRadioChange = (paramName: string, value: number | string) => {
    setFormValues((prev) => ({ ...prev, [paramName]: value }));
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    calculation?.parameters.forEach((param) => {
      const value = formValues[param.name];

      if (param.required !== false && (value === undefined || value === '')) {
        errors[param.name] = 'This field is required.';
        return;
      }

      if (value === undefined || value === '') {
        return;
      }

      if (param.type === 'float' || param.type === 'integer') {
        const numValue = Number(value);
        if (isNaN(numValue)) {
          errors[param.name] = 'Please enter a valid number.';
          return;
        }

        if (param.min !== undefined && numValue < param.min) {
          errors[param.name] = `Value must be at least ${param.min}.`;
          return;
        }
        if (param.max !== undefined && numValue > param.max) {
          errors[param.name] = `Value must be at most ${param.max}.`;
          return;
        }
      }

      if (param.enum && !param.enum.includes(value as number)) {
        errors[param.name] = 'Please select a valid option.';
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCalculate = async () => {
    if (!validateForm()) {
      return;
    }

    setCalculating(true);

    try {
      const params: { [key: string]: string | number } = {};
      const inputSummary: { label: string; value: string; unit?: string }[] =
        [];

      calculation?.parameters.forEach((param) => {
        const value = formValues[param.name];

        if (value !== undefined && value !== '') {
          if (param.type === 'float') {
            params[param.name] = parseFloat(value.toString());
          } else if (param.type === 'integer') {
            params[param.name] = parseInt(value.toString(), 10);
          } else {
            params[param.name] = value;
          }

          const inputItem: { label: string; value: string; unit?: string } = {
            label: param.description || param.name,
            value: value.toString(),
          };

          if (param.unit) {
            inputItem.unit = param.unit;
          }
          inputSummary.push(inputItem);
          // inputSummary.push({
          //   label: param.description || param.name,
          //   value: value.toString(),
          //   ...(param.unit && { unit: param.unit }),
          // });
        }
      });

      const calculationResult = await computeCalculation(
        calculation?.name || '',
        params
      );

      await saveToRecents({
        name: calculation?.name || '',
        slug: slug,
        inputs: JSON.stringify(inputSummary),
        result: calculationResult.result.toString(),
        unit: calculationResult.unit,
      });

      router.push({
        pathname: '/calculation/result',
        params: {
          name: calculation?.name || '',
          slug: slug,
          result: calculationResult.result.toString(),
          unit: calculationResult.unit || '',
          inputs: JSON.stringify(inputSummary),
          params: JSON.stringify(params),
        },
      } as any);
    } catch (error) {
      Alert.alert(
        'Calculation Error',
        error instanceof Error
          ? error.message
          : 'Failed to calculate result. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setCalculating(false);
    }
  };

  const renderInput = (param: Parameter) => {
    const hasError = !!formErrors[param.name];
    const inputMode =
      param.type === 'integer'
        ? 'numeric'
        : param.type === 'float'
        ? 'decimal'
        : 'text';

    return (
      <View key={param.name} style={styles.inputContainer}>
        <Text style={styles.label}>
          {param.description || param.name}
          {param.required !== false && <Text style={styles.required}> *</Text>}
        </Text>
        {param.unit && <Text style={styles.unitLabel}>Unit: {param.unit}</Text>}
        <TextInput
          style={[styles.input, hasError && styles.inputError]}
          placeholder={param.unit || 'Enter value'}
          placeholderTextColor='#8A8A8E'
          value={formValues[param.name]?.toString() || ''}
          onChangeText={(value) => handleInputChange(param.name, value)}
          keyboardType={
            inputMode === 'numeric'
              ? 'number-pad'
              : inputMode === 'decimal'
              ? 'decimal-pad'
              : 'default'
          }
          editable={!calculating}
        />
        {hasError && (
          <Text style={styles.errorText}>{formErrors[param.name]}</Text>
        )}
      </View>
    );
  };

  const renderRadioGroup = (param: Parameter) => {
    const options = param.options || param.enum?.map(String) || [];
    const selectedValue = formValues[param.name];

    return (
      <View key={param.name} style={styles.radioContainer}>
        <Text style={styles.label}>
          {param.description || param.name}
          {param.required !== false && <Text style={styles.required}> *</Text>}
        </Text>
        <View style={styles.segmentedControl}>
          {options.map((option, index) => {
            const value = param.enum ? param.enum[index] : option;
            const isSelected = selectedValue === value;
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.segmentButton,
                  isSelected && styles.segmentButtonActive,
                ]}
                onPress={() => handleRadioChange(param.name, value)}
                activeOpacity={0.7}
                disabled={calculating}
              >
                <Text
                  style={[
                    styles.segmentText,
                    isSelected && styles.segmentTextActive,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderParameter = (param: Parameter) => {
    if (param.options || param.enum) {
      return renderRadioGroup(param);
    }
    return renderInput(param);
  };

  if (loading && !calculation) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='#135bec' />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!calculation) {
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
            Not Found
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <Ionicons name='alert-circle-outline' size={48} color='#9CA3AF' />
          <Text style={styles.errorMessage}>Calculation not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
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
          {calculation.name}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAwareScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={20}
        keyboardShouldPersistTaps='handled'
      >
        <Text style={styles.mainTitle}>{calculation.name}</Text>

        <View style={styles.formSection}>
          {calculation.parameters.map((param) => renderParameter(param))}
        </View>
      </KeyboardAwareScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.calculateButton,
            calculating && styles.calculateButtonDisabled,
          ]}
          onPress={handleCalculate}
          activeOpacity={0.8}
          disabled={calculating}
        >
          {calculating ? (
            <ActivityIndicator size='small' color='#ffffff' />
          ) : (
            <Text style={styles.calculateButtonText}>Calculate</Text>
          )}
        </TouchableOpacity>
      </View>
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
    backgroundColor: '#f6f6f8',
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
    paddingBottom: 20,
  },
  mainTitle: {
    fontSize: 26,
    fontFamily: 'Inter_700Bold',
    color: '#111318',
    letterSpacing: -0.52,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  formSection: {
    paddingHorizontal: 16,
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#111318',
    lineHeight: 22,
  },
  required: {
    color: '#FF3B30',
  },
  unitLabel: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#616f89',
    marginTop: -4,
  },
  input: {
    height: 48,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dbdfe6',
    paddingHorizontal: 15,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#111318',
  },
  inputError: {
    borderColor: '#FF3B30',
    borderWidth: 2,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#FF3B30',
    paddingTop: 4,
  },
  radioContainer: {
    gap: 8,
    paddingTop: 8,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    padding: 4,
    gap: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentButtonActive: {
    backgroundColor: '#ffffff',
  },
  segmentText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#111318',
  },
  segmentTextActive: {
    color: '#111318',
  },
  bottomContainer: {
    backgroundColor: '#f6f6f8',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#dbdfe6',
  },
  calculateButton: {
    height: 56,
    backgroundColor: '#135bec',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calculateButtonDisabled: {
    opacity: 0.6,
  },
  calculateButtonText: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: '#ffffff',
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
  errorMessage: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#616f89',
  },
});
