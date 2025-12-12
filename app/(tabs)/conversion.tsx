import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as Clipboard from 'expo-clipboard';
import { CONVERSIONS } from '@/constants/conversions';
import { ConversionCategory } from '@/types/conversion.types';
import { convertValue } from '@/utils/conversionHelper';

export default function ConversionScreen() {
  const [selectedCategory, setSelectedCategory] =
    React.useState<ConversionCategory>('length');
  const [fromValue, setFromValue] = React.useState('');
  const [toValue, setToValue] = React.useState('');
  const [fromUnit, setFromUnit] = React.useState('m');
  const [toUnit, setToUnit] = React.useState('cm');
  const [showCopiedAlert, setShowCopiedAlert] = React.useState(false);

  const [selectedAnalyte, setSelectedAnalyte] = React.useState('glucose');
  const [infusionAnalyte, setInfusionAnalyte] = React.useState('');
  const [concentration, setConcentration] = React.useState('');
  const [showWarning, setShowWarning] = React.useState(false);

  const currentConversion = CONVERSIONS[selectedCategory];

  const handleCategoryChange = (category: ConversionCategory) => {
    setSelectedCategory(category);
    const units = CONVERSIONS[category].units;
    setFromUnit(units[0].value);
    setToUnit(units[1]?.value || units[0].value);
    setFromValue('');
    setToValue('');
    setShowWarning(false);
  };

  const handleFromValueChange = (value: string) => {
    setFromValue(value);
    const result = convertValue(value, fromUnit, toUnit, selectedCategory, {
      selectedAnalyte,
      concentration,
      infusionAnalyte,
      setShowWarning,
    });
    setToValue(result);
  };

  const handleFromUnitChange = (unit: string) => {
    setFromUnit(unit);
    const result = convertValue(fromValue, unit, toUnit, selectedCategory, {
      selectedAnalyte,
      concentration,
      infusionAnalyte,
      setShowWarning,
    });
    setToValue(result);
  };

  const handleToUnitChange = (unit: string) => {
    setToUnit(unit);
    const result = convertValue(fromValue, fromUnit, unit, selectedCategory, {
      selectedAnalyte,
      concentration,
      infusionAnalyte,
      setShowWarning,
    });
    setToValue(result);
  };

  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setFromValue(toValue);
    setToValue(fromValue);
  };

  const handleAnalyteChange = (value: string) => {
    setSelectedAnalyte(value);
    const result = convertValue(fromValue, fromUnit, toUnit, selectedCategory, {
      selectedAnalyte: value,
      concentration,
      infusionAnalyte,
      setShowWarning,
    });
    setToValue(result);
  };

  const handleInfusionAnalyteChange = (value: string) => {
    setInfusionAnalyte(value);
    const result = convertValue(fromValue, fromUnit, toUnit, selectedCategory, {
      selectedAnalyte,
      concentration,
      infusionAnalyte: value,
      setShowWarning,
    });
    setToValue(result);
  };

  const handleConcentrationChange = (value: string) => {
    setConcentration(value);
    const result = convertValue(fromValue, fromUnit, toUnit, selectedCategory, {
      selectedAnalyte,
      concentration: value,
      infusionAnalyte,
      setShowWarning,
    });
    setToValue(result);
  };

  const handleCopyToClipboard = async () => {
    if (toValue) {
      await Clipboard.setStringAsync(toValue);
      setShowCopiedAlert(true);
      setTimeout(() => {
        setShowCopiedAlert(false);
      }, 2000);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Unit Conversions</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {(Object.keys(CONVERSIONS) as ConversionCategory[]).map(
            (category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.chip,
                  selectedCategory === category && styles.chipActive,
                ]}
                onPress={() => handleCategoryChange(category)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedCategory === category && styles.chipTextActive,
                  ]}
                >
                  {CONVERSIONS[category].name}
                </Text>
              </TouchableOpacity>
            )
          )}
        </ScrollView>

        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          enableOnAndroid={true}
          enableAutomaticScroll={true}
          extraScrollHeight={Platform.OS === 'ios' ? 0 : -50}
          extraHeight={Platform.OS === 'ios' ? 0 : -50}
          keyboardShouldPersistTaps='handled'
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View style={styles.conversionCard}>
            {selectedCategory === 'concentration' && (
              <View style={styles.extraInputGroup}>
                <Text style={styles.label}>Analyte</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedAnalyte}
                    onValueChange={handleAnalyteChange}
                    style={styles.picker}
                  >
                    <Picker.Item label='Glucose' value='glucose' />
                    <Picker.Item label='Cholesterol' value='cholesterol' />
                    <Picker.Item label='Triglycerides' value='triglycerides' />
                    <Picker.Item label='BUN' value='bun' />
                    <Picker.Item label='Creatinine' value='creatinine' />
                    <Picker.Item label='Uric Acid' value='uric_acid' />
                    <Picker.Item label='Calcium' value='calcium' />
                  </Picker>
                </View>
              </View>
            )}

            {selectedCategory === 'infusion' && (
              <>
                <View style={styles.extraInputGroup}>
                  <Text style={styles.label}>Analyte (Optional for IU)</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={infusionAnalyte}
                      onValueChange={handleInfusionAnalyteChange}
                      style={styles.picker}
                    >
                      <Picker.Item label='Select Analyte' value='' />
                      <Picker.Item label='Insulin' value='insulin' />
                      <Picker.Item label='Heparin' value='heparin' />
                      <Picker.Item label='Vitamin D' value='vitaminD' />
                      <Picker.Item label='Vitamin A' value='vitaminA' />
                      <Picker.Item label='Vitamin E' value='vitaminE' />
                      <Picker.Item
                        label='Erythropoietin'
                        value='erythropoietin'
                      />
                    </Picker>
                  </View>
                </View>

                <View style={styles.extraInputGroup}>
                  <Text style={styles.label}>
                    Concentration (mg/mL, Optional)
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    value={concentration}
                    onChangeText={handleConcentrationChange}
                    keyboardType='decimal-pad'
                    placeholder='Enter concentration'
                    placeholderTextColor='#9CA3AF'
                  />
                </View>

                {showWarning && (
                  <View style={styles.warningBox}>
                    <Ionicons
                      name='warning-outline'
                      size={16}
                      color='#d97706'
                    />
                    <Text style={styles.warningText}>
                      IU conversions are only supported with mg or µg units.
                    </Text>
                  </View>
                )}
              </>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>From</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.valueInput}
                  value={fromValue}
                  onChangeText={handleFromValueChange}
                  keyboardType='decimal-pad'
                  placeholder='0'
                  placeholderTextColor='#9CA3AF'
                  multiline={false}
                />
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={fromUnit}
                    onValueChange={handleFromUnitChange}
                    style={styles.picker}
                  >
                    {currentConversion.units.map((unit) => (
                      <Picker.Item
                        key={unit.value}
                        label={unit.label}
                        value={unit.value}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            <View style={styles.swapContainer}>
              <TouchableOpacity
                style={styles.swapButton}
                onPress={handleSwap}
                activeOpacity={0.7}
              >
                <Ionicons name='swap-vertical' size={24} color='#ffffff' />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>To</Text>
                <View style={styles.copyButtonContainer}>
                  {toValue ? (
                    <TouchableOpacity
                      style={styles.copyButton}
                      onPress={handleCopyToClipboard}
                      activeOpacity={0.7}
                    >
                      <Ionicons name='copy-outline' size={14} color='#135bec' />
                      <Text style={styles.copyButtonText}>Copy</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
              <View style={styles.inputRow}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.valueScrollView}
                  contentContainerStyle={styles.valueScrollContent}
                >
                  <Text style={styles.valueInputReadOnly}>
                    {toValue || '0'}
                  </Text>
                </ScrollView>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={toUnit}
                    onValueChange={handleToUnitChange}
                    style={styles.picker}
                  >
                    {currentConversion.units.map((unit) => (
                      <Picker.Item
                        key={unit.value}
                        label={unit.label}
                        value={unit.value}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </ScrollView>

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
              {toValue} copied to clipboard
            </Text>
          </View>
        </View>
      </Modal>
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
  },
  headerSpacer: {
    width: 40,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#111318',
  },
  chipsContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  chip: {
    height: 40,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  chipActive: {
    backgroundColor: '#135bec',
  },
  chipText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#111318',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  conversionCard: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  extraInputGroup: {
    marginBottom: 20,
    gap: 8,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#616f89',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 24,
  },
  copyButtonContainer: {
    minWidth: 60,
    alignItems: 'flex-end',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  copyButtonText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#135bec',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  valueScrollView: {
    flex: 1,
    maxHeight: 50,
  },
  valueScrollContent: {
    flexGrow: 1,
  },
  valueInput: {
    flex: 1,
    fontSize: 36,
    fontFamily: 'Inter_700Bold',
    color: '#111318',
    padding: 0,
    margin: 0,
  },
  valueInputReadOnly: {
    fontSize: 36,
    fontFamily: 'Inter_700Bold',
    color: '#111318',
    padding: 0,
    margin: 0,
  },
  textInput: {
    height: 48,
    backgroundColor: '#f6f6f8',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#111318',
  },
  pickerContainer: {
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    justifyContent: 'center',
    minWidth: 160,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    color: '#111318',
  },
  swapContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  swapButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#135bec',
    justifyContent: 'center',
    alignItems: 'center',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: '#92400e',
  },
  // Update the alert styles (lines 545-581)
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
});
