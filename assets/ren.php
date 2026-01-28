<?php

$dir = __DIR__ . '/quran'; // dossier courant, tu peux mettre un autre chemin

var_dump($dir);
// Ouvre le dossier
if ($handle = opendir($dir)) {
    while (false !== ($file = readdir($handle))) {
        // Ignorer les dossiers et les fichiers déjà renommés
        if ($file !== '.' && $file !== '..' && pathinfo($file, PATHINFO_EXTENSION) === 'jpg' && strpos($file, 'page_') !== 0) {
            $oldPath = $dir . DIRECTORY_SEPARATOR . $file;
            $newPath = $dir . DIRECTORY_SEPARATOR . 'page_' . $file;
            if (rename($oldPath, $newPath)) {
                echo "Renommé : $file → page_$file\n";
            } else {
                echo "Erreur pour : $file\n";
            }
        }
    }
    closedir($handle);
}
