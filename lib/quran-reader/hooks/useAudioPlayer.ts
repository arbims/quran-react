import { Asset } from 'expo-asset';
import { Audio as ExpoAV } from 'expo-av';
import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { getAudioAsset, hasAudioAsset } from '../utils/audioAssets';
import {
  downloadAudioFile,
  getCachedAudioUri,
  isAudioFileCached
} from '../utils/audioDownload';

/** Numéro de sourate (1-114). La piste audio suit le numéro : 001.mp3 ... 114.mp3 */
interface UseAudioPlayerReturn {
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  /** Lance la lecture de la sourate (1-114). Le swipe ne change pas la piste. */
  play: (surahNumber: number, onDownloadRequest?: (surahNumber: number) => Promise<boolean>) => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  seek: (time: number) => Promise<void>;
  /** Numéro de la sourate en cours (1-114), ou null si aucune lecture. */
  currentPage: number | null;
  currentTime: number;
  duration: number;
  isLooping: boolean;
  toggleLoop: () => void;
  /**
   * Enregistre un callback appelé quand la lecture d'une sourate se termine
   * naturellement (fin de fichier audio, hors arrêt manuel).
   */
  setOnFinished: (callback: (surahNumber: number | null) => void) => void;
}

export const useAudioPlayer = (): UseAudioPlayerReturn => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  
  const soundRef = useRef<ExpoAV.Sound | null>(null);
  const onDownloadRequestRef = useRef<((surahNumber: number) => Promise<boolean>) | undefined>(undefined);
  const isLoopingRef = useRef(false);
  const currentPageRef = useRef<number | null>(null);
  const onFinishedCallbackRef = useRef<((pageNumber: number | null) => void) | null>(null);

  // Configurer la lecture en arrière-plan au démarrage
  useEffect(() => {
    const configureAudioMode = async () => {
      try {
        await ExpoAV.setAudioModeAsync({
          staysActiveInBackground: true,
          shouldDuckAndroid: false,
        });
        console.log('✅ Mode audio configuré pour la lecture en arrière-plan avec contrôles système');
      } catch (err) {
        console.warn('⚠️ Erreur lors de la configuration du mode audio:', err);
      }
    };
    configureAudioMode();
  }, []);

  // Synchroniser l'état quand l'app revient au premier plan et écouter les actions système
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && soundRef.current) {
        try {
          // Attendre que le statut se stabilise
          await new Promise(resolve => setTimeout(resolve, 300));
          
          const status = await soundRef.current.getStatusAsync();
          if (status.isLoaded) {
            // Synchroniser la position
            if (status.positionMillis !== undefined && status.positionMillis >= 0) {
              const currentTimeValue = status.positionMillis / 1000;
              setCurrentTime(currentTimeValue);
              console.log('✅ Position synchronisée au retour au premier plan:', currentTimeValue.toFixed(2), 's');
            }
            
            // Synchroniser l'état de lecture (important pour les contrôles système)
            if (status.isPlaying !== undefined) {
              setIsPlaying(status.isPlaying);
              console.log('✅ État de lecture synchronisé avec les contrôles système:', status.isPlaying ? 'play' : 'pause');
            }
            
            // Synchroniser la durée
            if (status.durationMillis !== undefined && status.durationMillis > 0) {
              const durationSeconds = status.durationMillis / 1000;
              setDuration(durationSeconds);
            }
          }
        } catch (err) {
          console.warn('⚠️ Erreur lors de la synchronisation au retour au premier plan:', err);
        }
      }
    });

    // Écouter les changements de statut en continu pour réagir aux actions système
    // (les boutons de la notification déclenchent automatiquement playAsync/pauseAsync)
    const intervalId = setInterval(async () => {
      if (soundRef.current) {
        try {
          const status = await soundRef.current.getStatusAsync();
          if (status.isLoaded) {
            // Synchroniser l'état de lecture si changé par les contrôles système
            if (status.isPlaying !== undefined && status.isPlaying !== isPlaying) {
              setIsPlaying(status.isPlaying);
              console.log('🔄 État de lecture mis à jour par les contrôles système:', status.isPlaying ? 'play' : 'pause');
            }
          }
        } catch (err) {
          // Ignorer les erreurs silencieusement
        }
      }
    }, 1000); // Vérifier toutes les secondes

    return () => {
      subscription.remove();
      clearInterval(intervalId);
    };
  }, [isPlaying]);

  // Configurer le listener de statut pour mettre à jour l'état en temps réel
  useEffect(() => {
    if (!soundRef.current) return;

    const statusUpdateHandler = (status: ExpoAV.AVPlaybackStatus) => {
      if (status.isLoaded) {
        // Synchroniser la position
        if (status.positionMillis !== undefined && status.positionMillis >= 0) {
          setCurrentTime(status.positionMillis / 1000);
        }
        
        // Synchroniser l'état de lecture (source de vérité)
        if (status.isPlaying !== undefined && status.isPlaying !== null) {
          setIsPlaying(status.isPlaying);
        }
        
        // Synchroniser la durée
        if (status.durationMillis !== undefined && status.durationMillis > 0) {
          setDuration(status.durationMillis / 1000);
        }
        
        // Gérer les erreurs
        if (status.error) {
          console.error('❌ Erreur de lecture:', status.error);
          setError(status.error);
          setIsPlaying(false);
          setIsLoading(false);
        }
        
        // Gérer la fin de lecture
        if (status.didJustFinish) {
          console.log('🏁 Audio terminé');
          const finishedPage = currentPageRef.current;

          if (isLoopingRef.current && finishedPage !== null) {
            // Relancer en boucle
            console.log('🔁 Relance en boucle pour la page', finishedPage);
            setTimeout(async () => {
              try {
                if (soundRef.current) {
                  await soundRef.current.replayAsync();
                  console.log('✅ Lecture en boucle relancée');
                }
              } catch (reloadErr) {
                console.error('❌ Erreur lors de la relance en boucle:', reloadErr);
                setIsPlaying(false);
                setIsLoading(false);
              }
            }, 200);
          } else {
            // Fin normale, arrêter
            setIsPlaying(false);
            setIsLoading(false);
            setCurrentTime(0);
            setCurrentPage(null);

            // Notifier l'éventuel callback externe
            if (onFinishedCallbackRef.current) {
              onFinishedCallbackRef.current(finishedPage ?? null);
            }
          }
        }
      } else if (status.error) {
        console.error('❌ Erreur de chargement:', status.error);
        setError(status.error);
        setIsPlaying(false);
        setIsLoading(false);
      }
    };

    soundRef.current.setOnPlaybackStatusUpdate(statusUpdateHandler);

    return () => {
      if (soundRef.current) {
        soundRef.current.setOnPlaybackStatusUpdate(null);
      }
    };
  }, []);

  // Nettoyer le sound quand le composant est démonté
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch((err) => {
          console.warn('⚠️ Erreur lors du déchargement du sound:', err);
        });
        soundRef.current = null;
      }
    };
  }, []);

  // Mettre à jour les refs
  useEffect(() => {
    isLoopingRef.current = isLooping;
  }, [isLooping]);

  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  /** surahNumber: 1-114 → 001.mp3 ... 114.mp3 */
  const getAudioFileUri = async (surahNumber: number, onDownloadRequest?: (surahNumber: number) => Promise<boolean>): Promise<string> => {
    if (surahNumber < 1 || surahNumber > 114) {
      throw new Error(`رقم السورة غير صحيح (1-114): ${surahNumber}`);
    }
    const formatted = surahNumber.toString().padStart(3, '0');
    
    // Essayer d'abord avec expo-asset
    if (hasAudioAsset(surahNumber)) {
      try {
        const assetModule = getAudioAsset(surahNumber);
        if (assetModule) {
          const asset = Asset.fromModule(assetModule);
          
          if (!asset.downloaded) {
            console.log('📥 Téléchargement de l\'asset audio...');
            await asset.downloadAsync();
          }
          
          if (asset.localUri) {
            console.log('✅ URI local de l\'asset:', asset.localUri);
            return asset.localUri;
          } else if (asset.uri) {
            console.log('✅ URI de l\'asset:', asset.uri);
            return asset.uri;
          }
        }
      } catch (err: any) {
        console.error('❌ Erreur avec expo-asset:', err);
      }
    }
    
    // Vérifier si le fichier est en cache
    const isCached = await isAudioFileCached(surahNumber);
    if (isCached) {
      const cachedUri = getCachedAudioUri(surahNumber);
      console.log('✅ Fichier audio trouvé en cache:', cachedUri);
      return cachedUri;
    }
    
    // Si le fichier n'est pas en cache, demander le téléchargement
    if (onDownloadRequest) {
      const shouldDownload = await onDownloadRequest(surahNumber);
      if (!shouldDownload) {
        throw new Error('Le téléchargement du fichier ZIP est requis pour lire les fichiers audio.');
      }
    }
    
    // Télécharger le ZIP et extraire les fichiers
    try {
      console.log('📥 Téléchargement et extraction du fichier ZIP...');
      const downloadedUri = await downloadAudioFile(surahNumber);
      console.log('✅ Fichier audio téléchargé et mis en cache:', downloadedUri);
      
      const fileExists = await isAudioFileCached(surahNumber);
      if (!fileExists) {
        throw new Error(`لا يوجد ملف صوتي متاح لهذه السورة (${formatted}.mp3)`);
      }
      
      return downloadedUri;
    } catch (downloadErr: any) {
      console.error('❌ Erreur lors du téléchargement du ZIP:', downloadErr);
      throw downloadErr;
    }
  };

  const play = async (surahNumber: number, onDownloadRequest?: (surahNumber: number) => Promise<boolean>) => {
    try {
      setError(null);
      if (surahNumber < 1 || surahNumber > 114) {
        throw new Error(`رقم السورة غير صحيح (1-114): ${surahNumber}`);
      }
      
      if (onDownloadRequest) {
        onDownloadRequestRef.current = onDownloadRequest;
      }

      // Si l'audio est déjà chargé pour cette sourate, reprendre la lecture
      if (soundRef.current && currentPage === surahNumber) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
          if (status.isPlaying) {
            console.log('ℹ️ Audio déjà en cours de lecture pour cette sourate');
            return;
          }
          
          // Reprendre la lecture
          console.log('▶️ Reprise de la lecture');
          setIsLoading(true);
          try {
            await soundRef.current.playAsync();
            setIsPlaying(true);
            setIsLoading(false);
            return;
          } catch (playErr: any) {
            console.warn('⚠️ Erreur lors de la reprise, recréation du sound:', playErr);
            // Continuer avec la création d'un nouveau sound
          }
        }
      }

      setIsLoading(true);

      // Arrêter l'audio précédent si c'est une autre sourate
      if (soundRef.current && currentPage !== surahNumber) {
        console.log('⏹️ Arrêt de l\'audio précédent (autre sourate)');
        try {
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        } catch (err: any) {
          console.warn('⚠️ Erreur lors de l\'arrêt de l\'audio précédent:', err);
        }
      }

      // Obtenir le chemin du fichier audio (001.mp3 ... 114.mp3)
      const audioUri = await getAudioFileUri(surahNumber, onDownloadRequest);
      console.log('🎵 URI audio:', audioUri);

      // Si c'est la même source et que le sound existe, reprendre
      if (soundRef.current && currentPage === surahNumber) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
          try {
            await soundRef.current.playAsync();
            setIsPlaying(true);
            setIsLoading(false);
            return;
          } catch (playErr: any) {
            console.warn('⚠️ Erreur lors de la reprise, recréation du sound:', playErr);
          }
        }
      }

      // Configurer le mode audio avec les meilleures options pour les contrôles système Android
      await ExpoAV.setAudioModeAsync({
        staysActiveInBackground: true,
        shouldDuckAndroid: false,
      });

      // Créer un nouveau sound expo-av
      console.log('🎵 Création du player expo-av...');
      
      const { sound } = await ExpoAV.Sound.createAsync(
        { uri: audioUri },
        {
          shouldPlay: true,
          isLooping: isLoopingRef.current,
          isMuted: false,
          volume: 1.0,
        }
      );

      // Configurer le listener de statut
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          if (status.positionMillis !== undefined && status.positionMillis >= 0) {
            setCurrentTime(status.positionMillis / 1000);
          }
          if (status.isPlaying !== undefined && status.isPlaying !== null) {
            setIsPlaying(status.isPlaying);
          }
          if (status.durationMillis !== undefined && status.durationMillis > 0) {
            setDuration(status.durationMillis / 1000);
          }
          if (status.error) {
            console.error('❌ Erreur de lecture:', status.error);
            setError(status.error);
            setIsPlaying(false);
            setIsLoading(false);
          }
          if (status.didJustFinish) {
            console.log('🏁 Audio terminé');
            const finishedPage = currentPageRef.current;
            if (isLoopingRef.current && currentPageRef.current !== null) {
              console.log('🔁 Relance en boucle pour la page', currentPageRef.current);
              setTimeout(async () => {
                try {
                  await sound.replayAsync();
                  console.log('✅ Lecture en boucle relancée');
                } catch (reloadErr) {
                  console.error('❌ Erreur lors de la relance en boucle:', reloadErr);
                  setIsPlaying(false);
                  setIsLoading(false);
                }
              }, 200);
            } else {
              setIsPlaying(false);
              setIsLoading(false);
              setCurrentTime(0);
              // Notifier l'éventuel callback externe
              if (onFinishedCallbackRef.current) {
                onFinishedCallbackRef.current(finishedPage ?? null);
              }
            }
          }
        } else if (status.error) {
          console.error('❌ Erreur de chargement:', status.error);
          setError(status.error);
          setIsPlaying(false);
          setIsLoading(false);
        }
      });

      soundRef.current = sound;
      setCurrentPage(surahNumber);
      setIsPlaying(true);
      setIsLoading(false);

      // Récupérer la durée initiale
      const status = await sound.getStatusAsync();
      if (status.isLoaded && status.durationMillis) {
        const durationSeconds = status.durationMillis / 1000;
        if (durationSeconds > 0) {
          setDuration(durationSeconds);
          console.log('✅ Durée récupérée:', durationSeconds.toFixed(2), 's');
        }
      }

      console.log('✅ Lecture démarrée avec succès');
    } catch (err: any) {
      console.error('❌ Erreur lors de la lecture:', err);
      setIsLoading(false);
      setIsPlaying(false);
      throw err;
    }
  };

  const pause = async () => {
    try {
      if (soundRef.current) {
        console.log('⏸️ Mise en pause de l\'audio');
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
        setIsLoading(false);
      } else {
        console.warn('⚠️ Impossible de mettre en pause: sound non disponible');
        setIsPlaying(false);
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error('❌ Erreur lors de la pause:', err);
      setError(err.message || 'Erreur lors de la pause');
      setIsPlaying(false);
      setIsLoading(false);
    }
  };

  const stop = async () => {
    try {
      console.log('⏹️ Arrêt de l\'audio');
      
      if (soundRef.current) {
        try {
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        } catch (unloadErr: any) {
          console.warn('⚠️ Erreur lors du déchargement du sound:', unloadErr);
        }
      }
      
      setIsPlaying(false);
      setCurrentPage(null);
      setIsLoading(false);
      setCurrentTime(0);
      setDuration(0);
      
      console.log('✅ Audio arrêté et état réinitialisé');
    } catch (err: any) {
      console.error('❌ Erreur lors de l\'arrêt:', err);
      setIsPlaying(false);
      setCurrentPage(null);
      setIsLoading(false);
      setCurrentTime(0);
      setDuration(0);
      if (soundRef.current) {
        try {
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        } catch (unloadErr) {
          // Ignorer
        }
      }
    }
  };

  const seek = async (time: number) => {
    try {
      if (duration > 0 && soundRef.current) {
        const seekTime = Math.max(0, Math.min(time, duration));
        console.log('⏩ Navigation vers:', seekTime, 'sur', duration);
        
        const seekTimeMillis = seekTime * 1000;
        await soundRef.current.setPositionAsync(seekTimeMillis);
        setCurrentTime(seekTime);
        console.log('✅ Seek réussi');
      } else {
        console.warn('⚠️ Impossible de naviguer: durée non chargée ou sound non disponible');
      }
    } catch (err: any) {
      console.error('❌ Erreur lors de la navigation:', err);
    }
  };

  const toggleLoop = async () => {
    const newValue = !isLooping;
    setIsLooping(newValue);
    isLoopingRef.current = newValue;
    console.log('🔁 Boucle', newValue ? 'activée' : 'désactivée');
    
    if (soundRef.current) {
      try {
        await soundRef.current.setIsLoopingAsync(newValue);
        console.log('✅ Boucle mise à jour sur le Sound');
      } catch (err) {
        console.warn('⚠️ Erreur lors de la mise à jour de la boucle:', err);
      }
    }
  };

  const setOnFinished = (callback: (pageNumber: number | null) => void) => {
    onFinishedCallbackRef.current = callback;
  };

  return {
    isPlaying,
    isLoading,
    error,
    play,
    pause,
    stop,
    seek,
    currentPage,
    currentTime,
    duration,
    isLooping,
    toggleLoop,
    setOnFinished,
  };
};
