#!/usr/bin/env node

/**
 * Script pour vérifier l'empreinte SHA1 d'un keystore Android
 */

const { execSync, spawn } = require('child_process');
const readline = require('readline');
const path = require('path');

const EXPECTED_SHA1 = 'A7:08:A6:D2:33:71:9F:27:56:B4:D1:C4:F7:43:31:E2:38:8B:07:DB';
const KEYSTORE_PATH = path.join(__dirname, '../mon-upload-key.keystore');
const KEY_ALIAS = 'mon-key-alias';

function question(query) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  console.log('🔐 Vérification de l\'empreinte SHA1 du keystore\n');
  console.log(`📁 Keystore: ${KEYSTORE_PATH}`);
  console.log(`🔑 Alias: ${KEY_ALIAS}`);
  console.log(`✅ SHA1 attendu par Google Play: ${EXPECTED_SHA1}\n`);

  // Vérifier d'abord si le keystore existe
  const fs = require('fs');
  if (!fs.existsSync(KEYSTORE_PATH)) {
    console.error(`❌ Le fichier keystore n'existe pas: ${KEYSTORE_PATH}`);
    process.exit(1);
  }

  // Lister les alias disponibles pour aider au débogage
  console.log('🔍 Vérification des alias disponibles dans le keystore...');
  try {
    const listOutput = await new Promise((resolve, reject) => {
      const child = spawn('keytool', [
        '-list',
        '-keystore', KEYSTORE_PATH
      ], {
        encoding: 'utf-8'
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(stderr || `keytool exited with code ${code}`));
        }
      });
    });
    
    const aliasMatch = listOutput.match(/mon-key-alias/i);
    if (!aliasMatch) {
      console.log('⚠️  L\'alias "mon-key-alias" n\'a pas été trouvé dans le keystore.');
      console.log('📋 Alias disponibles:');
      console.log(listOutput);
      console.log('\n💡 Vous devrez peut-être utiliser un autre alias.');
    }
  } catch (error) {
    console.log('⚠️  Impossible de lister les alias (le keystore nécessite peut-être un mot de passe).\n');
  }

  // Demander le mot de passe
  const password = await question('Entrez le mot de passe du keystore: ');
  
  if (!password || password.trim().length === 0) {
    console.error('❌ Mot de passe vide. Abandon.');
    process.exit(1);
  }

  try {
    // Exécuter keytool pour obtenir l'empreinte SHA1
    // Utiliser spawn pour éviter les problèmes d'échappement du mot de passe
    const output = await new Promise((resolve, reject) => {
      const child = spawn('keytool', [
        '-list',
        '-v',
        '-keystore', KEYSTORE_PATH,
        '-alias', KEY_ALIAS,
        '-storepass', password
      ], {
        encoding: 'utf-8'
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          // Afficher plus de détails sur l'erreur
          const errorMsg = stderr || stdout || `keytool exited with code ${code}`;
          reject(new Error(errorMsg));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });

    // Extraire l'empreinte SHA1
    const sha1Match = output.match(/SHA1:\s*([A-F0-9:]+)/i);
    
    if (!sha1Match) {
      console.error('❌ Impossible de trouver l\'empreinte SHA1 dans la sortie.');
      console.log('Sortie complète:', output);
      process.exit(1);
    }

    const actualSHA1 = sha1Match[1].toUpperCase();
    console.log(`\n📊 SHA1 du keystore: ${actualSHA1}\n`);

    // Comparer
    if (actualSHA1 === EXPECTED_SHA1) {
      console.log('✅ CORRESPONDANCE ! Votre keystore correspond à celui attendu par Google Play.');
      console.log('\n💡 Prochaines étapes:');
      console.log('   1. Configurez EAS pour utiliser ce keystore:');
      console.log('      eas credentials');
      console.log('   2. Sélectionnez "Android" puis "Set up a new Android Keystore"');
      console.log('   3. Choisissez "I want to upload my own keystore"');
      console.log('   4. Fournissez le chemin vers mon-upload-key.keystore');
    } else {
      console.log('❌ NON CORRESPONDANCE ! Votre keystore ne correspond PAS à celui attendu.');
      console.log('\n⚠️  ATTENTION:');
      console.log('   - Si c\'est la première publication, vous pouvez créer une nouvelle clé');
      console.log('   - Si c\'est une mise à jour, vous DEVEZ utiliser la même clé que la première publication');
      console.log('\n💡 Options:');
      console.log('   1. Vérifiez dans Google Play Console quelle clé a été utilisée');
      console.log('   2. Utilisez cette clé pour tous les builds futurs');
      console.log('   3. Si vous avez perdu la clé, contactez le support Google Play');
    }

    // Afficher aussi les autres empreintes pour référence
    const md5Match = output.match(/MD5:\s*([A-F0-9:]+)/i);
    const sha256Match = output.match(/SHA256:\s*([A-F0-9:]+)/i);
    
    if (md5Match) {
      console.log(`\n📋 MD5: ${md5Match[1].toUpperCase()}`);
    }
    if (sha256Match) {
      console.log(`📋 SHA256: ${sha256Match[1].toUpperCase()}`);
    }

  } catch (error) {
    console.error('\n❌ Erreur lors de la vérification du keystore:');
    const errorMsg = error.message.toLowerCase();
    
    if (errorMsg.includes('password') || errorMsg.includes('incorrect')) {
      console.error('   ⚠️  Mot de passe incorrect.');
      console.error('\n💡 Vérifiez que vous utilisez le bon mot de passe.');
    } else if (errorMsg.includes('alias')) {
      console.error('   ⚠️  Alias incorrect.');
      console.error(`   L'alias utilisé est: ${KEY_ALIAS}`);
      console.error('\n💡 Vérifiez l\'alias dans votre keystore avec:');
      console.error(`   keytool -list -keystore "${KEYSTORE_PATH}"`);
    } else if (errorMsg.includes('keystore')) {
      console.error('   ⚠️  Problème avec le keystore.');
      console.error(`   Chemin: ${KEYSTORE_PATH}`);
      console.error('\n💡 Vérifiez que le fichier existe et n\'est pas corrompu.');
    } else {
      console.error(`   ${error.message}`);
    }
    
    console.error('\n📋 Pour déboguer, essayez manuellement:');
    console.error(`   keytool -list -v -keystore "${KEYSTORE_PATH}" -alias "${KEY_ALIAS}"`);
    
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
