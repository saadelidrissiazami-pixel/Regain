import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

/** Expo Go ne contient que les modules natifs qu'il embarque : le calendrier et les achats
 *  intégrés n'y sont pas, il faut un build de développement (EAS) ou l'app publiée. */
export const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export const isWeb = Platform.OS === 'web';
