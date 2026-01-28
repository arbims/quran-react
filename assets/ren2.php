<?php

$folder = __DIR__ . '/quran'; // chemin vers ton dossier
$files = scandir($folder);

// Filtrer les fichiers qui commencent par "page_" et finissent par ".jpg"
$pages = array_filter($files, function($file) {
    return preg_match('/^page_\d+\.jpg$/', $file);
});

// Renommer les fichiers en page_001.jpg, page_002.jpg, ...
foreach ($pages as $file) {
    preg_match('/^page_(\d+)\.jpg$/', $file, $matches);
    $num = intval($matches[1]);
    $newName = sprintf('page_%03d.jpg', $num);
    
    if ($file !== $newName) {
        rename("$folder/$file", "$folder/$newName");
        echo "$file → $newName\n";
    }
}

// Générer le code require
sort($pages, SORT_NATURAL); // tri naturel
echo "\n// Code require à copier dans ton app React Native :\n";

foreach ($pages as $file) {
    preg_match('/^page_(\d+)\.jpg$/', $file, $matches);
    $num = intval($matches[1]);
    echo "  $num: require('@/assets/quran/page_" . sprintf('%03d', $num) . ".jpg'),\n";
}

