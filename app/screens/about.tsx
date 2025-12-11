import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AboutScreen() {
  const router = useRouter();

  const [expandedSection, setExpandedSection] = React.useState<string | null>(
    'team'
  );

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Failed to open URL:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name='arrow-back' size={24} color='#111318' />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.appInfoSection}>
          <View style={styles.appIconContainer}>
            <Image
              source={require('../../assets/images/icon.png')}
              style={styles.appIcon}
            />
          </View>
          <Text style={styles.appName}>CLINICALC</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appDescription}>
            Providing accurate and accessible medical calculations and unit
            conversions for healthcare professionals.
          </Text>
        </View>
        <View style={styles.accordionsSection}>
          <View style={styles.accordion}>
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => toggleSection('about')}
              activeOpacity={0.7}
            >
              <Text style={styles.accordionTitle}>About the App</Text>
              <Ionicons
                name='chevron-down'
                size={20}
                color='#111318'
                style={[
                  styles.accordionIcon,
                  expandedSection === 'about' && styles.accordionIconExpanded,
                ]}
              />
            </TouchableOpacity>
            {expandedSection === 'about' && (
              <Text style={styles.accordionContent}>
                Clinicalc is an open-source project which is designed to
                simplify complex medical calculations, ensuring accuracy and
                efficiency for clinicians. Our mission is to provide a reliable
                tool that supports better patient care.
              </Text>
            )}
          </View>

          <View style={styles.accordion}>
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => toggleSection('team')}
              activeOpacity={0.7}
            >
              <Text style={styles.accordionTitle}>Our Team</Text>
              <Ionicons
                name='chevron-down'
                size={20}
                color='#111318'
                style={[
                  styles.accordionIcon,
                  expandedSection === 'team' && styles.accordionIconExpanded,
                ]}
              />
            </TouchableOpacity>
            {expandedSection === 'team' && (
              <View style={styles.accordionContent}>
                <View style={styles.teamMember}>
                  <View style={styles.teamMemberIcon}>
                    <Ionicons name='person' size={24} color='#135bec' />
                  </View>
                  <View style={styles.teamMemberInfo}>
                    <Text style={styles.teamMemberName}>Oladejo Eniola</Text>
                    <Text style={styles.teamMemberRole}>Lead Developer</Text>
                  </View>
                </View>

                {/* <View style={styles.teamMember}>
                  <View style={styles.teamMemberIcon}>
                    <Ionicons name='person' size={24} color='#135bec' />
                  </View>
                  <View style={styles.teamMemberInfo}>
                    <Text style={styles.teamMemberName}>Second Developer</Text>
                    <Text style={styles.teamMemberRole}>Medical Advisor</Text>
                  </View>
                </View> */}
              </View>
            )}
          </View>

          <View style={styles.accordion}>
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => toggleSection('legal')}
              activeOpacity={0.7}
            >
              <Text style={styles.accordionTitle}>Legal & Disclaimers</Text>
              <Ionicons
                name='chevron-down'
                size={20}
                color='#111318'
                style={[
                  styles.accordionIcon,
                  expandedSection === 'legal' && styles.accordionIconExpanded,
                ]}
              />
            </TouchableOpacity>
            {expandedSection === 'legal' && (
              <Text style={styles.accordionContent}>
                This app is intended for use by medical professionals only. All
                calculations should be verified. By using this app, you agree to
                our Terms of Service and Privacy Policy.
              </Text>
            )}
          </View>
        </View>

        {/* List Items Section */}
        <View style={styles.listSection}>
          <TouchableOpacity
            style={[styles.listItem, styles.listItemBorder]}
            onPress={() => handleLink('https://forms.gle/dedzjteKgwVjqMqR8')}
            activeOpacity={0.7}
          >
            <View style={styles.listItemLeft}>
              <View style={styles.listItemIcon}>
                <Ionicons name='chatbubble-outline' size={24} color='#135bec' />
              </View>
              <Text style={styles.listItemText}>Provide Feedback</Text>
            </View>
            <Ionicons name='chevron-forward' size={20} color='#616f89' />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.listItem, styles.listItemBorder]}
            onPress={() =>
              handleLink('https://github.com/niol08/CLINICALC.git')
            }
            activeOpacity={0.7}
          >
            <View style={styles.listItemLeft}>
              <View style={styles.listItemIcon}>
                <Ionicons name='code-slash-outline' size={24} color='#135bec' />
              </View>
              <Text style={styles.listItemText}>Contribute on GitHub</Text>
            </View>
            <Ionicons name='chevron-forward' size={20} color='#616f89' />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.listItem}
            onPress={() => handleLink('https://google.com')}
            activeOpacity={0.7}
          >
            <View style={styles.listItemLeft}>
              <View style={styles.listItemIcon}>
                <Ionicons name='star-outline' size={24} color='#135bec' />
              </View>
              <Text style={styles.listItemText}>Rate on App Store</Text>
            </View>
            <Ionicons name='chevron-forward' size={20} color='#616f89' />
          </TouchableOpacity>
        </View>

        <View style={styles.socialSection}>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => handleLink('https://x.com/')}
            activeOpacity={0.7}
          >
            <Ionicons name='logo-x' size={24} color='#616f89' />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => handleLink('https://linkedin.com/')}
            activeOpacity={0.7}
          >
            <Ionicons name='logo-linkedin' size={24} color='#616f89' />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() =>
              handleLink('https://github.com/niol08/CLINICALC.git')
            }
            activeOpacity={0.7}
          >
            <Ionicons name='logo-github' size={24} color='#616f89' />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => handleLink('mailto:enioldejo1725@gmail.com')}
            activeOpacity={0.7}
          >
            <Ionicons name='mail-outline' size={24} color='#616f89' />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  appInfoSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
  },
  appIconContainer: {
    width: 96,
    height: 96,
    // borderRadius: 16,
    // backgroundColor: '#135bec',
    justifyContent: 'center',
    alignItems: 'center',
    // marginBottom: 12,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.15,
    // shadowRadius: 8,
    // elevation: 4,
  },
  appIcon: {
    width: 80,
    height: 80,
    // borderRadius: 12,
  },
  appName: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: '#111318',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#616f89',
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#616f89',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
    marginTop: 8,
  },
  accordionsSection: {
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 8,
  },
  accordion: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  accordionTitle: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#111318',
  },
  accordionIcon: {
    // transition: 'transform 0.2s',
  },
  accordionIconExpanded: {
    transform: [{ rotate: '180deg' }],
  },
  accordionContent: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#616f89',
    lineHeight: 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  teamMember: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  teamMemberIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(19, 91, 236, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamMemberInfo: {
    flex: 1,
  },
  teamMemberName: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#111318',
    marginBottom: 2,
  },
  teamMemberRole: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#616f89',
  },
  listSection: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  listItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  listItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(19, 91, 236, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listItemText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#111318',
  },
  socialSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  socialButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
