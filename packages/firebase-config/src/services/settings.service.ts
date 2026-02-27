import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '../admin';
import { successResponse, errorResponse } from '../helpers/response';
import type { IResponse } from '../helpers/response';
import type { FirestoreSettings } from '../types/settings.types';

const SETTINGS_DOC = 'settings/general';

function settingsDoc() {
  return adminDb.doc(SETTINGS_DOC);
}

export async function getSettings(): Promise<IResponse<FirestoreSettings | null>> {
  try {
    const doc = await settingsDoc().get();

    if (!doc.exists) {
      // Return default empty settings
      return successResponse(
        { metaPixelId: '', steadfastApiKey: '', steadfastSecretKey: '', updatedAt: Timestamp.now() } as FirestoreSettings,
        'Settings retrieved (defaults)'
      );
    }

    return successResponse(doc.data() as FirestoreSettings, 'Settings retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse('Failed to retrieve settings', 500, message);
  }
}

export async function updateSettings(
  data: Partial<Omit<FirestoreSettings, 'updatedAt'>>
): Promise<IResponse<FirestoreSettings>> {
  try {
    const updateData = {
      ...data,
      updatedAt: Timestamp.now(),
    };

    await settingsDoc().set(updateData, { merge: true });

    const updated = await settingsDoc().get();
    return successResponse(updated.data() as FirestoreSettings, 'Settings updated successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse('Failed to update settings', 500, message);
  }
}
