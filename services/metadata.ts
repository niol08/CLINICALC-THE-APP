import AsyncStorage from '@react-native-async-storage/async-storage';
import { CalculationsJson } from '../types/calculations';

import Constants from 'expo-constants';

const API_BASE =
  Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL;

const KEY_VERSION = 'calc_metadata_version';
const KEY_METADATA = 'calc_metadata_json';

export async function fetchServerVersion(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/api/metadata/version`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.version;
  } catch (error) {
    console.error('Error fetching server version:', error);
    return null;
  }
}

export async function fetchServerMetadata(): Promise<CalculationsJson | null> {
  try {
    const res = await fetch(`${API_BASE}/api/metadata`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as CalculationsJson;
  } catch (error) {
    console.error('Error fetching server metadata:', error);
    return null;
  }
}

export async function loadCachedMetadata(): Promise<{
  version: string | null;
  data: CalculationsJson | null;
}> {
  try {
    const version = await AsyncStorage.getItem(KEY_VERSION);
    const dataStr = await AsyncStorage.getItem(KEY_METADATA);

    return {
      version,
      data: dataStr ? JSON.parse(dataStr) : null,
    };
  } catch (error) {
    console.error('Error loading cached metadata:', error);
    return { version: null, data: null };
  }
}

export async function saveMetadata(
  version: string,
  data: CalculationsJson
): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY_VERSION, version);
    await AsyncStorage.setItem(KEY_METADATA, JSON.stringify(data));
    console.log('✓ Saved metadata version:', version);
  } catch (error) {
    console.error('Error saving metadata:', error);
  }
}

export async function syncMetadata(): Promise<CalculationsJson | null> {
  const cached = await loadCachedMetadata();
  const serverVersion = await fetchServerVersion();

  if (cached.version && cached.version === serverVersion && cached.data) {
    console.log('✓ Using cached metadata, version:', cached.version);
    return cached.data;
  }

  console.log('⟳ Fetching fresh metadata from server...');
  const serverMetadata = await fetchServerMetadata();
  if (serverMetadata && serverVersion) {
    await saveMetadata(serverVersion, serverMetadata);
    console.log('✓ Saved fresh metadata, version:', serverVersion);
    return serverMetadata;
  }

  if (cached.data) {
    console.log('⚠ Server fetch failed, using cached data');
    return cached.data;
  }

  console.error('✗ No data available (cache and server both failed)');
  return null;
}

export async function clearCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY_VERSION);
    await AsyncStorage.removeItem(KEY_METADATA);
    console.log('✓ Cache cleared');
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

export async function getCachedVersion(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(KEY_VERSION);
  } catch (error) {
    console.error('Error getting cached version:', error);
    return null;
  }
}
