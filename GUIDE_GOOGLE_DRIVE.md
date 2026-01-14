# Guide: Obtenir les IDs Google Drive pour vos fichiers audio

Votre dossier Google Drive public est disponible ici:
https://drive.google.com/drive/folders/11LMFDL2aaecrRTFtAPGpmGiCUKBHQV8u

## Méthode rapide (Recommandée)

1. **Ouvrez votre dossier Google Drive** dans votre navigateur:
   ```
   https://drive.google.com/drive/folders/11LMFDL2aaecrRTFtAPGpmGiCUKBHQV8u
   ```

2. **Pour chaque fichier audio** (002.mp3, 458.mp3, 459.mp3, etc.):
   - **Cliquez sur le fichier** pour l'ouvrir
   - Regardez l'URL dans votre navigateur
   - L'URL ressemble à: `https://drive.google.com/file/d/FILE_ID/view?usp=sharing`
   - **L'ID est la partie entre `/d/` et `/view`**
   
   Exemple pour `002.mp3`:
   - URL: `https://drive.google.com/file/d/1ABC123XYZ789/view`
   - ID: `1ABC123XYZ789`

3. **Ajoutez l'ID dans le fichier** `lib/quran-reader/utils/googleDriveMapping.ts`:
   ```typescript
   export const GOOGLE_DRIVE_FILE_ID_MAP: Record<number, string> = {
     2: '1ABC123XYZ789',    // ID pour 002.mp3
     458: '2DEF456UVW012',  // ID pour 458.mp3
     459: '3GHI789RST345',  // ID pour 459.mp3
     // etc.
   };
   ```

## Liste des fichiers dans votre dossier

D'après votre dossier, voici les fichiers à mapper:
- 002.mp3
- 458.mp3
- 459.mp3
- 460.mp3
- 461.mp3
- 462.mp3
- 463.mp3
- 464.mp3
- 465.mp3
- 466.mp3

## Méthode alternative (Clic droit)

1. Dans votre dossier Google Drive, **clic droit sur un fichier**
2. Sélectionnez **"Obtenir le lien de partage"** ou **"Partager"**
3. Vérifiez que **"Toute personne disposant du lien peut voir"** est activé
4. **Copiez le lien** qui ressemble à:
   ```
   https://drive.google.com/file/d/FILE_ID/view?usp=sharing
   ```
5. **Extrayez l'ID** (la partie entre `/d/` et `/view`)

## Vérification

Une fois que vous avez ajouté les IDs dans `googleDriveMapping.ts`, testez l'application:
1. Lancez l'application
2. Cliquez sur "تشغيل الصوت" (Play Audio)
3. Si un ID est manquant, vous verrez un message d'erreur dans la console
4. L'application téléchargera automatiquement le fichier depuis Google Drive

## Format final attendu

Voici un exemple du format final dans `googleDriveMapping.ts`:

```typescript
export const GOOGLE_DRIVE_FILE_ID_MAP: Record<number, string> = {
  2: 'REMPLACEZ_PAR_L_ID_DE_002',     // Pour 002.mp3
  458: 'REMPLACEZ_PAR_L_ID_DE_458',   // Pour 458.mp3
  459: 'REMPLACEZ_PAR_L_ID_DE_459',   // Pour 459.mp3
  460: 'REMPLACEZ_PAR_L_ID_DE_460',   // Pour 460.mp3
  461: 'REMPLACEZ_PAR_L_ID_DE_461',   // Pour 461.mp3
  462: 'REMPLACEZ_PAR_L_ID_DE_462',   // Pour 462.mp3
  463: 'REMPLACEZ_PAR_L_ID_DE_463',   // Pour 463.mp3
  464: 'REMPLACEZ_PAR_L_ID_DE_464',   // Pour 464.mp3
  465: 'REMPLACEZ_PAR_L_ID_DE_465',   // Pour 465.mp3
  466: 'REMPLACEZ_PAR_L_ID_DE_466',   // Pour 466.mp3
};
```

## Note importante

- Les fichiers **DOIVENT** être accessibles publiquement
- Si un fichier n'est pas partagé publiquement, vous verrez une erreur 403 (Forbidden)
- Le dossier entier doit être public OU chaque fichier individuellement

