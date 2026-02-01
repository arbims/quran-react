# Configuration de la clé de signature Android

## Problème
Google Play attend une clé avec l'empreinte SHA1: `A7:08:A6:D2:33:71:9F:27:56:B4:D1:C4:F7:43:31:E2:38:8B:07:DB`
Mais le build utilise une clé avec l'empreinte: `82:7B:FD:E2:4C:58:2B:48:EC:8B:FF:BD:EB:8D:9C:75:AB:9C:D5:27`

## Solution : Configurer EAS Build pour utiliser la bonne clé

### Option 1 : Utiliser EAS Credentials Manager (Recommandé)

1. **Vérifier les credentials existants** :
   ```bash
   eas credentials
   ```

2. **Si vous avez déjà une clé dans Google Play Console** :
   - Allez dans Google Play Console → Configuration de l'application → Signature de l'application
   - Notez l'empreinte SHA1 attendue : `A7:08:A6:D2:33:71:9F:27:56:B4:D1:C4:F7:43:31:E2:38:8B:07:DB`
   - Si vous avez déjà uploadé une clé, vous devez utiliser cette clé pour tous les builds futurs

3. **Configurer EAS pour utiliser votre keystore existant** :
   ```bash
   eas credentials
   ```
   - Sélectionnez "Android"
   - Sélectionnez "Set up a new Android Keystore"
   - Choisissez "I want to upload my own keystore"
   - Fournissez le chemin vers `mon-upload-key.keystore`
   - Entrez l'alias : `mon-key-alias`
   - Entrez le mot de passe du keystore

### Option 2 : Vérifier l'empreinte de votre keystore

Pour vérifier si votre keystore correspond à l'empreinte attendue :

```bash
keytool -list -v -keystore mon-upload-key.keystore -alias mon-key-alias
```

Cherchez la ligne "SHA1:" et comparez avec l'empreinte attendue.

### Option 3 : Si vous n'avez pas la bonne clé

Si vous n'avez pas accès à la clé avec l'empreinte `A7:08:A6:D2:33:71:9F:27:56:B4:D1:C4:F7:43:31:E2:38:8B:07:DB` :

1. **Première publication** : Vous pouvez demander à Google Play de réinitialiser la clé (si c'est la première version)
2. **Mise à jour** : Vous DEVEZ utiliser la même clé que celle utilisée pour la première publication

### Configuration dans eas.json

Si vous voulez spécifier manuellement le keystore dans `eas.json` (non recommandé pour la sécurité) :

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "app-bundle",
        "credentials": {
          "keystore": {
            "keystorePath": "./mon-upload-key.keystore",
            "keystorePassword": "VOTRE_MOT_DE_PASSE",
            "keyAlias": "mon-key-alias",
            "keyPassword": "VOTRE_MOT_DE_PASSE"
          }
        }
      }
    }
  }
}
```

⚠️ **ATTENTION** : Ne commitez JAMAIS le mot de passe dans le repo git !

## Étapes recommandées

1. **Vérifier l'empreinte de votre keystore** :
   ```bash
   keytool -list -v -keystore mon-upload-key.keystore -alias mon-key-alias
   ```

2. **Si l'empreinte correspond** (`A7:08:A6:D2:33:71:9F:27:56:B4:D1:C4:F7:43:31:E2:38:8B:07:DB`) :
   ```bash
   eas credentials
   ```
   Configurez EAS pour utiliser ce keystore.

3. **Si l'empreinte ne correspond pas** :
   - Vérifiez dans Google Play Console quelle clé a été utilisée pour la première publication
   - Utilisez cette clé pour tous les builds futurs
   - Si c'est la première publication, vous pouvez créer une nouvelle clé

4. **Relancer le build** :
   ```bash
   eas build -p android --profile production
   ```

## Vérification après le build

Après le build, vous pouvez vérifier l'empreinte du fichier AAB signé :

```bash
jarsigner -verify -verbose -certs votre-app.aab | grep "SHA1"
```

Ou avec `apksigner` (si disponible) :
```bash
apksigner verify --print-certs votre-app.aab
```
