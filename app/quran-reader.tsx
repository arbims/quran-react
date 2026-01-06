import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import * as NavigationBar from 'expo-navigation-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  I18nManager,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/* =======================
   DONNÉES DES IMAGES
======================= */

// Define the starting page for each Surah
const surahStartPages: { [key: number]: number } = {
  1: 2,   // Al-Fatiha (commence à la page 2)
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
  2: require('@/assets/quran/page_002.jpg'),
  3: require('@/assets/quran/page_003.jpg'),
  4: require('@/assets/quran/page_004.jpg'),
  5: require('@/assets/quran/page_005.jpg'),
  6: require('@/assets/quran/page_006.jpg'),
  7: require('@/assets/quran/page_007.jpg'),
  8: require('@/assets/quran/page_008.jpg'),
  9: require('@/assets/quran/page_009.jpg'),
  10: require('@/assets/quran/page_010.jpg'),
  11: require('@/assets/quran/page_011.jpg'),
  12: require('@/assets/quran/page_012.jpg'),
  13: require('@/assets/quran/page_013.jpg'),
  14: require('@/assets/quran/page_014.jpg'),
  15: require('@/assets/quran/page_015.jpg'),
  16: require('@/assets/quran/page_016.jpg'),
  17: require('@/assets/quran/page_017.jpg'),
  18: require('@/assets/quran/page_018.jpg'),
  19: require('@/assets/quran/page_019.jpg'),
  20: require('@/assets/quran/page_020.jpg'),
  21: require('@/assets/quran/page_021.jpg'),
  22: require('@/assets/quran/page_022.jpg'),
  23: require('@/assets/quran/page_023.jpg'),
  24: require('@/assets/quran/page_024.jpg'),
  25: require('@/assets/quran/page_025.jpg'),
  26: require('@/assets/quran/page_026.jpg'),
  27: require('@/assets/quran/page_027.jpg'),
  28: require('@/assets/quran/page_028.jpg'),
  29: require('@/assets/quran/page_029.jpg'),
  30: require('@/assets/quran/page_030.jpg'),
  31: require('@/assets/quran/page_031.jpg'),
  32: require('@/assets/quran/page_032.jpg'),
  33: require('@/assets/quran/page_033.jpg'),
  34: require('@/assets/quran/page_034.jpg'),
  35: require('@/assets/quran/page_035.jpg'),
  36: require('@/assets/quran/page_036.jpg'),
  37: require('@/assets/quran/page_037.jpg'),
  38: require('@/assets/quran/page_038.jpg'),
  39: require('@/assets/quran/page_039.jpg'),
  40: require('@/assets/quran/page_040.jpg'),
  41: require('@/assets/quran/page_041.jpg'),
  42: require('@/assets/quran/page_042.jpg'),
  43: require('@/assets/quran/page_043.jpg'),
  44: require('@/assets/quran/page_044.jpg'),
  45: require('@/assets/quran/page_045.jpg'),
  46: require('@/assets/quran/page_046.jpg'),
  47: require('@/assets/quran/page_047.jpg'),
  48: require('@/assets/quran/page_048.jpg'),
  49: require('@/assets/quran/page_049.jpg'),
  50: require('@/assets/quran/page_050.jpg'),
  51: require('@/assets/quran/page_051.jpg'),
  52: require('@/assets/quran/page_052.jpg'),
  53: require('@/assets/quran/page_053.jpg'),
  54: require('@/assets/quran/page_054.jpg'),
  55: require('@/assets/quran/page_055.jpg'),
  56: require('@/assets/quran/page_056.jpg'),
  57: require('@/assets/quran/page_057.jpg'),
  58: require('@/assets/quran/page_058.jpg'),
  59: require('@/assets/quran/page_059.jpg'),
  60: require('@/assets/quran/page_060.jpg'),
  61: require('@/assets/quran/page_061.jpg'),
  62: require('@/assets/quran/page_062.jpg'),
  63: require('@/assets/quran/page_063.jpg'),
  64: require('@/assets/quran/page_064.jpg'),
  65: require('@/assets/quran/page_065.jpg'),
  66: require('@/assets/quran/page_066.jpg'),
  67: require('@/assets/quran/page_067.jpg'),
  68: require('@/assets/quran/page_068.jpg'),
  69: require('@/assets/quran/page_069.jpg'),
  70: require('@/assets/quran/page_070.jpg'),
  71: require('@/assets/quran/page_071.jpg'),
  72: require('@/assets/quran/page_072.jpg'),
  73: require('@/assets/quran/page_073.jpg'),
  74: require('@/assets/quran/page_074.jpg'),
  75: require('@/assets/quran/page_075.jpg'),
  76: require('@/assets/quran/page_076.jpg'),
  77: require('@/assets/quran/page_077.jpg'),
  78: require('@/assets/quran/page_078.jpg'),
  79: require('@/assets/quran/page_079.jpg'),
  80: require('@/assets/quran/page_080.jpg'),
  81: require('@/assets/quran/page_081.jpg'),
  82: require('@/assets/quran/page_082.jpg'),
  83: require('@/assets/quran/page_083.jpg'),
  84: require('@/assets/quran/page_084.jpg'),
  85: require('@/assets/quran/page_085.jpg'),
  86: require('@/assets/quran/page_086.jpg'),
  87: require('@/assets/quran/page_087.jpg'),
  88: require('@/assets/quran/page_088.jpg'),
  89: require('@/assets/quran/page_089.jpg'),
  90: require('@/assets/quran/page_090.jpg'),
  91: require('@/assets/quran/page_091.jpg'),
  92: require('@/assets/quran/page_092.jpg'),
  93: require('@/assets/quran/page_093.jpg'),
  94: require('@/assets/quran/page_094.jpg'),
  95: require('@/assets/quran/page_095.jpg'),
  96: require('@/assets/quran/page_096.jpg'),
  97: require('@/assets/quran/page_097.jpg'),
  98: require('@/assets/quran/page_098.jpg'),
  99: require('@/assets/quran/page_099.jpg'),
  100: require('@/assets/quran/page_100.jpg'),
  101: require('@/assets/quran/page_101.jpg'),
  102: require('@/assets/quran/page_102.jpg'),
  103: require('@/assets/quran/page_103.jpg'),
  104: require('@/assets/quran/page_104.jpg'),
  105: require('@/assets/quran/page_105.jpg'),
  106: require('@/assets/quran/page_106.jpg'),
  107: require('@/assets/quran/page_107.jpg'),
  108: require('@/assets/quran/page_108.jpg'),
  109: require('@/assets/quran/page_109.jpg'),
  110: require('@/assets/quran/page_110.jpg'),
  111: require('@/assets/quran/page_111.jpg'),
  112: require('@/assets/quran/page_112.jpg'),
  113: require('@/assets/quran/page_113.jpg'),
  114: require('@/assets/quran/page_114.jpg'),
  115: require('@/assets/quran/page_115.jpg'),
  116: require('@/assets/quran/page_116.jpg'),
  117: require('@/assets/quran/page_117.jpg'),
  118: require('@/assets/quran/page_118.jpg'),
  119: require('@/assets/quran/page_119.jpg'),
  120: require('@/assets/quran/page_120.jpg'),
  121: require('@/assets/quran/page_121.jpg'),
  122: require('@/assets/quran/page_122.jpg'),
  123: require('@/assets/quran/page_123.jpg'),
  124: require('@/assets/quran/page_124.jpg'),
  125: require('@/assets/quran/page_125.jpg'),
  126: require('@/assets/quran/page_126.jpg'),
  127: require('@/assets/quran/page_127.jpg'),
  128: require('@/assets/quran/page_128.jpg'),
  129: require('@/assets/quran/page_129.jpg'),
  130: require('@/assets/quran/page_130.jpg'),
  131: require('@/assets/quran/page_131.jpg'),
  132: require('@/assets/quran/page_132.jpg'),
  133: require('@/assets/quran/page_133.jpg'),
  134: require('@/assets/quran/page_134.jpg'),
  135: require('@/assets/quran/page_135.jpg'),
  136: require('@/assets/quran/page_136.jpg'),
  137: require('@/assets/quran/page_137.jpg'),
  138: require('@/assets/quran/page_138.jpg'),
  139: require('@/assets/quran/page_139.jpg'),
  140: require('@/assets/quran/page_140.jpg'),
  141: require('@/assets/quran/page_141.jpg'),
  142: require('@/assets/quran/page_142.jpg'),
  143: require('@/assets/quran/page_143.jpg'),
  144: require('@/assets/quran/page_144.jpg'),
  145: require('@/assets/quran/page_145.jpg'),
  146: require('@/assets/quran/page_146.jpg'),
  147: require('@/assets/quran/page_147.jpg'),
  148: require('@/assets/quran/page_148.jpg'),
  149: require('@/assets/quran/page_149.jpg'),
  150: require('@/assets/quran/page_150.jpg'),
  151: require('@/assets/quran/page_151.jpg'),
  152: require('@/assets/quran/page_152.jpg'),
  153: require('@/assets/quran/page_153.jpg'),
  154: require('@/assets/quran/page_154.jpg'),
  155: require('@/assets/quran/page_155.jpg'),
  156: require('@/assets/quran/page_156.jpg'),
  157: require('@/assets/quran/page_157.jpg'),
  158: require('@/assets/quran/page_158.jpg'),
  159: require('@/assets/quran/page_159.jpg'),
  160: require('@/assets/quran/page_160.jpg'),
  161: require('@/assets/quran/page_161.jpg'),
  162: require('@/assets/quran/page_162.jpg'),
  163: require('@/assets/quran/page_163.jpg'),
  164: require('@/assets/quran/page_164.jpg'),
  165: require('@/assets/quran/page_165.jpg'),
  166: require('@/assets/quran/page_166.jpg'),
  167: require('@/assets/quran/page_167.jpg'),
  168: require('@/assets/quran/page_168.jpg'),
  169: require('@/assets/quran/page_169.jpg'),
  170: require('@/assets/quran/page_170.jpg'),
  171: require('@/assets/quran/page_171.jpg'),
  172: require('@/assets/quran/page_172.jpg'),
  173: require('@/assets/quran/page_173.jpg'),
  174: require('@/assets/quran/page_174.jpg'),
  175: require('@/assets/quran/page_175.jpg'),
  176: require('@/assets/quran/page_176.jpg'),
  177: require('@/assets/quran/page_177.jpg'),
  178: require('@/assets/quran/page_178.jpg'),
  179: require('@/assets/quran/page_179.jpg'),
  180: require('@/assets/quran/page_180.jpg'),
  181: require('@/assets/quran/page_181.jpg'),
  182: require('@/assets/quran/page_182.jpg'),
  183: require('@/assets/quran/page_183.jpg'),
  184: require('@/assets/quran/page_184.jpg'),
  185: require('@/assets/quran/page_185.jpg'),
  186: require('@/assets/quran/page_186.jpg'),
  187: require('@/assets/quran/page_187.jpg'),
  188: require('@/assets/quran/page_188.jpg'),
  189: require('@/assets/quran/page_189.jpg'),
  190: require('@/assets/quran/page_190.jpg'),
  191: require('@/assets/quran/page_191.jpg'),
  192: require('@/assets/quran/page_192.jpg'),
  193: require('@/assets/quran/page_193.jpg'),
  194: require('@/assets/quran/page_194.jpg'),
  195: require('@/assets/quran/page_195.jpg'),
  196: require('@/assets/quran/page_196.jpg'),
  197: require('@/assets/quran/page_197.jpg'),
  198: require('@/assets/quran/page_198.jpg'),
  199: require('@/assets/quran/page_199.jpg'),
  200: require('@/assets/quran/page_200.jpg'),
  201: require('@/assets/quran/page_201.jpg'),
  202: require('@/assets/quran/page_202.jpg'),
  203: require('@/assets/quran/page_203.jpg'),
  204: require('@/assets/quran/page_204.jpg'),
  205: require('@/assets/quran/page_205.jpg'),
  206: require('@/assets/quran/page_206.jpg'),
  207: require('@/assets/quran/page_207.jpg'),
  208: require('@/assets/quran/page_208.jpg'),
  209: require('@/assets/quran/page_209.jpg'),
  210: require('@/assets/quran/page_210.jpg'),
  211: require('@/assets/quran/page_211.jpg'),
  212: require('@/assets/quran/page_212.jpg'),
  213: require('@/assets/quran/page_213.jpg'),
  214: require('@/assets/quran/page_214.jpg'),
  215: require('@/assets/quran/page_215.jpg'),
  216: require('@/assets/quran/page_216.jpg'),
  217: require('@/assets/quran/page_217.jpg'),
  218: require('@/assets/quran/page_218.jpg'),
  219: require('@/assets/quran/page_219.jpg'),
  220: require('@/assets/quran/page_220.jpg'),
  221: require('@/assets/quran/page_221.jpg'),
  222: require('@/assets/quran/page_222.jpg'),
  223: require('@/assets/quran/page_223.jpg'),
  224: require('@/assets/quran/page_224.jpg'),
  225: require('@/assets/quran/page_225.jpg'),
  226: require('@/assets/quran/page_226.jpg'),
  227: require('@/assets/quran/page_227.jpg'),
  228: require('@/assets/quran/page_228.jpg'),
  229: require('@/assets/quran/page_229.jpg'),
  230: require('@/assets/quran/page_230.jpg'),
  231: require('@/assets/quran/page_231.jpg'),
  232: require('@/assets/quran/page_232.jpg'),
  233: require('@/assets/quran/page_233.jpg'),
  234: require('@/assets/quran/page_234.jpg'),
  235: require('@/assets/quran/page_235.jpg'),
  236: require('@/assets/quran/page_236.jpg'),
  237: require('@/assets/quran/page_237.jpg'),
  238: require('@/assets/quran/page_238.jpg'),
  239: require('@/assets/quran/page_239.jpg'),
  240: require('@/assets/quran/page_240.jpg'),
  241: require('@/assets/quran/page_241.jpg'),
  242: require('@/assets/quran/page_242.jpg'),
  243: require('@/assets/quran/page_243.jpg'),
  244: require('@/assets/quran/page_244.jpg'),
  245: require('@/assets/quran/page_245.jpg'),
  246: require('@/assets/quran/page_246.jpg'),
  247: require('@/assets/quran/page_247.jpg'),
  248: require('@/assets/quran/page_248.jpg'),
  249: require('@/assets/quran/page_249.jpg'),
  250: require('@/assets/quran/page_250.jpg'),
  251: require('@/assets/quran/page_251.jpg'),
  252: require('@/assets/quran/page_252.jpg'),
  253: require('@/assets/quran/page_253.jpg'),
  254: require('@/assets/quran/page_254.jpg'),
  255: require('@/assets/quran/page_255.jpg'),
  256: require('@/assets/quran/page_256.jpg'),
  257: require('@/assets/quran/page_257.jpg'),
  258: require('@/assets/quran/page_258.jpg'),
  259: require('@/assets/quran/page_259.jpg'),
  260: require('@/assets/quran/page_260.jpg'),
  261: require('@/assets/quran/page_261.jpg'),
  262: require('@/assets/quran/page_262.jpg'),
  263: require('@/assets/quran/page_263.jpg'),
  264: require('@/assets/quran/page_264.jpg'),
  265: require('@/assets/quran/page_265.jpg'),
  266: require('@/assets/quran/page_266.jpg'),
  267: require('@/assets/quran/page_267.jpg'),
  268: require('@/assets/quran/page_268.jpg'),
  269: require('@/assets/quran/page_269.jpg'),
  270: require('@/assets/quran/page_270.jpg'),
  271: require('@/assets/quran/page_271.jpg'),
  272: require('@/assets/quran/page_272.jpg'),
  273: require('@/assets/quran/page_273.jpg'),
  274: require('@/assets/quran/page_274.jpg'),
  275: require('@/assets/quran/page_275.jpg'),
  276: require('@/assets/quran/page_276.jpg'),
  277: require('@/assets/quran/page_277.jpg'),
  278: require('@/assets/quran/page_278.jpg'),
  279: require('@/assets/quran/page_279.jpg'),
  280: require('@/assets/quran/page_280.jpg'),
  281: require('@/assets/quran/page_281.jpg'),
  282: require('@/assets/quran/page_282.jpg'),
  283: require('@/assets/quran/page_283.jpg'),
  284: require('@/assets/quran/page_284.jpg'),
  285: require('@/assets/quran/page_285.jpg'),
  286: require('@/assets/quran/page_286.jpg'),
  287: require('@/assets/quran/page_287.jpg'),
  288: require('@/assets/quran/page_288.jpg'),
  289: require('@/assets/quran/page_289.jpg'),
  290: require('@/assets/quran/page_290.jpg'),
  291: require('@/assets/quran/page_291.jpg'),
  292: require('@/assets/quran/page_292.jpg'),
  293: require('@/assets/quran/page_293.jpg'),
  294: require('@/assets/quran/page_294.jpg'),
  295: require('@/assets/quran/page_295.jpg'),
  296: require('@/assets/quran/page_296.jpg'),
  297: require('@/assets/quran/page_297.jpg'),
  298: require('@/assets/quran/page_298.jpg'),
  299: require('@/assets/quran/page_299.jpg'),
  300: require('@/assets/quran/page_300.jpg'),
  301: require('@/assets/quran/page_301.jpg'),
  302: require('@/assets/quran/page_302.jpg'),
  303: require('@/assets/quran/page_303.jpg'),
  304: require('@/assets/quran/page_304.jpg'),
  305: require('@/assets/quran/page_305.jpg'),
  306: require('@/assets/quran/page_306.jpg'),
  307: require('@/assets/quran/page_307.jpg'),
  308: require('@/assets/quran/page_308.jpg'),
  309: require('@/assets/quran/page_309.jpg'),
  310: require('@/assets/quran/page_310.jpg'),
  311: require('@/assets/quran/page_311.jpg'),
  312: require('@/assets/quran/page_312.jpg'),
  313: require('@/assets/quran/page_313.jpg'),
  314: require('@/assets/quran/page_314.jpg'),
  315: require('@/assets/quran/page_315.jpg'),
  316: require('@/assets/quran/page_316.jpg'),
  317: require('@/assets/quran/page_317.jpg'),
  318: require('@/assets/quran/page_318.jpg'),
  319: require('@/assets/quran/page_319.jpg'),
  320: require('@/assets/quran/page_320.jpg'),
  321: require('@/assets/quran/page_321.jpg'),
  322: require('@/assets/quran/page_322.jpg'),
  323: require('@/assets/quran/page_323.jpg'),
  324: require('@/assets/quran/page_324.jpg'),
  325: require('@/assets/quran/page_325.jpg'),
  326: require('@/assets/quran/page_326.jpg'),
  327: require('@/assets/quran/page_327.jpg'),
  328: require('@/assets/quran/page_328.jpg'),
  329: require('@/assets/quran/page_329.jpg'),
  330: require('@/assets/quran/page_330.jpg'),
  331: require('@/assets/quran/page_331.jpg'),
  332: require('@/assets/quran/page_332.jpg'),
  333: require('@/assets/quran/page_333.jpg'),
  334: require('@/assets/quran/page_334.jpg'),
  335: require('@/assets/quran/page_335.jpg'),
  336: require('@/assets/quran/page_336.jpg'),
  337: require('@/assets/quran/page_337.jpg'),
  338: require('@/assets/quran/page_338.jpg'),
  339: require('@/assets/quran/page_339.jpg'),
  340: require('@/assets/quran/page_340.jpg'),
  341: require('@/assets/quran/page_341.jpg'),
  342: require('@/assets/quran/page_342.jpg'),
  343: require('@/assets/quran/page_343.jpg'),
  344: require('@/assets/quran/page_344.jpg'),
  345: require('@/assets/quran/page_345.jpg'),
  346: require('@/assets/quran/page_346.jpg'),
  347: require('@/assets/quran/page_347.jpg'),
  348: require('@/assets/quran/page_348.jpg'),
  349: require('@/assets/quran/page_349.jpg'),
  350: require('@/assets/quran/page_350.jpg'),
  351: require('@/assets/quran/page_351.jpg'),
  352: require('@/assets/quran/page_352.jpg'),
  353: require('@/assets/quran/page_353.jpg'),
  354: require('@/assets/quran/page_354.jpg'),
  355: require('@/assets/quran/page_355.jpg'),
  356: require('@/assets/quran/page_356.jpg'),
  357: require('@/assets/quran/page_357.jpg'),
  358: require('@/assets/quran/page_358.jpg'),
  359: require('@/assets/quran/page_359.jpg'),
  360: require('@/assets/quran/page_360.jpg'),
  361: require('@/assets/quran/page_361.jpg'),
  362: require('@/assets/quran/page_362.jpg'),
  363: require('@/assets/quran/page_363.jpg'),
  364: require('@/assets/quran/page_364.jpg'),
  365: require('@/assets/quran/page_365.jpg'),
  366: require('@/assets/quran/page_366.jpg'),
  367: require('@/assets/quran/page_367.jpg'),
  368: require('@/assets/quran/page_368.jpg'),
  369: require('@/assets/quran/page_369.jpg'),
  370: require('@/assets/quran/page_370.jpg'),
  371: require('@/assets/quran/page_371.jpg'),
  372: require('@/assets/quran/page_372.jpg'),
  373: require('@/assets/quran/page_373.jpg'),
  374: require('@/assets/quran/page_374.jpg'),
  375: require('@/assets/quran/page_375.jpg'),
  376: require('@/assets/quran/page_376.jpg'),
  377: require('@/assets/quran/page_377.jpg'),
  378: require('@/assets/quran/page_378.jpg'),
  379: require('@/assets/quran/page_379.jpg'),
  380: require('@/assets/quran/page_380.jpg'),
  381: require('@/assets/quran/page_381.jpg'),
  382: require('@/assets/quran/page_382.jpg'),
  383: require('@/assets/quran/page_383.jpg'),
  384: require('@/assets/quran/page_384.jpg'),
  385: require('@/assets/quran/page_385.jpg'),
  386: require('@/assets/quran/page_386.jpg'),
  387: require('@/assets/quran/page_387.jpg'),
  388: require('@/assets/quran/page_388.jpg'),
  389: require('@/assets/quran/page_389.jpg'),
  390: require('@/assets/quran/page_390.jpg'),
  391: require('@/assets/quran/page_391.jpg'),
  392: require('@/assets/quran/page_392.jpg'),
  393: require('@/assets/quran/page_393.jpg'),
  394: require('@/assets/quran/page_394.jpg'),
  395: require('@/assets/quran/page_395.jpg'),
  396: require('@/assets/quran/page_396.jpg'),
  397: require('@/assets/quran/page_397.jpg'),
  398: require('@/assets/quran/page_398.jpg'),
  399: require('@/assets/quran/page_399.jpg'),
  400: require('@/assets/quran/page_400.jpg'),
  401: require('@/assets/quran/page_401.jpg'),
  402: require('@/assets/quran/page_402.jpg'),
  403: require('@/assets/quran/page_403.jpg'),
  404: require('@/assets/quran/page_404.jpg'),
  405: require('@/assets/quran/page_405.jpg'),
  406: require('@/assets/quran/page_406.jpg'),
  407: require('@/assets/quran/page_407.jpg'),
  408: require('@/assets/quran/page_408.jpg'),
  409: require('@/assets/quran/page_409.jpg'),
  410: require('@/assets/quran/page_410.jpg'),
  411: require('@/assets/quran/page_411.jpg'),
  412: require('@/assets/quran/page_412.jpg'),
  413: require('@/assets/quran/page_413.jpg'),
  414: require('@/assets/quran/page_414.jpg'),
  415: require('@/assets/quran/page_415.jpg'),
  416: require('@/assets/quran/page_416.jpg'),
  417: require('@/assets/quran/page_417.jpg'),
  418: require('@/assets/quran/page_418.jpg'),
  419: require('@/assets/quran/page_419.jpg'),
  420: require('@/assets/quran/page_420.jpg'),
  421: require('@/assets/quran/page_421.jpg'),
  422: require('@/assets/quran/page_422.jpg'),
  423: require('@/assets/quran/page_423.jpg'),
  424: require('@/assets/quran/page_424.jpg'),
  425: require('@/assets/quran/page_425.jpg'),
  426: require('@/assets/quran/page_426.jpg'),
  427: require('@/assets/quran/page_427.jpg'),
  428: require('@/assets/quran/page_428.jpg'),
  429: require('@/assets/quran/page_429.jpg'),
  430: require('@/assets/quran/page_430.jpg'),
  431: require('@/assets/quran/page_431.jpg'),
  432: require('@/assets/quran/page_432.jpg'),
  433: require('@/assets/quran/page_433.jpg'),
  434: require('@/assets/quran/page_434.jpg'),
  435: require('@/assets/quran/page_435.jpg'),
  436: require('@/assets/quran/page_436.jpg'),
  437: require('@/assets/quran/page_437.jpg'),
  438: require('@/assets/quran/page_438.jpg'),
  439: require('@/assets/quran/page_439.jpg'),
  440: require('@/assets/quran/page_440.jpg'),
  441: require('@/assets/quran/page_441.jpg'),
  442: require('@/assets/quran/page_442.jpg'),
  443: require('@/assets/quran/page_443.jpg'),
  444: require('@/assets/quran/page_444.jpg'),
  445: require('@/assets/quran/page_445.jpg'),
  446: require('@/assets/quran/page_446.jpg'),
  447: require('@/assets/quran/page_447.jpg'),
  448: require('@/assets/quran/page_448.jpg'),
  449: require('@/assets/quran/page_449.jpg'),
  450: require('@/assets/quran/page_450.jpg'),
  451: require('@/assets/quran/page_451.jpg'),
  452: require('@/assets/quran/page_452.jpg'),
  453: require('@/assets/quran/page_453.jpg'),
  454: require('@/assets/quran/page_454.jpg'),
  455: require('@/assets/quran/page_455.jpg'),
  456: require('@/assets/quran/page_456.jpg'),
  457: require('@/assets/quran/page_457.jpg'),
  458: require('@/assets/quran/page_458.jpg'),
  459: require('@/assets/quran/page_459.jpg'),
  460: require('@/assets/quran/page_460.jpg'),
  461: require('@/assets/quran/page_461.jpg'),
  462: require('@/assets/quran/page_462.jpg'),
  463: require('@/assets/quran/page_463.jpg'),
  464: require('@/assets/quran/page_464.jpg'),
  465: require('@/assets/quran/page_465.jpg'),
  466: require('@/assets/quran/page_466.jpg'),
  467: require('@/assets/quran/page_467.jpg'),
  468: require('@/assets/quran/page_468.jpg'),
  469: require('@/assets/quran/page_469.jpg'),
  470: require('@/assets/quran/page_470.jpg'),
  471: require('@/assets/quran/page_471.jpg'),
  472: require('@/assets/quran/page_472.jpg'),
  473: require('@/assets/quran/page_473.jpg'),
  474: require('@/assets/quran/page_474.jpg'),
  475: require('@/assets/quran/page_475.jpg'),
  476: require('@/assets/quran/page_476.jpg'),
  477: require('@/assets/quran/page_477.jpg'),
  478: require('@/assets/quran/page_478.jpg'),
  479: require('@/assets/quran/page_479.jpg'),
  480: require('@/assets/quran/page_480.jpg'),
  481: require('@/assets/quran/page_481.jpg'),
  482: require('@/assets/quran/page_482.jpg'),
  483: require('@/assets/quran/page_483.jpg'),
  484: require('@/assets/quran/page_484.jpg'),
  485: require('@/assets/quran/page_485.jpg'),
  486: require('@/assets/quran/page_486.jpg'),
  487: require('@/assets/quran/page_487.jpg'),
  488: require('@/assets/quran/page_488.jpg'),
  489: require('@/assets/quran/page_489.jpg'),
  490: require('@/assets/quran/page_490.jpg'),
  491: require('@/assets/quran/page_491.jpg'),
  492: require('@/assets/quran/page_492.jpg'),
  493: require('@/assets/quran/page_493.jpg'),
  494: require('@/assets/quran/page_494.jpg'),
  495: require('@/assets/quran/page_495.jpg'),
  496: require('@/assets/quran/page_496.jpg'),
  497: require('@/assets/quran/page_497.jpg'),
  498: require('@/assets/quran/page_498.jpg'),
  499: require('@/assets/quran/page_499.jpg'),
  500: require('@/assets/quran/page_500.jpg'),
  501: require('@/assets/quran/page_501.jpg'),
  502: require('@/assets/quran/page_502.jpg'),
  503: require('@/assets/quran/page_503.jpg'),
  504: require('@/assets/quran/page_504.jpg'),
  505: require('@/assets/quran/page_505.jpg'),
  506: require('@/assets/quran/page_506.jpg'),
  507: require('@/assets/quran/page_507.jpg'),
  508: require('@/assets/quran/page_508.jpg'),
  509: require('@/assets/quran/page_509.jpg'),
  510: require('@/assets/quran/page_510.jpg'),
  511: require('@/assets/quran/page_511.jpg'),
  512: require('@/assets/quran/page_512.jpg'),
  513: require('@/assets/quran/page_513.jpg'),
  514: require('@/assets/quran/page_514.jpg'),
  515: require('@/assets/quran/page_515.jpg'),
  516: require('@/assets/quran/page_516.jpg'),
  517: require('@/assets/quran/page_517.jpg'),
  518: require('@/assets/quran/page_518.jpg'),
  519: require('@/assets/quran/page_519.jpg'),
  520: require('@/assets/quran/page_520.jpg'),
  521: require('@/assets/quran/page_521.jpg'),
  522: require('@/assets/quran/page_522.jpg'),
  523: require('@/assets/quran/page_523.jpg'),
  524: require('@/assets/quran/page_524.jpg'),
  525: require('@/assets/quran/page_525.jpg'),
  526: require('@/assets/quran/page_526.jpg'),
  527: require('@/assets/quran/page_527.jpg'),
  528: require('@/assets/quran/page_528.jpg'),
  529: require('@/assets/quran/page_529.jpg'),
  530: require('@/assets/quran/page_530.jpg'),
  531: require('@/assets/quran/page_531.jpg'),
  532: require('@/assets/quran/page_532.jpg'),
  533: require('@/assets/quran/page_533.jpg'),
  534: require('@/assets/quran/page_534.jpg'),
  535: require('@/assets/quran/page_535.jpg'),
  536: require('@/assets/quran/page_536.jpg'),
  537: require('@/assets/quran/page_537.jpg'),
  538: require('@/assets/quran/page_538.jpg'),
  539: require('@/assets/quran/page_539.jpg'),
  540: require('@/assets/quran/page_540.jpg'),
  541: require('@/assets/quran/page_541.jpg'),
  542: require('@/assets/quran/page_542.jpg'),
  543: require('@/assets/quran/page_543.jpg'),
  544: require('@/assets/quran/page_544.jpg'),
  545: require('@/assets/quran/page_545.jpg'),
  546: require('@/assets/quran/page_546.jpg'),
  547: require('@/assets/quran/page_547.jpg'),
  548: require('@/assets/quran/page_548.jpg'),
  549: require('@/assets/quran/page_549.jpg'),
  550: require('@/assets/quran/page_550.jpg'),
  551: require('@/assets/quran/page_551.jpg'),
  552: require('@/assets/quran/page_552.jpg'),
  553: require('@/assets/quran/page_553.jpg'),
  554: require('@/assets/quran/page_554.jpg'),
  555: require('@/assets/quran/page_555.jpg'),
  556: require('@/assets/quran/page_556.jpg'),
  557: require('@/assets/quran/page_557.jpg'),
  558: require('@/assets/quran/page_558.jpg'),
  559: require('@/assets/quran/page_559.jpg'),
  560: require('@/assets/quran/page_560.jpg'),
  561: require('@/assets/quran/page_561.jpg'),
  562: require('@/assets/quran/page_562.jpg'),
  563: require('@/assets/quran/page_563.jpg'),
  564: require('@/assets/quran/page_564.jpg'),
  565: require('@/assets/quran/page_565.jpg'),
  566: require('@/assets/quran/page_566.jpg'),
  567: require('@/assets/quran/page_567.jpg'),
  568: require('@/assets/quran/page_568.jpg'),
  569: require('@/assets/quran/page_569.jpg'),
  570: require('@/assets/quran/page_570.jpg'),
  571: require('@/assets/quran/page_571.jpg'),
  572: require('@/assets/quran/page_572.jpg'),
  573: require('@/assets/quran/page_573.jpg'),
  574: require('@/assets/quran/page_574.jpg'),
  575: require('@/assets/quran/page_575.jpg'),
  576: require('@/assets/quran/page_576.jpg'),
  577: require('@/assets/quran/page_577.jpg'),
  578: require('@/assets/quran/page_578.jpg'),
  579: require('@/assets/quran/page_579.jpg'),
  580: require('@/assets/quran/page_580.jpg'),
  581: require('@/assets/quran/page_581.jpg'),
  582: require('@/assets/quran/page_582.jpg'),
  583: require('@/assets/quran/page_583.jpg'),
  584: require('@/assets/quran/page_584.jpg'),
  585: require('@/assets/quran/page_585.jpg'),
  586: require('@/assets/quran/page_586.jpg'),
  587: require('@/assets/quran/page_587.jpg'),
  588: require('@/assets/quran/page_588.jpg'),
  589: require('@/assets/quran/page_589.jpg'),
  590: require('@/assets/quran/page_590.jpg'),
  591: require('@/assets/quran/page_591.jpg'),
  592: require('@/assets/quran/page_592.jpg'),
  593: require('@/assets/quran/page_593.jpg'),
  594: require('@/assets/quran/page_594.jpg'),
  595: require('@/assets/quran/page_595.jpg'),
  596: require('@/assets/quran/page_596.jpg'),
  597: require('@/assets/quran/page_597.jpg'),
  598: require('@/assets/quran/page_598.jpg'),
  599: require('@/assets/quran/page_599.jpg'),
  600: require('@/assets/quran/page_600.jpg'),
  601: require('@/assets/quran/page_601.jpg'),
  602: require('@/assets/quran/page_602.jpg'),
  603: require('@/assets/quran/page_603.jpg'),
  604: require('@/assets/quran/page_604.jpg'),
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
    
    // Pour chaque page de cette sourate
    for (let i = 0; i < surah.pages; i++) {
      const pageNum = startPage + i;
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
  // Inclure TOUTES les pages de 2 à 604, même si elles ne sont pas couvertes par une sourate
  const pages: QuranPage[] = [];
  for (let pageNum = 2; pageNum <= 604; pageNum++) {
    pages.push({
      number: pageNum,
      source: getQuranPageSource(pageNum),
      surahs: pageToSurahs[pageNum] ? pageToSurahs[pageNum].sort((a, b) => a - b) : []
    });
  }
  
  return pages;
};

const allQuranPages = generateAllQuranPages();

// Inverser l'ordre des pages pour inverser le swipe (sans changer la logique de navigation)
const reversedQuranPages = [...allQuranPages].reverse();

// Helper: Trouver l'index de la page pour une sourate donnée (dans le tableau inversé)
const findPageIndexForSurah = (surahId: number): number => {
  const startPage = surahStartPages[surahId];
  if (!startPage) return -1;
  
  const originalIndex = allQuranPages.findIndex(p => p.number === startPage);
  // Convertir l'index original en index inversé
  if (originalIndex === -1) return -1;
  return reversedQuranPages.length - 1 - originalIndex;
};

const HIFDH_KEY = 'HIFDH_PAGE';
const LAST_READ_KEY = 'LAST_READ_PAGE';
const SIDEBAR_WIDTH = 260;

// Composant mémorisé pour les items de page (optimisation des performances)
interface PageItemProps {
  item: QuranPage;
  width: number;
  height: number;
  isLandscape: boolean;
  insets: { top: number; bottom: number };
}

const PageItem = React.memo<PageItemProps>(({ item, width, height, isLandscape, insets }) => {
  const navbarHeight = isLandscape ? Math.max(insets.top, 8) + 40 + 4 : insets.top + 48;
  const bottomInset = isLandscape ? Math.max(insets.bottom, 60) : insets.bottom;
  const containerHeight = height - navbarHeight;
  
  if (isLandscape) {
    // Mode paysage : scroll vertical avec image en contain à 100% width
    const imageAspectRatio = 1.4;
    const imageHeight = width * imageAspectRatio;
    
    return (
      <View style={{ 
        width: width, 
        height: containerHeight,
        backgroundColor: '#fff'
      }}>
        <ScrollView 
          style={{ flex: 1, width: width }}
          contentContainerStyle={{ width: width, paddingBottom: bottomInset }}
          showsVerticalScrollIndicator={true}
          bounces={true}
        >
          <Image 
            source={item.source} 
            style={{ 
              width: width,
              height: imageHeight
            }}
            contentFit="contain"
            cachePolicy="memory-disk"
          />
        </ScrollView>
      </View>
    );
  } else {
    // Mode portrait : stretch comme avant
    const portraitBottomInset = Math.max(insets.bottom, 8);
    const portraitContainerHeight = height - navbarHeight - portraitBottomInset;
    return (
      <View style={[styles.pageContainer, { width: width, height: portraitContainerHeight, marginBottom: portraitBottomInset }]}>
        <Image source={item.source} style={styles.image} contentFit="fill" />
      </View>
    );
  }
}, (prevProps, nextProps) => {
  // Comparaison personnalisée pour éviter les re-renders inutiles
  return (
    prevProps.item.number === nextProps.item.number &&
    prevProps.width === nextProps.width &&
    prevProps.height === nextProps.height &&
    prevProps.isLandscape === nextProps.isLandscape &&
    prevProps.insets.top === nextProps.insets.top &&
    prevProps.insets.bottom === nextProps.insets.bottom
  );
});

PageItem.displayName = 'PageItem';

export default function QuranReaderScreen() {
  const { id, page } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  
  // Détecter si on est en mode paysage
  const isLandscape = width > height;
  
  const flatListRef = useRef<FlatList>(null);
  // Initialiser l'animation en fonction de RTL
  const initialSlideValue = I18nManager.isRTL ? -SIDEBAR_WIDTH : SIDEBAR_WIDTH;
  const slideAnim = useRef(new Animated.Value(initialSlideValue)).current;
  const [surahListVisible, setSurahListVisible] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState<number | null>(null);

  // Calcul de l'index de départ
  const getStartIndex = () => {
    // Si un numéro de page est spécifié, utiliser cette page
    if (page) {
      const pageNum = Number(page);
      const originalIndex = allQuranPages.findIndex(p => p.number === pageNum);
      if (originalIndex !== -1) {
        return reversedQuranPages.length - 1 - originalIndex;
      }
    }
    // Sinon, utiliser l'ID de la sourate
    return findPageIndexForSurah(Number(id));
  };

  const startIndex = getStartIndex();
  const finalStartIndex = startIndex !== -1 ? startIndex : 0;

  const [currentPage, setCurrentPage] = useState<number>(reversedQuranPages[finalStartIndex]?.number || 2);
  const [hifdhPage, setHifdhPage] = useState<number | null>(null);
  const [lastReadPage, setLastReadPage] = useState<number | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [pageInputVisible, setPageInputVisible] = useState(false);
  const [pageInputValue, setPageInputValue] = useState('');

  // Fonction pour trouver la sourate actuelle
  const getCurrentSurah = () => {
    const surahs = require('@/data/surahs').surahs;
    // D'abord, vérifier si une sourate commence exactement à cette page
    const surahStartingAtPage = surahs.find((s: any) => surahStartPages[s.id] === currentPage);
    if (surahStartingAtPage) {
      return surahStartingAtPage;
    }
    
    // Trouver la page actuelle dans allQuranPages pour obtenir les sourates
    const currentPageData = allQuranPages.find(p => p.number === currentPage);
    if (currentPageData && currentPageData.surahs.length > 0) {
      // Si plusieurs sourates sont sur cette page, prendre la plus récente (ID le plus élevé)
      // car c'est généralement celle qui est en cours
      const sortedSurahIds = currentPageData.surahs.sort((a, b) => b - a);
      const surahId = sortedSurahIds[0];
      return surahs.find((s: any) => s.id === surahId) || null;
    }
    
    // Si la page n'a pas de sourate associée, trouver la dernière sourate qui commence avant ou à cette page
    let lastSurah = null;
    for (const surah of surahs) {
      const startPage = surahStartPages[surah.id];
      if (startPage && startPage <= currentPage) {
        const endPage = startPage + surah.pages - 1;
        // Si la page actuelle est dans cette sourate ou juste après
        if (currentPage <= endPage + 1) {
          lastSurah = surah;
        }
      }
    }
    
    return lastSurah;
  };

  const currentSurah = getCurrentSurah();

  useEffect(() => {
    loadStorage();
    
    // Forcer le layout LTR pour éviter les problèmes RTL
    if (I18nManager.isRTL) {
      I18nManager.forceRTL(false);
      I18nManager.allowRTL(false);
      if (Platform.OS === 'android') {
        // Nécessite un redémarrage de l'app sur Android
        // Mais on peut quand même forcer le layout
      }
    }
    
    // Afficher la barre de navigation Android
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('visible');
    }
    
    // Empêcher l'écran de se mettre en veille
    activateKeepAwakeAsync();
    
    // Nettoyer à la sortie
    return () => {
      if (Platform.OS === 'android') {
        NavigationBar.setVisibilityAsync('visible');
      }
      deactivateKeepAwake();
    };
  }, []);

  // Restaurer la page actuelle lors de la rotation
  useEffect(() => {
    if (currentPageIndex !== null && flatListRef.current) {
      // Petit délai pour s'assurer que le layout est mis à jour
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ 
          index: currentPageIndex, 
          animated: false 
        });
      }, 100);
    }
  }, [width, height, currentPageIndex]);

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
      // En RTL, on doit inverser la direction de l'animation
      const targetValue = I18nManager.isRTL ? -SIDEBAR_WIDTH : 0;
      Animated.timing(slideAnim, { toValue: targetValue, duration: 300, useNativeDriver: true }).start();
    } else {
      // En RTL, on doit inverser la direction de l'animation
      const targetValue = I18nManager.isRTL ? 0 : SIDEBAR_WIDTH;
      Animated.timing(slideAnim, { toValue: targetValue, duration: 250, useNativeDriver: true }).start(() => setMenuVisible(false));
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
      // Mettre à jour currentPage et currentPageIndex immédiatement pour éviter les bugs
      setCurrentPage(pageNum);
      setCurrentPageIndex(reversedIndex);
      // Fermer le menu d'abord
      toggleMenu();
      // Attendre un peu pour que le menu se ferme et la FlatList soit prête
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: reversedIndex, animated: true });
      }, 300);
    } else {
      Alert.alert('خطأ', `الصفحة ${pageNum} غير موجودة`);
    }
  };

  const handleGoToPage = () => {
    const pageNum = parseInt(pageInputValue);
    if (isNaN(pageNum) || pageNum < 2 || pageNum > 604) {
      Alert.alert('خطأ', 'يرجى إدخال رقم صفحة صحيح بين 2 و 604');
      return;
    }
    setPageInputVisible(false);
    setPageInputValue('');
    jumpToPage(pageNum);
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const pageNumber = viewableItems[0].item.number;
      setCurrentPage(pageNumber);
      // Sauvegarder l'index actuel pour la rotation
      const index = reversedQuranPages.findIndex(p => p.number === pageNumber);
      if (index !== -1) {
        setCurrentPageIndex(index);
      }
    }
  }).current;

  return (
    <View style={styles.container}>
      <StatusBar hidden={false} barStyle="light-content" translucent={true} />

      {/* Navbar en haut */}
      <View style={[styles.navbar, { 
        paddingTop: isLandscape ? Math.max(insets.top, 8) + 4 : insets.top + 4,
        paddingBottom: isLandscape ? Math.max(insets.bottom, 8) + 4 : 6,
        minHeight: isLandscape ? 40 : 44,
        paddingRight: isLandscape ? Math.max(insets.right, 8) : 12,
        paddingLeft: isLandscape ? Math.max(insets.left, 8) : 12
      }]}>
        <View style={styles.navbarLeft}>
          <Text style={styles.navbarPageNumber}>صفحة {currentPage}</Text>
        </View>
        <View style={styles.navbarCenter}>
          <View style={styles.badgesContainer}>
            {currentPage === lastReadPage && (
              <View style={styles.readingBadge}>
                <Text style={styles.badgeText}>📖</Text>
              </View>
            )}
            {currentPage === hifdhPage && (
              <View style={styles.hifdhBadge}>
                <Text style={styles.badgeText}>🧠</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.navbarRight}>
          {currentSurah && (
            <Text style={styles.navbarTitle}>{currentSurah.name_ar}</Text>
          )}
        </View>
        <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
          <Text style={styles.menuButtonText}>☰</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        ref={flatListRef}
        data={reversedQuranPages}
        horizontal
        pagingEnabled
        initialScrollIndex={currentPageIndex !== null ? currentPageIndex : finalStartIndex}
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        style={{ 
          marginTop: isLandscape ? Math.max(insets.top, 8) + 40 + 4 : insets.top + 48, 
          direction: 'ltr' 
        }}
        key={`flatlist-${width}-${height}`}
        extraData={isLandscape}
        renderItem={({ item }) => (
          <PageItem 
            item={item} 
            width={width} 
            height={height} 
            isLandscape={isLandscape} 
            insets={insets}
          />
        )}
        keyExtractor={(item) => `page-${item.number}`}
        onScrollToIndexFailed={info => {
          flatListRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: false });
        }}
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        windowSize={5}
        initialNumToRender={1}
        updateCellsBatchingPeriod={50}
      />

      {menuVisible && <Pressable style={styles.overlay} onPress={toggleMenu} />}

      <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }], paddingTop: insets.top + 48 + 20, paddingBottom: insets.bottom + 20 }]}>
        {!surahListVisible ? (
          <ScrollView 
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarTitle}>الخيارات</Text>
              <Text style={styles.pageIndicator}>صفحة {currentPage}</Text>
        </View>
        <View style={styles.divider} />
            <TouchableOpacity style={styles.menuItem} onPress={saveReading}><Text style={styles.menuItemText}>💾 حفظ موقع القراءة</Text></TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => jumpToPage(lastReadPage)}><Text style={styles.menuItemText}>📖 العودة إلى  لعلامة القراءة</Text></TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={saveHifdh}><Text style={styles.menuItemText}>🧠 تسجيل الصفحة للحفظ</Text></TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => jumpToPage(hifdhPage)}><Text style={styles.menuItemText}>➡️ الانتقال إلى صفحة الحفظ</Text></TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setPageInputVisible(true); toggleMenu(); }}>
              <Text style={styles.menuItemText}>🔢 الانتقال إلى صفحة محددة</Text>
        </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => setSurahListVisible(true)}>
              <Text style={styles.menuItemText}>📜 قائمة السور</Text>
        </TouchableOpacity>
          </ScrollView>
        ) : (
          <>
            <View style={styles.surahListHeader}>
              <TouchableOpacity onPress={() => setSurahListVisible(false)} style={styles.backButton}>
                <Text style={styles.backButtonText}>← رجوع</Text>
        </TouchableOpacity>
              <Text style={[styles.sidebarTitle, { flex: 1, textAlign: 'right' }]}>قائمة السور</Text>
              <View style={styles.backButton} />
            </View>
        <View style={styles.divider} />
            <FlatList
              data={require('@/data/surahs').surahs}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.surahListItem}
                  onPress={() => {
                    const surahIndex = findPageIndexForSurah(item.id);
                    if (surahIndex !== -1) {
                      // Obtenir le numéro de page correspondant à cet index
                      const targetPage = reversedQuranPages[surahIndex]?.number;
                      if (targetPage) {
                        // Mettre à jour currentPage immédiatement pour éviter les bugs
                        setCurrentPage(targetPage);
                        setCurrentPageIndex(surahIndex);
                      }
                      
                      // Fermer d'abord les menus
                      setSurahListVisible(false);
                      toggleMenu();
                      
                      // Attendre un peu pour que les menus se ferment et la FlatList soit prête
                      setTimeout(() => {
                        // Faire le scroll vers la page
                        flatListRef.current?.scrollToIndex({ 
                          index: surahIndex, 
                          animated: true 
                        });
                      }, 300);
                    }
                  }}
                >
                  <Text style={styles.surahListItemText}>{item.id}. {item.name_ar}</Text>
                  <Text style={styles.surahListItemSubtext}>{item.name_en}</Text>
        </TouchableOpacity>
              )}
              style={styles.surahList}
              nestedScrollEnabled={true}
              scrollEnabled={true}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          </>
        )}
      </Animated.View>

      {/* Modal pour saisir le numéro de page */}
      <Modal
        visible={pageInputVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPageInputVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setPageInputVisible(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>الانتقال إلى صفحة</Text>
            <Text style={styles.modalSubtitle}>أدخل رقم الصفحة (2 - 604)</Text>
            <TextInput
              style={styles.pageInput}
              value={pageInputValue}
              onChangeText={setPageInputValue}
              placeholder="رقم الصفحة"
              placeholderTextColor="#999"
              keyboardType="numeric"
              autoFocus={true}
              textAlign="right"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setPageInputVisible(false);
                  setPageInputValue('');
                }}
              >
                <Text style={styles.modalButtonText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleGoToPage}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>انتقل</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', direction: 'ltr' },
  navbar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#445CEB',
    paddingHorizontal: 12,
    paddingBottom: 6,
    minHeight: 44,
    zIndex: 30,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    direction: 'ltr',
  },
  menuButton: {
    padding: 6,
    minWidth: 36,
  },
  menuButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  navbarLeft: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: 8,
  },
  navbarPageNumber: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  navbarCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  navbarRight: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 8,
  },
  navbarTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'right',
  },
  pageContainer: { justifyContent: 'flex-start', alignItems: 'center' },
  scrollView: { flex: 1, width: '100%' },
  scrollViewContent: { alignItems: 'center', flexGrow: 1, width: '100%' },
  image: { width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10 },
  sidebar: { position: 'absolute', right: 0, top: 0, bottom: 0, width: SIDEBAR_WIDTH, backgroundColor: '#445CEB', zIndex: 20, paddingHorizontal: 15, borderTopLeftRadius: 20, borderBottomLeftRadius: 20, elevation: 10, direction: 'ltr' },
  sidebarHeader: { marginTop: 10, marginBottom: 10 },
  sidebarTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'right', marginBottom: 6 },
  pageIndicator: { textAlign: 'right', color: 'rgba(255, 255, 255, 0.9)', fontSize: 16 },
  menuItem: { paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.2)' },
  menuItemText: { fontSize: 18, color: '#FFFFFF', textAlign: 'right' },
  backItem: { marginTop: 20, borderBottomWidth: 0 },
  backText: { fontSize: 18, color: '#FFFFFF', fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: 'rgba(255, 255, 255, 0.2)', marginVertical: 10 },
  surahListHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  backButton: { paddingVertical: 8, paddingHorizontal: 12 },
  backButtonText: { fontSize: 18, color: '#FFFFFF', fontWeight: '600', textAlign: 'right' },
  surahList: { flex: 1 },
  surahListItem: { paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.2)' },
  surahListItemText: { fontSize: 18, color: '#FFFFFF', fontWeight: '600', marginBottom: 2, textAlign: 'right' },
  surahListItemSubtext: { fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', textAlign: 'right' },
  badgesContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 2 },
  hifdhBadge: { 
    backgroundColor: '#2E7D32', 
    paddingHorizontal: 10, 
    paddingVertical: 6, 
    borderRadius: 16, 
    minWidth: 36, 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  readingBadge: { 
    backgroundColor: '#1976D2', 
    paddingHorizontal: 10, 
    paddingVertical: 6, 
    borderRadius: 16, 
    minWidth: 36, 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  badgeText: { color: '#fff', fontSize: 10 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#445CEB',
    textAlign: 'right',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
    marginBottom: 16,
  },
  pageInput: {
    borderWidth: 2,
    borderColor: '#445CEB',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    textAlign: 'right',
    marginBottom: 20,
    backgroundColor: '#F5F5F5',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#E0E0E0',
  },
  modalButtonConfirm: {
    backgroundColor: '#445CEB',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});