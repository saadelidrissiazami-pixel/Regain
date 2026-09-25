import * as ImagePicker from 'expo-image-picker';

import { lang, t } from './i18n';
import { supabase } from './supabase';

export type PhotoEstimateItem = {
  label: string;
  calories: number;
  protein_g: number;
  // Absent from what a server deployed before this version returns, so never assumed present.
  carbs_g?: number | null;
  fat_g?: number | null;
};
export type PhotoEstimate = { items: PhotoEstimateItem[]; note: string };

// The photo is only ever a means of estimating: it is sent, read, and never stored anywhere —
// not in the table, not in a bucket. What survives is the numbers the person confirms.
// 0.4 keeps a meal legible while holding a phone photo well under the function's size limit;
// base64 adds about a third on top of whatever comes back.
const QUALITY = 0.4;

export type PickedPhoto = { base64: string; mediaType: string };

async function fromResult(result: ImagePicker.ImagePickerResult): Promise<PickedPhoto | null> {
  if (result.canceled) return null;
  const asset = result.assets?.[0];
  if (!asset?.base64) return null;
  // The picker returns JPEG for a camera shot; a library item keeps its own type.
  const mediaType = asset.mimeType === 'image/png' || asset.mimeType === 'image/webp' ? asset.mimeType : 'image/jpeg';
  return { base64: asset.base64, mediaType };
}

export async function takeMealPhoto(): Promise<PickedPhoto | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) throw new Error(t('Allow camera access for Regain to estimate from a photo.'));
  return fromResult(
    await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: QUALITY, base64: true, exif: false })
  );
}

export async function pickMealPhoto(): Promise<PickedPhoto | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) throw new Error(t('Allow photo access for Regain to estimate from a photo.'));
  return fromResult(
    await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: QUALITY, base64: true, exif: false })
  );
}

export async function estimateFromPhoto(photo: PickedPhoto): Promise<PhotoEstimate> {
  const { data, error } = await supabase.functions.invoke<PhotoEstimate>('nutrition-photo', {
    body: { image: photo.base64, mediaType: photo.mediaType, language: lang },
  });

  if (error) {
    const response = (error as { context?: Response }).context;
    if (response?.status === 404) throw new Error(t('The photo estimate is not deployed on the server yet.'));
    const body = await response?.json().catch(() => null);
    throw new Error(body?.error ?? t('The photo estimate is unavailable for the moment.'));
  }
  return { items: data?.items ?? [], note: data?.note ?? '' };
}
