import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/* =======================
   DONNÉES DES IMAGES
======================= */

// Define the starting page for each Surah
const surahStartPages: { [key: number]: number } = {
  1: 1,   // Al-Fatiha (page 1, mais aussi page 2)
  2: 2,   // Al-Baqarah
  3: 50,  // Al-Imran
  4: 77,  // An-Nisa
  5: 106, // Al-Ma'idah
  6: 128, // Al-An'am
  7: 151, // Al-A'raf
  8: 177, // Al-Anfal
  9: 187, // At-Tawbah
  10: 208, // Yunus
  11: 221, // Hud
  12: 235, // Yusuf
  13: 249, // Ar-Ra'd
  14: 255, // Ibrahim
  15: 262, // Al-Hijr
  16: 267, // An-Nahl
  17: 282, // Al-Isra
  18: 293, // Al-Kahf
  19: 305, // Maryam
  20: 312, // Ta-Ha
  21: 322, // Al-Anbiya
  22: 332, // Al-Hajj
  23: 342, // Al-Mu'minun
  24: 350, // An-Nur
  25: 359, // Al-Furqan
  26: 367, // Ash-Shu'ara
  27: 377, // An-Naml
  28: 385, // Al-Qasas
  29: 396, // Al-Ankabut
  30: 404, // Ar-Rum
  31: 411, // Luqman
  32: 415, // As-Sajdah
  33: 418, // Al-Ahzab
  34: 428, // Saba
  35: 434, // Fatir
  36: 440, // Ya-Sin
  37: 446, // As-Saffat
  38: 453, // Sad
  39: 458, // Az-Zumar
  40: 467, // Ghafir
  41: 477, // Fussilat
  42: 483, // Ash-Shura
  43: 489, // Az-Zukhruf
  44: 496, // Ad-Dukhan
  45: 499, // Al-Jathiyah
  46: 502, // Al-Ahqaf
  47: 507, // Muhammad
  48: 511, // Al-Fath
  49: 515, // Al-Hujurat
  50: 518, // Qaf
  51: 520, // Adh-Dhariyat
  52: 523, // At-Tur
  53: 526, // An-Najm
  54: 528, // Al-Qamar
  55: 531, // Ar-Rahman
  56: 534, // Al-Waqi'ah
  57: 537, // Al-Hadid
  58: 542, // Al-Mujadila
  59: 545, // Al-Hashr
  60: 549, // Al-Mumtahina
  61: 551, // As-Saff
  62: 553, // Al-Jumu'ah
  63: 554, // Al-Munafiqun
  64: 556, // At-Taghabun
  65: 558, // At-Talaq
  66: 560, // At-Tahrim
  67: 562, // Al-Mulk
  68: 564, // Al-Qalam
  69: 566, // Al-Haqqah
  70: 568, // Al-Ma'arij
  71: 570, // Nuh
  72: 572, // Al-Jinn
  73: 574, // Al-Muzzammil
  74: 575, // Al-Muddaththir
  75: 577, // Al-Qiyamah
  76: 578, // Al-Insan
  77: 580, // Al-Mursalat
  78: 582, // An-Naba
  79: 583, // An-Nazi'at
  80: 585, // 'Abasa
  81: 586, // At-Takwir
  82: 587, // Al-Infitar
  83: 587, // Al-Mutaffifin
  84: 589, // Al-Inshiqaq
  85: 590, // Al-Buruj
  86: 591, // At-Tariq
  87: 591, // Al-A'la
  88: 592, // Al-Ghashiyah
  89: 593, // Al-Fajr
  90: 594, // Al-Balad
  91: 595, // Ash-Shams
  92: 595, // Al-Layl
  93: 596, // Ad-Duha
  94: 596, // Ash-Sharh
  95: 597, // At-Tin
  96: 597, // Al-'Alaq
  97: 598, // Al-Qadr
  98: 598, // Al-Bayyinah
  99: 599, // Az-Zalzalah
  100: 599, // Al-'Adiyat
  101: 600, // Al-Qari'ah
  102: 600, // At-Takathur
  103: 601, // Al-'Asr
  104: 601, // Al-Humazah
  105: 601, // Al-Fil
  106: 602, // Quraysh
  107: 602, // Al-Ma'un
  108: 602, // Al-Kawthar
  109: 603, // Al-Kafirun
  110: 603, // An-Nasr
  111: 603, // Al-Masad
  112: 604, // Al-Ikhlas
  113: 604, // Al-Falaq
  114: 604, // An-Nas
};

