import AsyncStorage from '@react-native-async-storage/async-storage';

// Sauvegarde de la dernière page lue
export const saveLastReadPage = async (pageIndex: number | null) => {
  try {
    if (pageIndex === null) {
      await AsyncStorage.removeItem('lastReadPage');
    } else {
      await AsyncStorage.setItem('lastReadPage', JSON.stringify(pageIndex));
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la dernière page lue :', error);
  }
};

// Sauvegarde de la préférence de sauvegarde automatique
export const saveAutoSaveEnabled = async (enabled: boolean) => {
  try {
    await AsyncStorage.setItem('autoSaveEnabled', JSON.stringify(enabled));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la préférence de sauvegarde automatique :', error);
  }
};

// Récupération de la dernière page lue
export const getLastReadPage = async (): Promise<number | null> => {
  try {
    const value = await AsyncStorage.getItem('lastReadPage');
    return value ? JSON.parse(value) : null; // null si aucune page sauvegardée
  } catch (error) {
    console.error('Erreur lors de la récupération de la dernière page lue :', error);
    return null;
  }
};

// Récupération de la préférence de sauvegarde automatique
export const getAutoSaveEnabled = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem('autoSaveEnabled');
    return value ? JSON.parse(value) : true; // Par défaut activé
  } catch (error) {
    console.error('Erreur lors de la récupération de la préférence de sauvegarde automatique :', error);
    return true; // Par défaut activé
  }
};

// Sauvegarde des pages marquées comme mémorisées (hifdh)
export const saveHifdhPages = async (pages: number[]) => {
  try {
    console.log('Sauvegarde des pages Hifdh:', pages);
    await AsyncStorage.setItem('hifdhPages', JSON.stringify(pages));
    console.log('Pages Hifdh sauvegardées avec succès');
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des pages hifdh :', error);
  }
};

// Récupération des pages marquées comme mémorisées (hifdh)
export const getHifdhPages = async (): Promise<number[]> => {
  try {
    const value = await AsyncStorage.getItem('hifdhPages');
    const parsed = value ? JSON.parse(value) : [];
    console.log('Pages Hifdh récupérées:', parsed);
    return parsed;
  } catch (error) {
    console.error('Erreur lors de la récupération des pages hifdh :', error);
    return [];
  }
};

// Sauvegarde de la page bookmark
export const saveBookmarkPage = async (pageIndex: number | null) => {
  try {
    if (pageIndex === null) {
      await AsyncStorage.removeItem('bookmarkPage');
    } else {
      await AsyncStorage.setItem('bookmarkPage', JSON.stringify(pageIndex));
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la page bookmark :', error);
  }
};

// Récupération de la page bookmark
export const getBookmarkPage = async (): Promise<number | null> => {
  try {
    const value = await AsyncStorage.getItem('bookmarkPage');
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Erreur lors de la récupération de la page bookmark :', error);
    return null;
  }
};