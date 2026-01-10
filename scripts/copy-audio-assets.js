#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '../assets/mp3');
const targetDir = path.join(__dirname, '../android/app/src/main/assets');

// Créer le dossier de destination s'il n'existe pas
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Copier tous les fichiers .mp3 directement dans assets/ (pas dans un sous-dossier)
// Cela permet d'utiliser asset:///002.mp3 au lieu de asset:///mp3/002.mp3
if (fs.existsSync(sourceDir)) {
  const files = fs.readdirSync(sourceDir).filter(file => file.endsWith('.mp3'));
  
  files.forEach(file => {
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, file);
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`Copied: ${file} -> ${targetPath}`);
  });
  
  console.log(`✅ Copied ${files.length} audio file(s) to Android assets/`);
} else {
  console.log('⚠️  Source directory not found:', sourceDir);
}