// Static mapping of page images (pages 2 to 604)
const pageImageSources: { [key: number]: any } = {
  2: require('@/assets/quran/page_002.png'),
  3: require('@/assets/quran/page_003.png'),
  4: require('@/assets/quran/page_004.png'),
  5: require('@/assets/quran/page_005.png'),
  6: require('@/assets/quran/page_006.png'),
  7: require('@/assets/quran/page_007.png'),
  8: require('@/assets/quran/page_008.png'),
  9: require('@/assets/quran/page_009.png'),
  10: require('@/assets/quran/page_010.png'),
  11: require('@/assets/quran/page_011.png'),
  12: require('@/assets/quran/page_012.png'),
  13: require('@/assets/quran/page_013.png'),
  14: require('@/assets/quran/page_014.png'),
  15: require('@/assets/quran/page_015.png'),
  16: require('@/assets/quran/page_016.png'),
  17: require('@/assets/quran/page_017.png'),
  18: require('@/assets/quran/page_018.png'),
  19: require('@/assets/quran/page_019.png'),
  20: require('@/assets/quran/page_020.png'),
  21: require('@/assets/quran/page_021.png'),
  22: require('@/assets/quran/page_022.png'),
  23: require('@/assets/quran/page_023.png'),
  24: require('@/assets/quran/page_024.png'),
  25: require('@/assets/quran/page_025.png'),
  26: require('@/assets/quran/page_026.png'),
  27: require('@/assets/quran/page_027.png'),
  28: require('@/assets/quran/page_028.png'),
  29: require('@/assets/quran/page_029.png'),
  30: require('@/assets/quran/page_030.png'),
  31: require('@/assets/quran/page_031.png'),
  32: require('@/assets/quran/page_032.png'),
  33: require('@/assets/quran/page_033.png'),
  34: require('@/assets/quran/page_034.png'),
  35: require('@/assets/quran/page_035.png'),
  36: require('@/assets/quran/page_036.png'),
  37: require('@/assets/quran/page_037.png'),
  38: require('@/assets/quran/page_038.png'),
  39: require('@/assets/quran/page_039.png'),
  40: require('@/assets/quran/page_040.png'),
  41: require('@/assets/quran/page_041.png'),
  42: require('@/assets/quran/page_042.png'),
  43: require('@/assets/quran/page_043.png'),
  44: require('@/assets/quran/page_044.png'),
  45: require('@/assets/quran/page_045.png'),
  46: require('@/assets/quran/page_046.png'),
  47: require('@/assets/quran/page_047.png'),
  48: require('@/assets/quran/page_048.png'),
  49: require('@/assets/quran/page_049.png'),
  50: require('@/assets/quran/page_050.png'),
  51: require('@/assets/quran/page_051.png'),
  52: require('@/assets/quran/page_052.png'),
  53: require('@/assets/quran/page_053.png'),
  54: require('@/assets/quran/page_054.png'),
  55: require('@/assets/quran/page_055.png'),
  56: require('@/assets/quran/page_056.png'),
  57: require('@/assets/quran/page_057.png'),
  58: require('@/assets/quran/page_058.png'),
  59: require('@/assets/quran/page_059.png'),
  60: require('@/assets/quran/page_060.png'),
  61: require('@/assets/quran/page_061.png'),
  62: require('@/assets/quran/page_062.png'),
  63: require('@/assets/quran/page_063.png'),
  64: require('@/assets/quran/page_064.png'),
  65: require('@/assets/quran/page_065.png'),
  66: require('@/assets/quran/page_066.png'),
  67: require('@/assets/quran/page_067.png'),
  68: require('@/assets/quran/page_068.png'),
  69: require('@/assets/quran/page_069.png'),
  70: require('@/assets/quran/page_070.png'),
  71: require('@/assets/quran/page_071.png'),
  72: require('@/assets/quran/page_072.png'),
  73: require('@/assets/quran/page_073.png'),
  74: require('@/assets/quran/page_074.png'),
  75: require('@/assets/quran/page_075.png'),
  76: require('@/assets/quran/page_076.png'),
  77: require('@/assets/quran/page_077.png'),
  78: require('@/assets/quran/page_078.png'),
  79: require('@/assets/quran/page_079.png'),
  80: require('@/assets/quran/page_080.png'),
  81: require('@/assets/quran/page_081.png'),
  82: require('@/assets/quran/page_082.png'),
  83: require('@/assets/quran/page_083.png'),
  84: require('@/assets/quran/page_084.png'),
  85: require('@/assets/quran/page_085.png'),
  86: require('@/assets/quran/page_086.png'),
  87: require('@/assets/quran/page_087.png'),
  88: require('@/assets/quran/page_088.png'),
  89: require('@/assets/quran/page_089.png'),
  90: require('@/assets/quran/page_090.png'),
  91: require('@/assets/quran/page_091.png'),
  92: require('@/assets/quran/page_092.png'),
  93: require('@/assets/quran/page_093.png'),
  94: require('@/assets/quran/page_094.png'),
  95: require('@/assets/quran/page_095.png'),
  96: require('@/assets/quran/page_096.png'),
  97: require('@/assets/quran/page_097.png'),
  98: require('@/assets/quran/page_098.png'),
  99: require('@/assets/quran/page_099.png'),
  100: require('@/assets/quran/page_100.png'),
  101: require('@/assets/quran/page_101.png'),
  102: require('@/assets/quran/page_102.png'),
  103: require('@/assets/quran/page_103.png'),
  104: require('@/assets/quran/page_104.png'),
  105: require('@/assets/quran/page_105.png'),
  106: require('@/assets/quran/page_106.png'),
  107: require('@/assets/quran/page_107.png'),
  108: require('@/assets/quran/page_108.png'),
  109: require('@/assets/quran/page_109.png'),
  110: require('@/assets/quran/page_110.png'),
  111: require('@/assets/quran/page_111.png'),
  112: require('@/assets/quran/page_112.png'),
  113: require('@/assets/quran/page_113.png'),
  114: require('@/assets/quran/page_114.png'),
  115: require('@/assets/quran/page_115.png'),
  116: require('@/assets/quran/page_116.png'),
  117: require('@/assets/quran/page_117.png'),
  118: require('@/assets/quran/page_118.png'),
  119: require('@/assets/quran/page_119.png'),
  120: require('@/assets/quran/page_120.png'),
  121: require('@/assets/quran/page_121.png'),
  122: require('@/assets/quran/page_122.png'),
  123: require('@/assets/quran/page_123.png'),
  124: require('@/assets/quran/page_124.png'),
  125: require('@/assets/quran/page_125.png'),
  126: require('@/assets/quran/page_126.png'),
  127: require('@/assets/quran/page_127.png'),
  128: require('@/assets/quran/page_128.png'),
  129: require('@/assets/quran/page_129.png'),
  130: require('@/assets/quran/page_130.png'),
  131: require('@/assets/quran/page_131.png'),
  132: require('@/assets/quran/page_132.png'),
  133: require('@/assets/quran/page_133.png'),
  134: require('@/assets/quran/page_134.png'),
  135: require('@/assets/quran/page_135.png'),
  136: require('@/assets/quran/page_136.png'),
  137: require('@/assets/quran/page_137.png'),
  138: require('@/assets/quran/page_138.png'),
  139: require('@/assets/quran/page_139.png'),
  140: require('@/assets/quran/page_140.png'),
  141: require('@/assets/quran/page_141.png'),
  142: require('@/assets/quran/page_142.png'),
  143: require('@/assets/quran/page_143.png'),
  144: require('@/assets/quran/page_144.png'),
  145: require('@/assets/quran/page_145.png'),
  146: require('@/assets/quran/page_146.png'),
  147: require('@/assets/quran/page_147.png'),
  148: require('@/assets/quran/page_148.png'),
  149: require('@/assets/quran/page_149.png'),
  150: require('@/assets/quran/page_150.png'),
  151: require('@/assets/quran/page_151.png'),
  152: require('@/assets/quran/page_152.png'),
  153: require('@/assets/quran/page_153.png'),
  154: require('@/assets/quran/page_154.png'),
  155: require('@/assets/quran/page_155.png'),
  156: require('@/assets/quran/page_156.png'),
  157: require('@/assets/quran/page_157.png'),
  158: require('@/assets/quran/page_158.png'),
  159: require('@/assets/quran/page_159.png'),
  160: require('@/assets/quran/page_160.png'),
  161: require('@/assets/quran/page_161.png'),
  162: require('@/assets/quran/page_162.png'),
  163: require('@/assets/quran/page_163.png'),
  164: require('@/assets/quran/page_164.png'),
  165: require('@/assets/quran/page_165.png'),
  166: require('@/assets/quran/page_166.png'),
  167: require('@/assets/quran/page_167.png'),
  168: require('@/assets/quran/page_168.png'),
  169: require('@/assets/quran/page_169.png'),
  170: require('@/assets/quran/page_170.png'),
  171: require('@/assets/quran/page_171.png'),
  172: require('@/assets/quran/page_172.png'),
  173: require('@/assets/quran/page_173.png'),
  174: require('@/assets/quran/page_174.png'),
  175: require('@/assets/quran/page_175.png'),
  176: require('@/assets/quran/page_176.png'),
  177: require('@/assets/quran/page_177.png'),
  178: require('@/assets/quran/page_178.png'),
  179: require('@/assets/quran/page_179.png'),
  180: require('@/assets/quran/page_180.png'),
  181: require('@/assets/quran/page_181.png'),
  182: require('@/assets/quran/page_182.png'),
  183: require('@/assets/quran/page_183.png'),
  184: require('@/assets/quran/page_184.png'),
  185: require('@/assets/quran/page_185.png'),
  186: require('@/assets/quran/page_186.png'),
  187: require('@/assets/quran/page_187.png'),
  188: require('@/assets/quran/page_188.png'),
  189: require('@/assets/quran/page_189.png'),
  190: require('@/assets/quran/page_190.png'),
  191: require('@/assets/quran/page_191.png'),
  192: require('@/assets/quran/page_192.png'),
  193: require('@/assets/quran/page_193.png'),
  194: require('@/assets/quran/page_194.png'),
  195: require('@/assets/quran/page_195.png'),
  196: require('@/assets/quran/page_196.png'),
  197: require('@/assets/quran/page_197.png'),
  198: require('@/assets/quran/page_198.png'),
  199: require('@/assets/quran/page_199.png'),
  200: require('@/assets/quran/page_200.png'),
  201: require('@/assets/quran/page_201.png'),
  202: require('@/assets/quran/page_202.png'),
  203: require('@/assets/quran/page_203.png'),
  204: require('@/assets/quran/page_204.png'),
  205: require('@/assets/quran/page_205.png'),
  206: require('@/assets/quran/page_206.png'),
  207: require('@/assets/quran/page_207.png'),
  208: require('@/assets/quran/page_208.png'),
  209: require('@/assets/quran/page_209.png'),
  210: require('@/assets/quran/page_210.png'),
  211: require('@/assets/quran/page_211.png'),
  212: require('@/assets/quran/page_212.png'),
  213: require('@/assets/quran/page_213.png'),
  214: require('@/assets/quran/page_214.png'),
  215: require('@/assets/quran/page_215.png'),
  216: require('@/assets/quran/page_216.png'),
  217: require('@/assets/quran/page_217.png'),
  218: require('@/assets/quran/page_218.png'),
  219: require('@/assets/quran/page_219.png'),
  220: require('@/assets/quran/page_220.png'),
  221: require('@/assets/quran/page_221.png'),
  222: require('@/assets/quran/page_222.png'),
  223: require('@/assets/quran/page_223.png'),
  224: require('@/assets/quran/page_224.png'),
  225: require('@/assets/quran/page_225.png'),
  226: require('@/assets/quran/page_226.png'),
  227: require('@/assets/quran/page_227.png'),
  228: require('@/assets/quran/page_228.png'),
  229: require('@/assets/quran/page_229.png'),
  230: require('@/assets/quran/page_230.png'),
  231: require('@/assets/quran/page_231.png'),
  232: require('@/assets/quran/page_232.png'),
  233: require('@/assets/quran/page_233.png'),
  234: require('@/assets/quran/page_234.png'),
  235: require('@/assets/quran/page_235.png'),
  236: require('@/assets/quran/page_236.png'),
  237: require('@/assets/quran/page_237.png'),
  238: require('@/assets/quran/page_238.png'),
  239: require('@/assets/quran/page_239.png'),
  240: require('@/assets/quran/page_240.png'),
  241: require('@/assets/quran/page_241.png'),
  242: require('@/assets/quran/page_242.png'),
  243: require('@/assets/quran/page_243.png'),
  244: require('@/assets/quran/page_244.png'),
  245: require('@/assets/quran/page_245.png'),
  246: require('@/assets/quran/page_246.png'),
  247: require('@/assets/quran/page_247.png'),
  248: require('@/assets/quran/page_248.png'),
  249: require('@/assets/quran/page_249.png'),
  250: require('@/assets/quran/page_250.png'),
  251: require('@/assets/quran/page_251.png'),
  252: require('@/assets/quran/page_252.png'),
  253: require('@/assets/quran/page_253.png'),
  254: require('@/assets/quran/page_254.png'),
  255: require('@/assets/quran/page_255.png'),
  256: require('@/assets/quran/page_256.png'),
  257: require('@/assets/quran/page_257.png'),
  258: require('@/assets/quran/page_258.png'),
  259: require('@/assets/quran/page_259.png'),
  260: require('@/assets/quran/page_260.png'),
  261: require('@/assets/quran/page_261.png'),
  262: require('@/assets/quran/page_262.png'),
  263: require('@/assets/quran/page_263.png'),
  264: require('@/assets/quran/page_264.png'),
  265: require('@/assets/quran/page_265.png'),
  266: require('@/assets/quran/page_266.png'),
  267: require('@/assets/quran/page_267.png'),
  268: require('@/assets/quran/page_268.png'),
  269: require('@/assets/quran/page_269.png'),
  270: require('@/assets/quran/page_270.png'),
  271: require('@/assets/quran/page_271.png'),
  272: require('@/assets/quran/page_272.png'),
  273: require('@/assets/quran/page_273.png'),
  274: require('@/assets/quran/page_274.png'),
  275: require('@/assets/quran/page_275.png'),
  276: require('@/assets/quran/page_276.png'),
  277: require('@/assets/quran/page_277.png'),
  278: require('@/assets/quran/page_278.png'),
  279: require('@/assets/quran/page_279.png'),
  280: require('@/assets/quran/page_280.png'),
  281: require('@/assets/quran/page_281.png'),
  282: require('@/assets/quran/page_282.png'),
  283: require('@/assets/quran/page_283.png'),
  284: require('@/assets/quran/page_284.png'),
  285: require('@/assets/quran/page_285.png'),
  286: require('@/assets/quran/page_286.png'),
  287: require('@/assets/quran/page_287.png'),
  288: require('@/assets/quran/page_288.png'),
  289: require('@/assets/quran/page_289.png'),
  290: require('@/assets/quran/page_290.png'),
  291: require('@/assets/quran/page_291.png'),
  292: require('@/assets/quran/page_292.png'),
  293: require('@/assets/quran/page_293.png'),
  294: require('@/assets/quran/page_294.png'),
  295: require('@/assets/quran/page_295.png'),
  296: require('@/assets/quran/page_296.png'),
  297: require('@/assets/quran/page_297.png'),
  298: require('@/assets/quran/page_298.png'),
  299: require('@/assets/quran/page_299.png'),
  300: require('@/assets/quran/page_300.png'),
  301: require('@/assets/quran/page_301.png'),
  302: require('@/assets/quran/page_302.png'),
  303: require('@/assets/quran/page_303.png'),
  304: require('@/assets/quran/page_304.png'),
  305: require('@/assets/quran/page_305.png'),
  306: require('@/assets/quran/page_306.png'),
  307: require('@/assets/quran/page_307.png'),
  308: require('@/assets/quran/page_308.png'),
  309: require('@/assets/quran/page_309.png'),
  310: require('@/assets/quran/page_310.png'),
  311: require('@/assets/quran/page_311.png'),
  312: require('@/assets/quran/page_312.png'),
  313: require('@/assets/quran/page_313.png'),
  314: require('@/assets/quran/page_314.png'),
  315: require('@/assets/quran/page_315.png'),
  316: require('@/assets/quran/page_316.png'),
  317: require('@/assets/quran/page_317.png'),
  318: require('@/assets/quran/page_318.png'),
  319: require('@/assets/quran/page_319.png'),
  320: require('@/assets/quran/page_320.png'),
  321: require('@/assets/quran/page_321.png'),
  322: require('@/assets/quran/page_322.png'),
  323: require('@/assets/quran/page_323.png'),
  324: require('@/assets/quran/page_324.png'),
  325: require('@/assets/quran/page_325.png'),
  326: require('@/assets/quran/page_326.png'),
  327: require('@/assets/quran/page_327.png'),
  328: require('@/assets/quran/page_328.png'),
  329: require('@/assets/quran/page_329.png'),
  330: require('@/assets/quran/page_330.png'),
  331: require('@/assets/quran/page_331.png'),
  332: require('@/assets/quran/page_332.png'),
  333: require('@/assets/quran/page_333.png'),
  334: require('@/assets/quran/page_334.png'),
  335: require('@/assets/quran/page_335.png'),
  336: require('@/assets/quran/page_336.png'),
  337: require('@/assets/quran/page_337.png'),
  338: require('@/assets/quran/page_338.png'),
  339: require('@/assets/quran/page_339.png'),
  340: require('@/assets/quran/page_340.png'),
  341: require('@/assets/quran/page_341.png'),
  342: require('@/assets/quran/page_342.png'),
  343: require('@/assets/quran/page_343.png'),
  344: require('@/assets/quran/page_344.png'),
  345: require('@/assets/quran/page_345.png'),
  346: require('@/assets/quran/page_346.png'),
  347: require('@/assets/quran/page_347.png'),
  348: require('@/assets/quran/page_348.png'),
  349: require('@/assets/quran/page_349.png'),
  350: require('@/assets/quran/page_350.png'),
  351: require('@/assets/quran/page_351.png'),
  352: require('@/assets/quran/page_352.png'),
  353: require('@/assets/quran/page_353.png'),
  354: require('@/assets/quran/page_354.png'),
  355: require('@/assets/quran/page_355.png'),
  356: require('@/assets/quran/page_356.png'),
  357: require('@/assets/quran/page_357.png'),
  358: require('@/assets/quran/page_358.png'),
  359: require('@/assets/quran/page_359.png'),
  360: require('@/assets/quran/page_360.png'),
  361: require('@/assets/quran/page_361.png'),
  362: require('@/assets/quran/page_362.png'),
  363: require('@/assets/quran/page_363.png'),
  364: require('@/assets/quran/page_364.png'),
  365: require('@/assets/quran/page_365.png'),
  366: require('@/assets/quran/page_366.png'),
  367: require('@/assets/quran/page_367.png'),
  368: require('@/assets/quran/page_368.png'),
  369: require('@/assets/quran/page_369.png'),
  370: require('@/assets/quran/page_370.png'),
  371: require('@/assets/quran/page_371.png'),
  372: require('@/assets/quran/page_372.png'),
  373: require('@/assets/quran/page_373.png'),
  374: require('@/assets/quran/page_374.png'),
  375: require('@/assets/quran/page_375.png'),
  376: require('@/assets/quran/page_376.png'),
  377: require('@/assets/quran/page_377.png'),
  378: require('@/assets/quran/page_378.png'),
  379: require('@/assets/quran/page_379.png'),
  380: require('@/assets/quran/page_380.png'),
  381: require('@/assets/quran/page_381.png'),
  382: require('@/assets/quran/page_382.png'),
  383: require('@/assets/quran/page_383.png'),
  384: require('@/assets/quran/page_384.png'),
  385: require('@/assets/quran/page_385.png'),
  386: require('@/assets/quran/page_386.png'),
  387: require('@/assets/quran/page_387.png'),
  388: require('@/assets/quran/page_388.png'),
  389: require('@/assets/quran/page_389.png'),
  390: require('@/assets/quran/page_390.png'),
  391: require('@/assets/quran/page_391.png'),
  392: require('@/assets/quran/page_392.png'),
  393: require('@/assets/quran/page_393.png'),
  394: require('@/assets/quran/page_394.png'),
  395: require('@/assets/quran/page_395.png'),
  396: require('@/assets/quran/page_396.png'),
  397: require('@/assets/quran/page_397.png'),
  398: require('@/assets/quran/page_398.png'),
  399: require('@/assets/quran/page_399.png'),
  400: require('@/assets/quran/page_400.png'),
  401: require('@/assets/quran/page_401.png'),
  402: require('@/assets/quran/page_402.png'),
  403: require('@/assets/quran/page_403.png'),
  404: require('@/assets/quran/page_404.png'),
  405: require('@/assets/quran/page_405.png'),
  406: require('@/assets/quran/page_406.png'),
  407: require('@/assets/quran/page_407.png'),
  408: require('@/assets/quran/page_408.png'),
  409: require('@/assets/quran/page_409.png'),
  410: require('@/assets/quran/page_410.png'),
  411: require('@/assets/quran/page_411.png'),
  412: require('@/assets/quran/page_412.png'),
  413: require('@/assets/quran/page_413.png'),
  414: require('@/assets/quran/page_414.png'),
  415: require('@/assets/quran/page_415.png'),
  416: require('@/assets/quran/page_416.png'),
  417: require('@/assets/quran/page_417.png'),
  418: require('@/assets/quran/page_418.png'),
  419: require('@/assets/quran/page_419.png'),
  420: require('@/assets/quran/page_420.png'),
  421: require('@/assets/quran/page_421.png'),
  422: require('@/assets/quran/page_422.png'),
  423: require('@/assets/quran/page_423.png'),
  424: require('@/assets/quran/page_424.png'),
  425: require('@/assets/quran/page_425.png'),
  426: require('@/assets/quran/page_426.png'),
  427: require('@/assets/quran/page_427.png'),
  428: require('@/assets/quran/page_428.png'),
  429: require('@/assets/quran/page_429.png'),
  430: require('@/assets/quran/page_430.png'),
  431: require('@/assets/quran/page_431.png'),
  432: require('@/assets/quran/page_432.png'),
  433: require('@/assets/quran/page_433.png'),
  434: require('@/assets/quran/page_434.png'),
  435: require('@/assets/quran/page_435.png'),
  436: require('@/assets/quran/page_436.png'),
  437: require('@/assets/quran/page_437.png'),
  438: require('@/assets/quran/page_438.png'),
  439: require('@/assets/quran/page_439.png'),
  440: require('@/assets/quran/page_440.png'),
  441: require('@/assets/quran/page_441.png'),
  442: require('@/assets/quran/page_442.png'),
  443: require('@/assets/quran/page_443.png'),
  444: require('@/assets/quran/page_444.png'),
  445: require('@/assets/quran/page_445.png'),
  446: require('@/assets/quran/page_446.png'),
  447: require('@/assets/quran/page_447.png'),
  448: require('@/assets/quran/page_448.png'),
  449: require('@/assets/quran/page_449.png'),
  450: require('@/assets/quran/page_450.png'),
  451: require('@/assets/quran/page_451.png'),
  452: require('@/assets/quran/page_452.png'),
  453: require('@/assets/quran/page_453.png'),
  454: require('@/assets/quran/page_454.png'),
  455: require('@/assets/quran/page_455.png'),
  456: require('@/assets/quran/page_456.png'),
  457: require('@/assets/quran/page_457.png'),
  458: require('@/assets/quran/page_458.png'),
  459: require('@/assets/quran/page_459.png'),
  460: require('@/assets/quran/page_460.png'),
  461: require('@/assets/quran/page_461.png'),
  462: require('@/assets/quran/page_462.png'),
  463: require('@/assets/quran/page_463.png'),
  464: require('@/assets/quran/page_464.png'),
  465: require('@/assets/quran/page_465.png'),
  466: require('@/assets/quran/page_466.png'),
  467: require('@/assets/quran/page_467.png'),
  468: require('@/assets/quran/page_468.png'),
  469: require('@/assets/quran/page_469.png'),
  470: require('@/assets/quran/page_470.png'),
  471: require('@/assets/quran/page_471.png'),
  472: require('@/assets/quran/page_472.png'),
  473: require('@/assets/quran/page_473.png'),
  474: require('@/assets/quran/page_474.png'),
  475: require('@/assets/quran/page_475.png'),
  476: require('@/assets/quran/page_476.png'),
  477: require('@/assets/quran/page_477.png'),
  478: require('@/assets/quran/page_478.png'),
  479: require('@/assets/quran/page_479.png'),
  480: require('@/assets/quran/page_480.png'),
  481: require('@/assets/quran/page_481.png'),
  482: require('@/assets/quran/page_482.png'),
  483: require('@/assets/quran/page_483.png'),
  484: require('@/assets/quran/page_484.png'),
  485: require('@/assets/quran/page_485.png'),
  486: require('@/assets/quran/page_486.png'),
  487: require('@/assets/quran/page_487.png'),
  488: require('@/assets/quran/page_488.png'),
  489: require('@/assets/quran/page_489.png'),
  490: require('@/assets/quran/page_490.png'),
  491: require('@/assets/quran/page_491.png'),
  492: require('@/assets/quran/page_492.png'),
  493: require('@/assets/quran/page_493.png'),
  494: require('@/assets/quran/page_494.png'),
  495: require('@/assets/quran/page_495.png'),
  496: require('@/assets/quran/page_496.png'),
  497: require('@/assets/quran/page_497.png'),
  498: require('@/assets/quran/page_498.png'),
  499: require('@/assets/quran/page_499.png'),
  500: require('@/assets/quran/page_500.png'),
  501: require('@/assets/quran/page_501.png'),
  502: require('@/assets/quran/page_502.png'),
  503: require('@/assets/quran/page_503.png'),
  504: require('@/assets/quran/page_504.png'),
  505: require('@/assets/quran/page_505.png'),
  506: require('@/assets/quran/page_506.png'),
  507: require('@/assets/quran/page_507.png'),
  508: require('@/assets/quran/page_508.png'),
  509: require('@/assets/quran/page_509.png'),
  510: require('@/assets/quran/page_510.png'),
  511: require('@/assets/quran/page_511.png'),
  512: require('@/assets/quran/page_512.png'),
  513: require('@/assets/quran/page_513.png'),
  514: require('@/assets/quran/page_514.png'),
  515: require('@/assets/quran/page_515.png'),
  516: require('@/assets/quran/page_516.png'),
  517: require('@/assets/quran/page_517.png'),
  518: require('@/assets/quran/page_518.png'),
  519: require('@/assets/quran/page_519.png'),
  520: require('@/assets/quran/page_520.png'),
  521: require('@/assets/quran/page_521.png'),
  522: require('@/assets/quran/page_522.png'),
  523: require('@/assets/quran/page_523.png'),
  524: require('@/assets/quran/page_524.png'),
  525: require('@/assets/quran/page_525.png'),
  526: require('@/assets/quran/page_526.png'),
  527: require('@/assets/quran/page_527.png'),
  528: require('@/assets/quran/page_528.png'),
  529: require('@/assets/quran/page_529.png'),
  530: require('@/assets/quran/page_530.png'),
  531: require('@/assets/quran/page_531.png'),
  532: require('@/assets/quran/page_532.png'),
  533: require('@/assets/quran/page_533.png'),
  534: require('@/assets/quran/page_534.png'),
  535: require('@/assets/quran/page_535.png'),
  536: require('@/assets/quran/page_536.png'),
  537: require('@/assets/quran/page_537.png'),
  538: require('@/assets/quran/page_538.png'),
  539: require('@/assets/quran/page_539.png'),
  540: require('@/assets/quran/page_540.png'),
  541: require('@/assets/quran/page_541.png'),
  542: require('@/assets/quran/page_542.png'),
  543: require('@/assets/quran/page_543.png'),
  544: require('@/assets/quran/page_544.png'),
  545: require('@/assets/quran/page_545.png'),
  546: require('@/assets/quran/page_546.png'),
  547: require('@/assets/quran/page_547.png'),
  548: require('@/assets/quran/page_548.png'),
  549: require('@/assets/quran/page_549.png'),
  550: require('@/assets/quran/page_550.png'),
  551: require('@/assets/quran/page_551.png'),
  552: require('@/assets/quran/page_552.png'),
  553: require('@/assets/quran/page_553.png'),
  554: require('@/assets/quran/page_554.png'),
  555: require('@/assets/quran/page_555.png'),
  556: require('@/assets/quran/page_556.png'),
  557: require('@/assets/quran/page_557.png'),
  558: require('@/assets/quran/page_558.png'),
  559: require('@/assets/quran/page_559.png'),
  560: require('@/assets/quran/page_560.png'),
  561: require('@/assets/quran/page_561.png'),
  562: require('@/assets/quran/page_562.png'),
  563: require('@/assets/quran/page_563.png'),
  564: require('@/assets/quran/page_564.png'),
  565: require('@/assets/quran/page_565.png'),
  566: require('@/assets/quran/page_566.png'),
  567: require('@/assets/quran/page_567.png'),
  568: require('@/assets/quran/page_568.png'),
  569: require('@/assets/quran/page_569.png'),
  570: require('@/assets/quran/page_570.png'),
  571: require('@/assets/quran/page_571.png'),
  572: require('@/assets/quran/page_572.png'),
  573: require('@/assets/quran/page_573.png'),
  574: require('@/assets/quran/page_574.png'),
  575: require('@/assets/quran/page_575.png'),
  576: require('@/assets/quran/page_576.png'),
  577: require('@/assets/quran/page_577.png'),
  578: require('@/assets/quran/page_578.png'),
  579: require('@/assets/quran/page_579.png'),
  580: require('@/assets/quran/page_580.png'),
  581: require('@/assets/quran/page_581.png'),
  582: require('@/assets/quran/page_582.png'),
  583: require('@/assets/quran/page_583.png'),
  584: require('@/assets/quran/page_584.png'),
  585: require('@/assets/quran/page_585.png'),
  586: require('@/assets/quran/page_586.png'),
  587: require('@/assets/quran/page_587.png'),
  588: require('@/assets/quran/page_588.png'),
  589: require('@/assets/quran/page_589.png'),
  590: require('@/assets/quran/page_590.png'),
  591: require('@/assets/quran/page_591.png'),
  592: require('@/assets/quran/page_592.png'),
  593: require('@/assets/quran/page_593.png'),
  594: require('@/assets/quran/page_594.png'),
  595: require('@/assets/quran/page_595.png'),
  596: require('@/assets/quran/page_596.png'),
  597: require('@/assets/quran/page_597.png'),
  598: require('@/assets/quran/page_598.png'),
  599: require('@/assets/quran/page_599.png'),
  600: require('@/assets/quran/page_600.png'),
  601: require('@/assets/quran/page_601.png'),
  602: require('@/assets/quran/page_602.png'),
  603: require('@/assets/quran/page_603.png'),
  604: require('@/assets/quran/page_604.png'),
};

