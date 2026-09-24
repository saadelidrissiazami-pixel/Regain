import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

/** Expo Go ne contient que les modules natifs qu'il embarque : le calendrier et les achats
 *  purchases are not there, so a development build (EAS) or the published app is required. */
export const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export const isWeb = Platform.OS === 'web';
