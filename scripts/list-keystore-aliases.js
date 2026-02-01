#!/usr/bin/env node

/**
 * Script pour lister tous les alias d'un keystore Android
 */

const { spawn } = require('child_process');
const readline = require('readline');
const path = require('path');
const fs = require('fs');

const KEYSTORE_PATH = path.join(__dirname, '../mon-upload-key.keystore');

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
  console.log('📋 Liste des alias dans le keystore\n');
  console.log(`📁 Keystore: ${KEYSTORE_PATH}\n`);

  if (!fs.existsSync(KEYSTORE_PATH)) {
    console.error(`❌ Le fichier keystore n'existe pas: ${KEYSTORE_PATH}`);
    process.exit(1);
  }

  // Essayer d'abord sans mot de passe (certains keystores le permettent)
  console.log('🔍 Tentative de lecture sans mot de passe...\n');
  
  try {
    const output = await new Promise((resolve, reject) => {
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

    console.log('✅ Alias trouvés:');
    console.log(output);
    
    // Essayer d'obtenir les détails pour chaque alias
    const aliasLines = output.split('\n').filter(line => 
      line.trim() && !line.includes('Keystore') && !line.includes('type')
    );
    
    if (aliasLines.length > 0) {
      console.log('\n🔍 Détails des alias:');
      for (const line of aliasLines) {
        const aliasMatch = line.match(/(\S+),/);
        if (aliasMatch) {
          const alias = aliasMatch[1];
          console.log(`\n📌 Alias: ${alias}`);
        }
      }
    }

  } catch (error) {
    console.log('⚠️  Le keystore nécessite un mot de passe.\n');
    
    const password = await question('Entrez le mot de passe du keystore: ');
    
    if (!password || password.trim().length === 0) {
      console.error('❌ Mot de passe vide. Abandon.');
      process.exit(1);
    }

    try {
      const output = await new Promise((resolve, reject) => {
        const child = spawn('keytool', [
          '-list',
          '-keystore', KEYSTORE_PATH,
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
            reject(new Error(stderr || `keytool exited with code ${code}`));
          }
        });
      });

      console.log('\n✅ Alias trouvés:');
      console.log(output);

    } catch (error2) {
      console.error('\n❌ Erreur lors de la lecture du keystore:');
      if (error2.message.toLowerCase().includes('password')) {
        console.error('   ⚠️  Mot de passe incorrect.');
      } else {
        console.error(`   ${error2.message}`);
      }
      process.exit(1);
    }
  }
}

main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
