# Téléchargement des fichiers audio en ZIP

Ce document explique comment configurer le téléchargement de tous les fichiers audio en un seul fichier ZIP.

## 📋 Prérequis

1. Créer un fichier ZIP contenant tous vos fichiers audio (002.mp3, 003.mp3, 458.mp3, etc.)
2. Uploader le fichier ZIP sur Google Drive (ou votre serveur)
3. Installer une bibliothèque pour décompresser le ZIP (voir ci-dessous)
4. Configurer l'ID du fichier ZIP dans les constantes

## 🔧 Configuration

### 1. Créer le fichier ZIP

Créez un fichier ZIP contenant tous vos fichiers audio. Le nom du fichier ZIP n'a pas d'importance, mais les fichiers audio doivent avoir leurs noms d'origine (002.mp3, 003.mp3, etc.).

### 2. Uploader sur Google Drive

1. Uploader le fichier ZIP sur Google Drive
2. Ouvrir le fichier ZIP dans Google Drive
3. Copier l'ID depuis l'URL
   - Exemple: `https://drive.google.com/file/d/ABC123XYZ/view`
   - L'ID est: `ABC123XYZ`

### 3. Configurer l'ID du fichier ZIP

Ouvrez `lib/quran-reader/constants.ts` et remplacez `REMPLACEZ_PAR_L_ID_DU_FICHIER_ZIP` par l'ID de votre fichier ZIP:

```typescript
export const GOOGLE_DRIVE_ZIP_FILE_ID = 'VOTRE_ID_ICI';
```

### 4. Installer une bibliothèque de décompression

Pour décompresser le ZIP dans React Native/Expo, vous avez deux options:

#### Option A: react-native-zip-archive (Expo Bare Workflow uniquement)

Cette bibliothèque nécessite du code natif et ne fonctionne que dans Expo Bare Workflow.

```bash
npm install react-native-zip-archive
# ou
yarn add react-native-zip-archive
```

Pour iOS:
```bash
cd ios && pod install && cd ..
```

#### Option B: Expo managed workflow

Pour Expo managed workflow, vous devrez soit:
- Passer à Expo bare workflow pour utiliser `react-native-zip-archive`
- Ou utiliser une solution backend pour décompresser le ZIP

## 🔨 Utilisation

Une fois configuré, l'application téléchargera automatiquement le fichier ZIP lorsque l'utilisateur choisit de télécharger les fichiers audio. Le ZIP sera décompressé et tous les fichiers audio seront extraits dans le cache de l'application.

## ⚠️ Notes importantes

- Le ZIP ne sera téléchargé qu'une seule fois
- Si les fichiers sont déjà extraits, le téléchargement sera ignoré
- Le fichier ZIP sera stocké dans le cache de l'application
- Les fichiers extraits seront disponibles pour la lecture hors ligne

## 🐛 Dépannage

Si vous rencontrez une erreur lors de la décompression:

1. Vérifiez que la bibliothèque de décompression est installée
2. Vérifiez que l'ID du fichier ZIP est correctement configuré
3. Vérifiez que le fichier ZIP est accessible publiquement sur Google Drive
4. Vérifiez les logs de l'application pour plus d'informations

