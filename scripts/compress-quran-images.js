#!/usr/bin/env node

/**
 * Script pour compresser les images du dossier assets/quran/
 * Réduit la taille des fichiers JPEG pour diminuer la taille du bundle
 */

const fs = require('fs');
const path = require('path');

// Vérifier si sharp est disponible
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.error('❌ Erreur: sharp n\'est pas installé.');
  console.error('📦 Installez-le avec: npm install --save-dev sharp');
  process.exit(1);
}

const QURAN_DIR = path.join(__dirname, '../assets/quran');
const BACKUP_DIR = path.join(__dirname, '../assets/quran-backup');

// Options de compression
const COMPRESSION_OPTIONS = {
  quality: 75,        // Qualité JPEG (0-100, 75 est un bon compromis)
  maxWidth: 1090,     // Largeur maximale (garder la résolution actuelle)
  maxHeight: 1714,    // Hauteur maximale
  progressive: true,  // JPEG progressif (meilleure compression)
  mozjpeg: true       // Utiliser mozjpeg si disponible (meilleure compression)
};

// Statistiques
let stats = {
  total: 0,
  processed: 0,
  skipped: 0,
  errors: 0,
  originalSize: 0,
  compressedSize: 0,
  saved: 0
};

/**
 * Formate la taille en Mo/Ko
 */
function formatSize(bytes) {
  if (bytes >= 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(2) + ' Mo';
  }
  return (bytes / 1024).toFixed(2) + ' Ko';
}

/**
 * Compresse une image
 */
async function compressImage(filePath) {
  const fileName = path.basename(filePath);
  const originalSize = fs.statSync(filePath).size;
  stats.originalSize += originalSize;

  try {
    // Lire l'image
    const image = sharp(filePath);
    const metadata = await image.metadata();

    // Calculer les nouvelles dimensions si nécessaire
    let width = metadata.width;
    let height = metadata.height;

    if (width > COMPRESSION_OPTIONS.maxWidth || height > COMPRESSION_OPTIONS.maxHeight) {
      const ratio = Math.min(
        COMPRESSION_OPTIONS.maxWidth / width,
        COMPRESSION_OPTIONS.maxHeight / height
      );
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    // Compresser l'image
    const compressedBuffer = await image
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({
        quality: COMPRESSION_OPTIONS.quality,
        progressive: COMPRESSION_OPTIONS.progressive,
        mozjpeg: COMPRESSION_OPTIONS.mozjpeg
      })
      .toBuffer();

    const compressedSize = compressedBuffer.length;
    stats.compressedSize += compressedSize;
    const saved = originalSize - compressedSize;
    stats.saved += saved;

    // Écrire le fichier compressé
    fs.writeFileSync(filePath, compressedBuffer);

    const reduction = ((saved / originalSize) * 100).toFixed(1);
    console.log(`✅ ${fileName}: ${formatSize(originalSize)} → ${formatSize(compressedSize)} (${reduction}% réduit)`);

    return { success: true, saved };
  } catch (error) {
    console.error(`❌ Erreur lors de la compression de ${fileName}:`, error.message);
    stats.errors++;
    return { success: false, error: error.message };
  }
}

/**
 * Crée une sauvegarde des images originales
 */
function createBackup() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`📁 Dossier de sauvegarde créé: ${BACKUP_DIR}`);
  }

  const files = fs.readdirSync(QURAN_DIR)
    .filter(file => file.endsWith('.jpg') && file.startsWith('page_'));

  console.log(`\n💾 Création d'une sauvegarde de ${files.length} fichiers...`);
  
  files.forEach(file => {
    const source = path.join(QURAN_DIR, file);
    const dest = path.join(BACKUP_DIR, file);
    if (!fs.existsSync(dest)) {
      fs.copyFileSync(source, dest);
    }
  });

  console.log(`✅ Sauvegarde terminée\n`);
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🖼️  Compression des images du Quran\n');
  console.log(`📂 Dossier: ${QURAN_DIR}`);
  console.log(`⚙️  Options: Qualité ${COMPRESSION_OPTIONS.quality}%, Max ${COMPRESSION_OPTIONS.maxWidth}x${COMPRESSION_OPTIONS.maxHeight}\n`);

  // Vérifier que le dossier existe
  if (!fs.existsSync(QURAN_DIR)) {
    console.error(`❌ Erreur: Le dossier ${QURAN_DIR} n'existe pas.`);
    process.exit(1);
  }

  // Lire tous les fichiers JPG
  const files = fs.readdirSync(QURAN_DIR)
    .filter(file => file.endsWith('.jpg') && file.startsWith('page_'))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)[0]);
      const numB = parseInt(b.match(/\d+/)[0]);
      return numA - numB;
    });

  if (files.length === 0) {
    console.error(`❌ Aucun fichier image trouvé dans ${QURAN_DIR}`);
    process.exit(1);
  }

  stats.total = files.length;
  console.log(`📊 ${files.length} images trouvées\n`);

  // Demander confirmation
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const answer = await new Promise(resolve => {
    rl.question('⚠️  Voulez-vous créer une sauvegarde avant la compression ? (O/n): ', resolve);
  });

  if (answer.toLowerCase() !== 'n' && answer.toLowerCase() !== 'no') {
    createBackup();
  }

  rl.close();

  // Compresser chaque image
  console.log('🔄 Compression en cours...\n');

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(QURAN_DIR, file);
    
    process.stdout.write(`[${i + 1}/${files.length}] `);
    await compressImage(filePath);
    stats.processed++;
  }

  // Afficher les statistiques finales
  console.log('\n' + '='.repeat(60));
  console.log('📊 Statistiques finales:');
  console.log('='.repeat(60));
  console.log(`Total d'images: ${stats.total}`);
  console.log(`Traitées: ${stats.processed}`);
  console.log(`Erreurs: ${stats.errors}`);
  console.log(`\nTaille originale: ${formatSize(stats.originalSize)}`);
  console.log(`Taille compressée: ${formatSize(stats.compressedSize)}`);
  console.log(`Espace économisé: ${formatSize(stats.saved)}`);
  const totalReduction = ((stats.saved / stats.originalSize) * 100).toFixed(1);
  console.log(`Réduction totale: ${totalReduction}%`);
  console.log('='.repeat(60));

  if (stats.errors > 0) {
    console.log(`\n⚠️  ${stats.errors} erreur(s) rencontrée(s) (fichiers ignorés).`);
  }

  if (stats.processed === stats.total) {
    console.log('\n✅ Compression terminée avec succès!');
  } else {
    console.log(`\n⚠️  Compression partielle: ${stats.processed}/${stats.total} images traitées.`);
    console.log('💡 Relancez le script pour traiter les images restantes.');
  }
}

// Exécuter le script
main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
