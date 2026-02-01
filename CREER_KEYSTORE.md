# Créer un nouveau keystore Android

## Prérequis

- **JDK** installé (pour la commande `keytool`). Vérifiez avec :
  ```bash
  keytool -version
  ```

## 1. Générer le keystore avec keytool

Exécutez cette commande (adaptez les valeurs si besoin) :

```bash
keytool -genkeypair -v -storetype PKCS12 \
  -keystore android-release-key.keystore \
  -alias qaloun-release \
  -keyalg RSA -keysize 2048 -validity 10000
```

**Valeurs à préparer :**
- **Mot de passe du keystore** : choisissez un mot de passe fort, notez-le dans un endroit sûr.
- **Mot de passe de la clé** : vous pouvez utiliser le même que le keystore (keytool le proposera).
- **Nom, Unité d’organisation, etc.** : renseignez les champs demandés (ex. nom du projet, ville, pays).

**Conseils :**
- Ne mettez **jamais** le fichier `.keystore` ni les mots de passe dans Git.
- Ajoutez `*.keystore` dans votre `.gitignore` si ce n’est pas déjà fait.
- Gardez une copie du keystore et des mots de passe en lieu sûr ; sans eux vous ne pourrez plus signer les mises à jour sur Google Play.

## 2. Vérifier l’empreinte SHA1

Pour vérifier que le keystore est bien créé et voir son empreinte SHA1 :

```bash
keytool -list -v -keystore android-release-key.keystore -alias qaloun-release
```

Notez l’empreinte **SHA1** ; c’est celle que Google Play Console affiche pour la signature de l’app.

## 3. Utiliser le keystore avec EAS Build

1. **Uploader le keystore dans EAS** (recommandé) :
   ```bash
   eas credentials
   ```
   - Choisissez **Android** → **production** (ou le profil qui vous intéresse).
   - **Set up a new Android Keystore** → **I want to upload my own keystore**.
   - Indiquez le chemin vers `android-release-key.keystore`, l’alias (`qaloun-release`) et les mots de passe.

2. **Ou** le configurer manuellement dans `eas.json` (moins recommandé pour la sécurité) :
   - Voir `CONFIGURATION_CLE_SIGNATURE.md` pour un exemple.
   - Ne jamais committer les mots de passe dans le dépôt.

## 4. Premier déploiement sur Google Play

- Si l’app n’a **jamais** été publiée : vous pouvez utiliser ce nouveau keystore sans problème.
- Si l’app a **déjà** été publiée : Google Play attend la **même** clé que celle du premier upload. Dans ce cas, il ne faut pas créer un nouveau keystore pour la même app ; utilisez celui qui a servi au premier build (voir `CONFIGURATION_CLE_SIGNATURE.md`).

## Récapitulatif des fichiers

| Fichier / Élément      | À faire |
|------------------------|--------|
| `android-release-key.keystore` | Le créer avec `keytool`, ne pas le committer |
| `.gitignore`           | Inclure `*.keystore` |
| Mots de passe          | Les stocker en lieu sûr (gestionnaire de mots de passe, coffre-fort d’équipe) |
