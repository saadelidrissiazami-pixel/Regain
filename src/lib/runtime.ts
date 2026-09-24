import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

/** Expo Go only contains the native modules it ships with: the calendar and in-app
 *  purchases are not there, so a development build (EAS) or the published app is required. */
export const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export const isWeb = Platform.OS === 'web';
