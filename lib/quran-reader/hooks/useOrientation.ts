import { useEffect } from 'react';

// Charger Expo ScreenOrientation uniquement si disponible (évite les erreurs de bundling)
let ScreenOrientation: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  ScreenOrientation = require('expo-screen-orientation');
} catch (e) {
  console.warn('expo-screen-orientation non disponible, le verrouillage d’orientation sera ignoré.');
}

export const useOrientation = (landscapeEnabled: boolean) => {
  useEffect(() => {
    const lockOrientation = async () => {
      if (!ScreenOrientation) return;
      try {
        if (landscapeEnabled) {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT);
        } else {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        }
      } catch (e) {
        console.warn('Orientation lock failed', e);
      }
    };
    lockOrientation();
  }, [landscapeEnabled]);

  useEffect(() => {
    const initialLockOrientation = async () => {
      if (!ScreenOrientation) return;
      try {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      } catch (e) {
        console.warn('Initial orientation lock failed', e);
      }
    };
    initialLockOrientation();
  }, []);
};

