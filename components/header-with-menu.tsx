import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Image,
  Pressable,
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export function HeaderWithMenu() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-500));
  const router = useRouter();

  const openMenu = () => {
    setMenuVisible(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      speed: 14,
      bounciness: 8,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(slideAnim, {
      toValue: -500,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setMenuVisible(false));
  };

  const handleNavigation = (route: string) => {
    closeMenu();
    router.push(route as any);
  };

  return (
    <>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image
            source={require('../assets/images/icon.png')}
            style={{ width: 28, height: 28 }}
            resizeMode='contain'
          />
          <TouchableOpacity onPress={openMenu} activeOpacity={0.7}>
            <Feather name='menu' size={28} color='#111318' />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={menuVisible}
        transparent={false}
        animationType='none'
        onRequestClose={closeMenu}
        statusBarTranslucent
      >
        <Animated.View
          style={[
            styles.menuContainer,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          <SafeAreaView
            style={{ flex: 1 }}
            edges={['top', 'left', 'right', 'bottom']}
          >
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Menu</Text>
              <TouchableOpacity onPress={closeMenu} activeOpacity={0.7}>
                <Feather name='x' size={24} color='#111318' />
              </TouchableOpacity>
            </View>

            <View style={styles.menuItems}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleNavigation('/screens/recents')}
                activeOpacity={0.7}
              >
                <MaterialIcons name='history' size={24} color='#616f89' />
                <Text style={styles.menuItemText}>Recents</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleNavigation('/screens/favorites')}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name='favorite-border'
                  size={24}
                  color='#616f89'
                />
                <Text style={styles.menuItemText}>Favorites</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleNavigation('/screens/about')}
                activeOpacity={0.7}
              >
                <Feather name='info' size={24} color='#616f89' />
                <Text style={styles.menuItemText}>About</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Animated.View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    paddingTop: 0,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  menuTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: '#111318',
  },
  menuItems: {
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  menuItemText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#111318',
  },
  closeOverlay: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
  },
});