// Helper function to get the correct source
const getQuranPageSource = (pageNumber: number) => {
  return pageImageSources[pageNumber];
};

// Type pour une page du Quran
type QuranPage = {
  number: number;
  source: any;
  surahs: number[]; // Liste des sourates présentes sur cette page
};

// Generate allQuranPages array - une seule entrée par page unique
const generateAllQuranPages = (): QuranPage[] => {
  const surahs = require('@/data/surahs').surahs;
  
  // Créer un mapping page -> liste de sourates
  const pageToSurahs: { [pageNum: number]: number[] } = {};
  
  for (const surah of surahs) {
    const startPage = surahStartPages[surah.id];
    if (!startPage) continue;
    
    // La sourate 1 commence à la page 1, mais on utilise la page 2 (partagée avec sourate 2)
    const actualStartPage = surah.id === 1 ? 2 : startPage;
    
    // Pour chaque page de cette sourate
    for (let i = 0; i < surah.pages; i++) {
      const pageNum = actualStartPage + i;
      if (pageNum >= 2 && pageNum <= 604) {
        if (!pageToSurahs[pageNum]) {
          pageToSurahs[pageNum] = [];
        }
        if (!pageToSurahs[pageNum].includes(surah.id)) {
          pageToSurahs[pageNum].push(surah.id);
        }
      }
    }
  }
  
  // Créer le tableau final avec une seule entrée par page
  const pages: QuranPage[] = [];
  for (let pageNum = 2; pageNum <= 604; pageNum++) {
    if (pageToSurahs[pageNum]) {
      pages.push({
        number: pageNum,
        source: getQuranPageSource(pageNum),
        surahs: pageToSurahs[pageNum].sort((a, b) => a - b)
      });
    }
  }
  
  return pages;
};

const allQuranPages = generateAllQuranPages();

// Inverser l'ordre des pages pour inverser le swipe (sans changer la logique de navigation)
const reversedQuranPages = [...allQuranPages].reverse();

// Helper: Trouver l'index de la page pour une sourate donnée (dans le tableau inversé)
const findPageIndexForSurah = (surahId: number): number => {
  const startPage = surahStartPages[surahId];
  if (!startPage) return 0;
  
  // La sourate 1 commence à la page 1, mais on utilise la page 2
  const targetPage = surahId === 1 ? 2 : startPage;
  
  const originalIndex = allQuranPages.findIndex(p => p.number === targetPage);
  // Convertir l'index original en index inversé
  return originalIndex !== -1 ? reversedQuranPages.length - 1 - originalIndex : 0;
};

const HIFDH_KEY = 'HIFDH_PAGE';
const LAST_READ_KEY = 'LAST_READ_PAGE';
const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = 260;

export default function QuranReaderScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const flatListRef = useRef<FlatList>(null);
  const slideAnim = useRef(new Animated.Value(SIDEBAR_WIDTH)).current;

  // Calcul de l'index de départ basé sur l'ID de la sourate
  const startIndex = findPageIndexForSurah(Number(id));
  const finalStartIndex = startIndex !== -1 ? startIndex : 0;

  const [currentPage, setCurrentPage] = useState<number>(reversedQuranPages[finalStartIndex]?.number || 2);
  const [hifdhPage, setHifdhPage] = useState<number | null>(null);
  const [lastReadPage, setLastReadPage] = useState<number | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    loadStorage();
  }, []);

  const loadStorage = async () => {
    const [hifdh, lastRead] = await Promise.all([
      AsyncStorage.getItem(HIFDH_KEY),
      AsyncStorage.getItem(LAST_READ_KEY),
    ]);
    if (hifdh) setHifdhPage(Number(hifdh));
    if (lastRead) setLastReadPage(Number(lastRead));
  };

  const toggleMenu = () => {
    if (!menuVisible) {
      setMenuVisible(true);
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    } else {
      Animated.timing(slideAnim, { toValue: SIDEBAR_WIDTH, duration: 250, useNativeDriver: true }).start(() => setMenuVisible(false));
    }
  };

  const saveHifdh = async () => {
    await AsyncStorage.setItem(HIFDH_KEY, currentPage.toString());
    setHifdhPage(currentPage);
    Alert.alert('الحفظ', `تم حفظ الصفحة ${currentPage} للحفظ.`);
    toggleMenu();
  };

  const saveReading = async () => {
    await AsyncStorage.setItem(LAST_READ_KEY, currentPage.toString());
    setLastReadPage(currentPage);
    Alert.alert('القراءة', `تم وضع العلامة في الصفحة ${currentPage}.`);
    toggleMenu();
  };

  const jumpToPage = (pageNum: number | null) => {
    if (!pageNum) return Alert.alert('معلومة', 'لا توجد صفحة مسجلة');
    const originalIndex = allQuranPages.findIndex(p => p.number === pageNum);
    if (originalIndex !== -1) {
      // Convertir l'index original en index inversé
      const reversedIndex = reversedQuranPages.length - 1 - originalIndex;
      flatListRef.current?.scrollToIndex({ index: reversedIndex, animated: true });
      toggleMenu();
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentPage(viewableItems[0].item.number);
    }
  }).current;

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />

      <FlatList
        ref={flatListRef}
        data={reversedQuranPages}
        horizontal
        pagingEnabled
        initialScrollIndex={finalStartIndex}
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        renderItem={({ item }) => (
          <View style={styles.pageContainer}>
            <Pressable onPress={toggleMenu} style={{ flex: 1 }}>
              <Image source={item.source} style={styles.image} resizeMode="stretch" />
              <View style={[styles.badgesContainer, { top: insets.top + 8 }]}>
                {item.number === lastReadPage && (
                  <View style={styles.readingBadge}>
                    <Text style={styles.badgeText}>📖</Text>
                  </View>
                )}
                {item.number === hifdhPage && (
                  <View style={styles.hifdhBadge}>
                    <Text style={styles.badgeText}>🧠</Text>
                  </View>
                )}
              </View>
            </Pressable>
          </View>
        )}
        keyExtractor={(item) => `page-${item.number}`}
        onScrollToIndexFailed={info => {
          flatListRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: false });
        }}
      />

      {menuVisible && <Pressable style={styles.overlay} onPress={toggleMenu} />}

      <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }], paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
        <Text style={styles.sidebarTitle}>الخيارات</Text>
        <Text style={styles.pageIndicator}>صفحة {currentPage}</Text>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.menuItem} onPress={saveHifdh}><Text style={styles.menuItemText}>🧠 حفظ هذه الصفحة للحفظ</Text></TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={saveReading}><Text style={styles.menuItemText}>💾 حفظ موقع القراءة</Text></TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => jumpToPage(lastReadPage)}><Text style={styles.menuItemText}>📖 العودة إلى المكان المحفوظ</Text></TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => jumpToPage(hifdhPage)}><Text style={styles.menuItemText}>➡️ الانتقال إلى صفحة الحفظ</Text></TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={[styles.menuItem, styles.backItem]} onPress={() => router.replace('/')}><Text style={styles.backText}>📜 قائمة السور</Text></TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  pageContainer: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
  image: { width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10 },
  sidebar: { position: 'absolute', right: 0, top: 0, bottom: 0, width: SIDEBAR_WIDTH, backgroundColor: '#FFFFFF', zIndex: 20, paddingHorizontal: 15, borderTopLeftRadius: 20, borderBottomLeftRadius: 20, elevation: 10 },
  sidebarTitle: { fontSize: 24, fontWeight: 'bold', color: '#2E7D32', textAlign: 'center', marginTop: 10 },
  pageIndicator: { textAlign: 'center', color: '#666', fontSize: 14, marginBottom: 10 },
  menuItem: { paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  menuItemText: { fontSize: 16, color: '#333' },
  backItem: { marginTop: 20, borderBottomWidth: 0 },
  backText: { fontSize: 16, color: '#2E7D32', fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 10 },
  badgesContainer: { position: 'absolute', right: 12, flexDirection: 'column', alignItems: 'flex-end' },
  hifdhBadge: { backgroundColor: '#2E7D32', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 12, minWidth: 28, alignItems: 'center', justifyContent: 'center' },
  readingBadge: { backgroundColor: '#1976D2', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 12, minWidth: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  badgeText: { color: '#fff', fontSize: 10 },
});