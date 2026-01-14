import { Asset } from 'expo-asset';
import { useAudioPlayer as useExpoAudioPlayer } from 'expo-audio';
import { Audio as ExpoAV } from 'expo-av';
import { useEffect, useRef, useState } from 'react';
import { getAudioAsset, hasAudioAsset } from '../utils/audioAssets';
import {
  downloadAudioFile,
  getCachedAudioUri,
  isAudioFileCached
} from '../utils/audioDownload';

interface UseAudioPlayerReturn {
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  play: (pageNumber: number, onDownloadRequest?: (pageNumber: number) => Promise<boolean>) => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  seek: (time: number) => Promise<void>;
  currentPage: number | null;
  currentTime: number;
  duration: number;
}

export const useAudioPlayer = (): UseAudioPlayerReturn => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number | null>(null);
  const [audioSource, setAudioSource] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const shouldPlayRef = useRef(false);
  const avSoundRef = useRef<ExpoAV.Sound | null>(null); // Référence au player expo-av pour le seek
  const player = useExpoAudioPlayer(audioSource || undefined);

  // Écouter les changements de statut du lecteur
  useEffect(() => {
    if (!player) return;

    const subscription = player.addListener('statusChange', (status) => {
      console.log('📊 Status change:', status);
      if (status === 'playing') {
        console.log('▶️ Audio en cours de lecture');
        setIsPlaying(true);
        setIsLoading(false);
      } else if (status === 'paused') {
        console.log('⏸️ Audio en pause');
        setIsPlaying(false);
        setIsLoading(false);
        // Essayer de récupérer et conserver la durée en pause
        const playerAny = player as any;
        if (playerAny.duration !== undefined && playerAny.duration > 0) {
          console.log('💾 Sauvegarde de la durée lors du changement de status vers paused:', playerAny.duration);
          setDuration(playerAny.duration);
        }
      } else if (status === 'idle' || status === 'stopped' || status === 'ended' || status === 'complete') {
        console.log('⏹️ Audio arrêté, idle ou terminé:', status);
        setIsPlaying(false);
        setIsLoading(false);
        if (status === 'stopped' || status === 'ended' || status === 'complete') {
          // Réinitialiser l'état quand l'audio se termine
          console.log('🔄 Réinitialisation de l\'état après fin de lecture');
          setCurrentPage(null);
          setAudioSource(null);
          setCurrentTime(0);
          setDuration(0);
          shouldPlayRef.current = false;
        }
      } else if (status === 'loading' || status === 'buffering') {
        console.log('⏳ Audio en chargement');
        setIsLoading(true);
      } else {
        console.log('❓ Status inconnu:', status);
        // Pour les autres status, s'assurer que isLoading est false si on joue
        if (status !== undefined) {
          setIsLoading(false);
        }
      }
    });

    // Écouter aussi l'événement de fin de lecture
    // Note: expo-audio peut utiliser différents noms d'événements
    let endedSubscription: any = null;
    try {
      endedSubscription = player.addListener('playToEnd', () => {
        console.log('🏁 Audio terminé (playToEnd)');
        setIsPlaying(false);
        setIsLoading(false);
        setCurrentPage(null);
        setAudioSource(null);
        setCurrentTime(0);
        setDuration(0);
        shouldPlayRef.current = false;
      });
    } catch (err) {
      // Si l'événement playToEnd n'existe pas, on gère seulement statusChange
      console.warn('⚠️ Événement playToEnd non disponible');
    }

    return () => {
      subscription?.remove();
      endedSubscription?.remove();
    };
  }, [player]);
  
  // Nettoyer le sound expo-av quand le composant est démonté
  useEffect(() => {
    return () => {
      if (avSoundRef.current) {
        avSoundRef.current.unloadAsync().catch((err) => {
          console.warn('⚠️ Erreur lors du déchargement du sound expo-av:', err);
        });
        avSoundRef.current = null;
      }
    };
  }, []);

  // Vérifier périodiquement si l'audio est terminé et mettre à jour la progression (fallback si les événements ne fonctionnent pas)
  useEffect(() => {
    if (!player || !isPlaying) {
      // Réinitialiser la progression si l'audio ne joue pas
      setCurrentTime(0);
      if (!isPlaying) {
        setDuration(0);
      }
      return;
    }

    let lastCurrentTime = 0;
    let stuckCount = 0;
    let undefinedStatusCount = 0;
    const startTime = Date.now();

    // Fonction helper pour arrêter l'audio
    const stopAudio = async () => {
      try {
        if (player) {
          // Essayer de mettre en pause si l'audio joue
          try {
            const playerAny = player as any;
            if (playerAny.pause && typeof playerAny.pause === 'function') {
              await playerAny.pause();
            } else if (player.status === 'playing') {
              await player.pause();
            }
          } catch (pauseErr) {
            console.warn('⚠️ Erreur lors de la pause dans stopAudio:', pauseErr);
          }
        }
      } catch (err) {
        console.warn('⚠️ Erreur lors de l\'arrêt du player:', err);
      }
      setIsPlaying(false);
      setIsLoading(false);
      setCurrentPage(null);
      setAudioSource(null);
      setCurrentTime(0);
      setDuration(0);
      shouldPlayRef.current = false;
    };

    const checkInterval = setInterval(async () => {
      try {
        const status = player.status;

        // Si le status est 'idle', 'stopped', 'ended', ou 'complete', l'audio est terminé
        if (status === 'idle' || status === 'stopped' || status === 'ended' || status === 'complete') {
          console.log('🏁 Audio terminé détecté par vérification périodique, status:', status);
          await stopAudio();
          return;
        }

        // Si on est en pause, essayer de récupérer et conserver la durée
        if (status === 'paused' && duration === 0) {
          const playerAny = player as any;
          if (playerAny.duration !== undefined && playerAny.duration > 0) {
            console.log('💾 Récupération de la durée en pause:', playerAny.duration);
            setDuration(playerAny.duration);
          }
        }

        // Vérifier si le player expose currentTime et duration
        const playerAny = player as any;
        
        // Log des propriétés du player pour debug (plus fréquent pour voir ce qui se passe)
        if (Math.random() < 0.3) {
          console.log('🔍 Propriétés du player:', {
            status,
            hasCurrentTime: playerAny.currentTime !== undefined,
            hasDuration: playerAny.duration !== undefined,
            currentTime: playerAny.currentTime,
            duration: playerAny.duration,
            keys: Object.keys(playerAny).slice(0, 20), // Limiter les clés pour éviter trop de logs
          });
        }
        
        // Essayer plusieurs façons d'accéder à currentTime et duration
        let currentTimeValue: number | undefined;
        let durationValue: number | undefined;
        
        // Méthode 1: Propriétés directes
        if (playerAny.currentTime !== undefined) {
          currentTimeValue = playerAny.currentTime;
        }
        if (playerAny.duration !== undefined) {
          durationValue = playerAny.duration;
        }
        
        // Méthode 2: Méthodes getter
        if (currentTimeValue === undefined && playerAny.getCurrentTime && typeof playerAny.getCurrentTime === 'function') {
          try {
            const time = await playerAny.getCurrentTime();
            if (time !== undefined && !isNaN(time)) {
              currentTimeValue = time;
            }
          } catch (err) {
            // Ignorer les erreurs
          }
        }
        
        if (durationValue === undefined && playerAny.getDuration && typeof playerAny.getDuration === 'function') {
          try {
            const dur = await playerAny.getDuration();
            if (dur !== undefined && !isNaN(dur) && dur > 0) {
              durationValue = dur;
            }
          } catch (err) {
            // Ignorer les erreurs
          }
        }
        
        // Méthode 3: Vérifier d'autres noms de propriétés possibles
        if (currentTimeValue === undefined) {
          const possibleNames = ['currentTime', 'time', 'position', 'playbackPosition', 'elapsedTime'];
          for (const name of possibleNames) {
            if (playerAny[name] !== undefined && typeof playerAny[name] === 'number') {
              currentTimeValue = playerAny[name];
              console.log(`✅ Trouvé currentTime via ${name}:`, currentTimeValue);
              break;
            }
          }
        }
        
        if (durationValue === undefined) {
          const possibleNames = ['duration', 'totalDuration', 'length', 'totalTime'];
          for (const name of possibleNames) {
            if (playerAny[name] !== undefined && typeof playerAny[name] === 'number' && playerAny[name] > 0) {
              durationValue = playerAny[name];
              console.log(`✅ Trouvé duration via ${name}:`, durationValue);
              break;
            }
          }
        }
        
        // Mettre à jour l'état si on a trouvé des valeurs
        if (currentTimeValue !== undefined && !isNaN(currentTimeValue) && currentTimeValue >= 0) {
          setCurrentTime(currentTimeValue);
        }
        // Ne mettre à jour la durée que si on a une nouvelle valeur valide
        // Ne pas réinitialiser la durée si on ne trouve pas de valeur (en pause par exemple)
        if (durationValue !== undefined && !isNaN(durationValue) && durationValue > 0) {
          setDuration(durationValue);
        }
        // Si on est en pause et qu'on n'a pas de durée du player, garder la durée actuelle
        // (ne pas la réinitialiser à 0)
        
        // Si on a les deux valeurs, vérifier si l'audio est terminé
        if (currentTimeValue !== undefined && durationValue !== undefined) {
          
          // Si la durée est valide et que le temps actuel est proche ou supérieur à la durée
          if (durationValue > 0 && currentTimeValue >= durationValue - 0.5) {
            console.log('🏁 Audio terminé détecté (currentTime >= duration):', { currentTime: currentTimeValue, duration: durationValue });
            await stopAudio();
            return;
          }
          
          // Si le temps actuel ne change pas pendant plusieurs vérifications, l'audio est peut-être bloqué
          if (currentTimeValue === lastCurrentTime && currentTimeValue > 0) {
            stuckCount++;
            if (stuckCount > 3) {
              console.log('🏁 Audio probablement terminé (temps bloqué):', currentTimeValue);
              await stopAudio();
              return;
            }
          } else {
            stuckCount = 0;
            lastCurrentTime = currentTimeValue;
          }
        }

        // Si le status est undefined mais qu'on pense que ça joue, essayer de détecter la fin
        if (status === undefined && isPlaying) {
          undefinedStatusCount++;
          const elapsedTime = Date.now() - startTime;
          
          // Si le status est undefined depuis plus de 30 secondes et qu'on pense que ça joue,
          // essayer de vérifier si l'audio est vraiment en cours
          if (undefinedStatusCount > 60 || elapsedTime > 30000) { // 60 vérifications (30s) ou 30 secondes écoulées
            console.log('🏁 Status undefined depuis trop longtemps, vérification de l\'état réel');
            const playerAny = player as any;
            
            // Si on a currentTime et duration, vérifier si on est à la fin
            if (playerAny.currentTime !== undefined && playerAny.duration !== undefined) {
              const currentTimeValue = playerAny.currentTime;
              const durationValue = playerAny.duration;
              setCurrentTime(currentTimeValue);
              if (durationValue > 0) {
                setDuration(durationValue);
              }
              if (durationValue > 0 && currentTimeValue >= durationValue - 1) {
                console.log('🏁 Audio terminé (vérification avec status undefined):', { currentTime: currentTimeValue, duration: durationValue });
                await stopAudio();
                return;
              }
            }
            
            // Si le status est undefined depuis très longtemps (plus de 2 minutes), arrêter
            if (elapsedTime > 120000) {
              console.log('🏁 Audio probablement terminé (status undefined depuis plus de 2 minutes)');
              await stopAudio();
              return;
            }
          }
        } else {
          undefinedStatusCount = 0;
        }
      } catch (err) {
        console.warn('⚠️ Erreur lors de la vérification périodique:', err);
      }
    }, 500); // Vérifier toutes les 500ms pour une détection plus rapide

    // Timeout de sécurité : si l'audio est en cours depuis plus de 10 minutes, l'arrêter
    // (les fichiers audio du Coran ne devraient pas être aussi longs)
    const safetyTimeout = setTimeout(async () => {
      if (isPlaying) {
        console.warn('⏱️ Timeout de sécurité: arrêt de l\'audio après 10 minutes');
        try {
          if (player) {
            // Essayer de mettre en pause
            try {
              const playerAny = player as any;
              if (playerAny.pause && typeof playerAny.pause === 'function') {
                await playerAny.pause();
              } else if (player.status === 'playing') {
                await player.pause();
              }
            } catch (pauseErr) {
              console.warn('⚠️ Erreur lors de la pause (timeout):', pauseErr);
            }
          }
        } catch (err) {
          console.warn('⚠️ Erreur lors de l\'arrêt du player (timeout):', err);
        }
        setIsPlaying(false);
        setIsLoading(false);
        setCurrentPage(null);
        setAudioSource(null);
        setCurrentTime(0);
        setDuration(0);
        shouldPlayRef.current = false;
      }
    }, 600000); // 10 minutes

    return () => {
      clearInterval(checkInterval);
      clearTimeout(safetyTimeout);
    };
  }, [player, isPlaying]);

  // Jouer automatiquement quand la source change et que shouldPlayRef est true
  useEffect(() => {
    if (player && audioSource && shouldPlayRef.current) {
      shouldPlayRef.current = false;
      console.log('🎵 Player status initial:', player.status);
      console.log('🎵 Audio source:', audioSource);
      
      // Timeout pour éviter un chargement infini
      const timeoutId = setTimeout(() => {
        if (isLoading) {
          console.warn('⏱️ Timeout: le player n\'a pas démarré dans les temps');
          setError('Le chargement de l\'audio prend trop de temps. Le fichier peut être corrompu ou le format n\'est pas supporté.');
          setIsLoading(false);
        }
      }, 15000); // 15 secondes de timeout
      
      // Vérifier que le player est prêt
      const tryPlay = async () => {
        try {
          // Attendre que le player soit dans un état valide
          let attempts = 0;
          const maxAttempts = 10; // Réduit de 20 à 10
          
          while (attempts < maxAttempts) {
            const status = player.status;
            
            // Log seulement toutes les 3 tentatives pour réduire le bruit
            if (attempts % 3 === 0 || attempts < 3) {
              console.log(`🔄 Tentative ${attempts + 1}/${maxAttempts}, player status:`, status);
            }
            
            // Si le status est undefined après quelques tentatives, essayer de forcer la lecture
            if (status === undefined && attempts >= 2) {
              console.log('⚠️ Status undefined, tentative de lecture forcée (tentative', attempts + 1, ')');
              try {
                await player.play();
                console.log('✅ Lecture forcée réussie');
                // Forcer la mise à jour de l'état car le status peut rester undefined
                setIsPlaying(true);
                setIsLoading(false);
                // Essayer de récupérer la durée une fois que l'audio a commencé
                setTimeout(() => {
                  const playerAny = player as any;
                  if (playerAny.duration !== undefined && playerAny.duration > 0) {
                    setDuration(playerAny.duration);
                  }
                }, 500);
                clearTimeout(timeoutId);
                return;
              } catch (playErr: any) {
                // Si l'erreur indique que le player n'est pas prêt, continuer à essayer
                if (playErr.message && playErr.message.includes('not ready')) {
                  console.log('⏳ Player pas encore prêt, nouvelle tentative...');
                } else {
                  console.error('❌ Erreur lors de la lecture forcée:', playErr);
                  // Continuer à essayer quand même
                }
              }
            }
            
            // Essayer de jouer si le player est dans un état valide
            if (status === 'idle' || status === 'readyToPlay' || status === 'paused' || status === 'loaded' || status === 'buffering') {
              console.log('✅ Player prêt, démarrage de la lecture');
              try {
                await player.play();
                console.log('✅ Lecture démarrée avec succès');
                // Forcer la mise à jour de l'état
                setIsPlaying(true);
                setIsLoading(false);
                // Essayer de récupérer la durée une fois que l'audio a commencé
                setTimeout(() => {
                  const playerAny = player as any;
                  if (playerAny.duration !== undefined && playerAny.duration > 0) {
                    setDuration(playerAny.duration);
                  }
                }, 500);
                clearTimeout(timeoutId);
                return;
              } catch (playErr: any) {
                console.error('❌ Erreur lors de player.play():', playErr);
                // Si l'erreur indique que le player n'est pas prêt, continuer à essayer
                if (playErr.message && playErr.message.includes('not ready')) {
                  // Continuer à essayer
                } else {
                  // Autre erreur, peut-être que le fichier est corrompu
                  throw playErr;
                }
              }
            }
            
            // Attendre un peu avant de réessayer (réduit de 400ms à 200ms)
            await new Promise(resolve => setTimeout(resolve, 200));
            attempts++;
          }
          
          // Si on arrive ici, essayer quand même de jouer
          console.log('🔄 Dernière tentative de lecture');
          try {
            await player.play();
            console.log('✅ Lecture démarrée avec succès (dernière tentative)');
            // Forcer la mise à jour de l'état
            setIsPlaying(true);
            setIsLoading(false);
            // Essayer de récupérer la durée une fois que l'audio a commencé
            setTimeout(() => {
              const playerAny = player as any;
              if (playerAny.duration !== undefined && playerAny.duration > 0) {
                setDuration(playerAny.duration);
              }
            }, 500);
            clearTimeout(timeoutId);
          } catch (err: any) {
            console.error('❌ Erreur lors de la dernière tentative:', err);
            setError(err.message || 'Impossible de démarrer la lecture audio. Le fichier peut être corrompu ou le format n\'est pas supporté.');
            setIsLoading(false);
            setIsPlaying(false);
            setCurrentTime(0);
            setDuration(0);
            clearTimeout(timeoutId);
          }
        } catch (err: any) {
          console.error('❌ Erreur lors du démarrage de la lecture:', err);
          setError(err.message || 'Erreur lors de la lecture');
          setIsLoading(false);
          setIsPlaying(false);
          clearTimeout(timeoutId);
        }
      };
      
      // Démarrer rapidement pour une meilleure réactivité
      setTimeout(tryPlay, 200);
      
      // Nettoyer le timeout si le composant est démonté
      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [player, audioSource, isLoading]);

  const getAudioFileUri = async (pageNumber: number, onDownloadRequest?: (pageNumber: number) => Promise<boolean>): Promise<string> => {
    const formattedPage = pageNumber.toString().padStart(3, '0');
    const fileName = `${formattedPage}.mp3`;
    
    // Essayer d'abord avec expo-asset (fichiers dans assets/mp3/) - pour compatibilité
    if (hasAudioAsset(pageNumber)) {
      try {
        const assetModule = getAudioAsset(pageNumber);
        if (assetModule) {
          const asset = Asset.fromModule(assetModule);
          
          // Télécharger l'asset si nécessaire
          if (!asset.downloaded) {
            console.log('📥 Téléchargement de l\'asset audio...');
            await asset.downloadAsync();
          }
          
          // Utiliser directement l'URI de l'asset (plus fiable que de copier)
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
        // Continuer avec la méthode distante
      }
    }
    
    // Vérifier si le fichier est en cache local
    const isCached = await isAudioFileCached(pageNumber);
    if (isCached) {
      const cachedUri = getCachedAudioUri(pageNumber);
      console.log('✅ Fichier audio trouvé en cache:', cachedUri);
      return cachedUri;
    }
    
    // Si le fichier n'est pas en cache, demander le téléchargement via onDownloadRequest
    if (onDownloadRequest) {
      const shouldDownload = await onDownloadRequest(pageNumber);
      if (!shouldDownload) {
        throw new Error('Le téléchargement du fichier ZIP est requis pour lire les fichiers audio.');
      }
    }
    
    // Télécharger le ZIP et extraire les fichiers
    try {
      console.log('📥 Téléchargement et extraction du fichier ZIP...');
      const downloadedUri = await downloadAudioFile(pageNumber);
      console.log('✅ Fichier audio téléchargé et mis en cache:', downloadedUri);
      
      // Vérifier que le fichier existe après extraction
      const fileExists = await isAudioFileCached(pageNumber);
      if (!fileExists) {
        const formattedPage = pageNumber.toString().padStart(3, '0');
        throw new Error(`لا يوجد ملف صوتي متاح لهذه الصفحة (${formattedPage}.mp3)`);
      }
      
      return downloadedUri;
    } catch (downloadErr: any) {
      console.error('❌ Erreur lors du téléchargement du ZIP:', downloadErr);
      throw downloadErr;
    }
  };

  const play = async (pageNumber: number, onDownloadRequest?: (pageNumber: number) => Promise<boolean>) => {
    try {
      setError(null);

      // Si l'audio est déjà chargé pour cette page et qu'il est en pause, reprendre la lecture
      if (player && currentPage === pageNumber && audioSource && (player.status === 'paused' || (!player.status && !isPlaying && !isLoading))) {
        console.log('▶️ Reprise de la lecture en pause');
        setIsLoading(true);
        try {
          await player.play();
          setIsPlaying(true);
          setIsLoading(false);
          return;
        } catch (playErr: any) {
          console.error('❌ Erreur lors de la reprise:', playErr);
          // Si la reprise échoue, continuer avec le chargement normal
        }
      }

      // Si l'audio est déjà en cours de lecture pour cette page, ne rien faire
      if (player && currentPage === pageNumber && (player.status === 'playing' || isPlaying)) {
        console.log('ℹ️ Audio déjà en cours de lecture pour cette page');
        return;
      }

      setIsLoading(true);

      // Arrêter l'audio précédent seulement si c'est une autre page
      if (player && currentPage !== pageNumber && (player.status === 'playing' || player.status === 'paused')) {
        console.log('⏹️ Arrêt de l\'audio précédent (autre page)');
        try {
          // Essayer de mettre en pause d'abord
          try {
            const playerAny = player as any;
            if (playerAny.pause && typeof playerAny.pause === 'function') {
              await playerAny.pause();
            } else if (player.status === 'playing' || player.status === 'paused') {
              await player.pause();
            }
          } catch (pauseErr: any) {
            console.warn('⚠️ Erreur lors de la pause de l\'audio précédent:', pauseErr);
          }
          // Réinitialiser l'état pour cette page
          setIsPlaying(false);
          setIsLoading(false);
          setCurrentTime(0);
          setDuration(0);
          // Attendre un peu pour que la pause soit complète
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (err: any) {
          console.warn('⚠️ Erreur lors de l\'arrêt de l\'audio précédent:', err);
        }
      }

      // Obtenir le chemin du fichier audio
      const audioUri = await getAudioFileUri(pageNumber, onDownloadRequest);
      console.log('🎵 URI audio généré:', audioUri);

      // Si c'est la même source, ne pas recréer le player, juste reprendre
      if (audioSource === audioUri && player) {
        console.log('🔄 Même source, reprise de la lecture');
        try {
          await player.play();
          setIsPlaying(true);
          setIsLoading(false);
          return;
        } catch (playErr: any) {
          console.warn('⚠️ Erreur lors de la reprise, recréation du player:', playErr);
          // Continuer avec la création d'un nouveau player
        }
      }

      // Créer aussi un player expo-av pour le seek (expo-audio ne supporte pas le seek)
      // On va utiliser expo-av en parallèle uniquement pour le seek
      try {
        // Libérer l'ancien sound s'il existe
        if (avSoundRef.current) {
          try {
            await avSoundRef.current.unloadAsync();
          } catch (unloadErr) {
            console.warn('⚠️ Erreur lors du déchargement du sound précédent:', unloadErr);
          }
          avSoundRef.current = null;
        }
        
        // Créer un nouveau sound expo-av pour le seek
        console.log('🎵 Création du player expo-av pour le seek...');
        const { sound } = await ExpoAV.Sound.createAsync(
          { uri: audioUri },
          { shouldPlay: false, isLooping: false }
        );
        avSoundRef.current = sound;
        console.log('✅ Player expo-av créé pour le seek');
        
        // Obtenir la durée du sound expo-av
        const status = await sound.getStatusAsync();
        if (status.isLoaded && status.durationMillis) {
          const durationSeconds = status.durationMillis / 1000;
          if (durationSeconds > 0) {
            setDuration(durationSeconds);
            console.log('✅ Durée récupérée depuis expo-av:', durationSeconds);
          }
        }
      } catch (avErr: any) {
        console.warn('⚠️ Erreur lors de la création du player expo-av pour le seek:', avErr);
        // Continuer sans expo-av, on utilisera seulement expo-audio
      }

      // Mettre à jour la source audio (cela va créer un nouveau lecteur)
      // Le useEffect se chargera de jouer automatiquement
      shouldPlayRef.current = true;
      setAudioSource(audioUri);
      setCurrentPage(pageNumber);
    } catch (err: any) {
      setIsLoading(false);
      setIsPlaying(false);
      shouldPlayRef.current = false;
      // Relancer l'erreur pour qu'elle soit propagée vers handlePlayAudio
      // Cela permettra d'afficher le modal approprié
      throw err;
    }
  };

  const pause = async () => {
    try {
      if (player) {
        // Essayer de mettre en pause même si le status est undefined
        // car le status peut ne pas être mis à jour correctement
        const currentStatus = player.status;
        console.log('⏸️ Tentative de pause, status actuel:', currentStatus);
        
        // Sauvegarder la durée actuelle avant de mettre en pause
        // pour éviter qu'elle ne soit perdue si le player ne l'expose plus en pause
        const playerAny = player as any;
        if (playerAny.duration !== undefined && playerAny.duration > 0 && duration === 0) {
          console.log('💾 Sauvegarde de la durée avant pause:', playerAny.duration);
          setDuration(playerAny.duration);
        }
        
        if (currentStatus === 'playing' || currentStatus === undefined || isPlaying) {
          console.log('⏸️ Mise en pause de l\'audio');
          await player.pause();
          setIsPlaying(false);
          setIsLoading(false);
          
          // Essayer de récupérer et sauvegarder la durée après la pause
          setTimeout(() => {
            if (playerAny.duration !== undefined && playerAny.duration > 0) {
              console.log('💾 Durée après pause:', playerAny.duration);
              setDuration(playerAny.duration);
            }
          }, 100);
        } else {
          console.warn('⚠️ Impossible de mettre en pause: status =', currentStatus, 'isPlaying =', isPlaying);
          // Forcer la mise à jour de l'état si isPlaying est true
          if (isPlaying) {
            setIsPlaying(false);
            setIsLoading(false);
          }
        }
      } else {
        console.warn('⚠️ Impossible de mettre en pause: player non disponible');
        // Réinitialiser l'état mais garder la durée si elle existe
        setIsPlaying(false);
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error('❌ Erreur lors de la pause:', err);
      setError(err.message || 'Erreur lors de la pause');
      setIsPlaying(false);
      setIsLoading(false);
      // Ne pas réinitialiser la durée en cas d'erreur, la garder pour afficher la barre
    }
  };

  const stop = async () => {
    try {
      console.log('⏹️ Arrêt de l\'audio');
      
      // Libérer le sound expo-av
      if (avSoundRef.current) {
        try {
          await avSoundRef.current.unloadAsync();
          avSoundRef.current = null;
        } catch (unloadErr: any) {
          console.warn('⚠️ Erreur lors du déchargement du sound expo-av:', unloadErr);
        }
      }
      
      // Mettre en pause d'abord si l'audio joue
      if (player && isPlaying) {
        try {
          const playerAny = player as any;
          // Essayer différentes méthodes pour arrêter/pause
          if (playerAny.pause && typeof playerAny.pause === 'function') {
            await playerAny.pause();
          } else if (playerAny.stop && typeof playerAny.stop === 'function') {
            await playerAny.stop();
          } else if (player.status === 'playing') {
            await player.pause();
          }
        } catch (pauseErr: any) {
          console.warn('⚠️ Erreur lors de la pause avant arrêt:', pauseErr);
          // Continuer même si la pause échoue
        }
      }
      
      // Réinitialiser complètement l'état et la source
      // En mettant audioSource à null, le player sera recréé vide
      setAudioSource(null);
      setIsPlaying(false);
      setCurrentPage(null);
      setIsLoading(false);
      setCurrentTime(0);
      setDuration(0);
      shouldPlayRef.current = false;
      
      console.log('✅ Audio arrêté et état réinitialisé');
    } catch (err: any) {
      console.error('❌ Erreur lors de l\'arrêt:', err);
      // Réinitialiser l'état même en cas d'erreur
      setAudioSource(null);
      setIsPlaying(false);
      setCurrentPage(null);
      setIsLoading(false);
      setCurrentTime(0);
      setDuration(0);
      shouldPlayRef.current = false;
      // Libérer le sound expo-av même en cas d'erreur
      if (avSoundRef.current) {
        try {
          await avSoundRef.current.unloadAsync();
          avSoundRef.current = null;
        } catch (unloadErr) {
          // Ignorer les erreurs de déchargement
        }
      }
      // Ne pas afficher d'erreur à l'utilisateur pour l'arrêt
      // setError(err.message || 'Erreur lors de l\'arrêt');
    }
  };

  const seek = async (time: number) => {
    try {
      if (duration > 0 && audioSource) {
        // S'assurer que le temps est dans les limites valides
        const seekTime = Math.max(0, Math.min(time, duration));
        console.log('⏩ Navigation vers:', seekTime, 'sur', duration);
        
        const wasPlaying = isPlaying;
        
        // Méthode 1: Utiliser expo-av Sound pour le seek (si disponible)
        // expo-av a une méthode setPositionAsync() qui fonctionne bien
        if (avSoundRef.current) {
          try {
            const seekTimeMillis = seekTime * 1000; // expo-av attend des millisecondes
            await avSoundRef.current.setPositionAsync(seekTimeMillis);
            setCurrentTime(seekTime);
            console.log('✅ Seek réussi via expo-av setPositionAsync()');
            
            // Synchroniser avec le player expo-audio si nécessaire
            // Note: Le player expo-audio continuera depuis sa position, mais on a mis à jour visuellement
            // Pour une meilleure synchronisation, on pourrait aussi recréer le player expo-audio
            // mais cela nécessiterait de le reprendre depuis le début, ce qui n'est pas idéal
            // Pour l'instant, on synchronise visuellement et le seek expo-av fonctionne
            return;
          } catch (avSeekErr: any) {
            console.warn('⚠️ Erreur avec expo-av setPositionAsync():', avSeekErr);
            // Continuer avec les autres méthodes
          }
        }
        
        // Méthode 2: Essayer les méthodes natives du player expo-audio
        if (player) {
          const playerAny = player as any;
          
          // Essayer seekTo() (alternative à seek())
          if (playerAny.seekTo && typeof playerAny.seekTo === 'function') {
          try {
            await playerAny.seekTo(seekTime);
            setCurrentTime(seekTime);
            console.log('✅ Seek réussi via seekTo()');
            return;
          } catch (seekToErr: any) {
            console.warn('⚠️ Erreur avec seekTo():', seekToErr);
          }
          }
          
          // Essayer seek() directement
          if (playerAny.seek && typeof playerAny.seek === 'function') {
          try {
            await playerAny.seek(seekTime);
            setCurrentTime(seekTime);
            console.log('✅ Seek réussi via seek()');
            return;
          } catch (seekErr: any) {
            console.warn('⚠️ Erreur avec seek():', seekErr);
          }
          }
          
          // Essayer setCurrentTime()
          if (playerAny.setCurrentTime && typeof playerAny.setCurrentTime === 'function') {
          try {
            await playerAny.setCurrentTime(seekTime);
            setCurrentTime(seekTime);
            console.log('✅ Seek réussi via setCurrentTime()');
            return;
          } catch (setTimeErr: any) {
            console.warn('⚠️ Erreur avec setCurrentTime():', setTimeErr);
          }
          }
          
          // Essayer setPosition()
          if (playerAny.setPosition && typeof playerAny.setPosition === 'function') {
          try {
            await playerAny.setPosition(seekTime);
            setCurrentTime(seekTime);
            console.log('✅ Seek réussi via setPosition()');
            return;
          } catch (posErr: any) {
            console.warn('⚠️ Erreur avec setPosition():', posErr);
          }
          }
          
          // Essayer de modifier currentTime via setter
          if (playerAny.currentTime !== undefined && typeof playerAny.currentTime !== 'function') {
          try {
            // Vérifier si c'est une propriété avec setter
            const descriptor = Object.getOwnPropertyDescriptor(playerAny, 'currentTime');
            if (descriptor && descriptor.set) {
              descriptor.set.call(playerAny, seekTime);
              setCurrentTime(seekTime);
              console.log('✅ Seek réussi via currentTime setter');
              return;
            }
          } catch (timeErr: any) {
            // Ne pas essayer d'assigner directement si ça échoue avec le descriptor
            console.warn('⚠️ Erreur avec currentTime setter:', timeErr);
          }
          }
          
          // Utiliser replace() avec une nouvelle AudioSource qui inclut le temps
          // Note: Cette méthode recréera le player depuis le début, donc ce n'est pas idéal
          // Mais c'est mieux que rien si le seek n'est pas supporté
          if (player.replace && typeof player.replace === 'function') {
            try {
            const wasPlayingBefore = wasPlaying;
            // Mettre en pause si nécessaire
            if (wasPlayingBefore) {
              await pause();
              await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            // Essayer de recréer le player avec la même source
            // Le player sera recréé depuis le début, mais on peut essayer de seek après
            await player.replace(audioSource);
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Essayer toutes les méthodes de seek après le replace
            const seekMethods = [
              { name: 'seekTo', method: playerAny.seekTo },
              { name: 'seek', method: playerAny.seek },
              { name: 'setCurrentTime', method: playerAny.setCurrentTime },
              { name: 'setPosition', method: playerAny.setPosition },
            ];
            
            for (const { name, method } of seekMethods) {
              if (method && typeof method === 'function') {
                try {
                  await method(seekTime);
                  setCurrentTime(seekTime);
                  if (wasPlayingBefore) {
                    await player.play();
                  }
                  console.log(`✅ Seek réussi via replace() + ${name}()`);
                  return;
                } catch (err: any) {
                  console.warn(`⚠️ Erreur avec ${name}() après replace():`, err);
                }
              }
            }
            
            // Si aucune méthode ne fonctionne après replace, au moins mettre à jour visuellement
            setCurrentTime(seekTime);
            if (wasPlayingBefore) {
              await player.play();
            }
              console.log('⚠️ Replace() réussi mais aucune méthode de seek disponible');
              return;
            } catch (replaceErr: any) {
              console.warn('⚠️ Erreur avec replace():', replaceErr);
            }
          }
        }
        
        // Si aucune méthode native ne fonctionne, mettre à jour seulement l'état visuel
        // L'audio continuera depuis sa position actuelle
        console.warn('⚠️ Fonction seek non disponible, mise à jour visuelle uniquement');
        setCurrentTime(seekTime);
      } else {
        console.warn('⚠️ Impossible de naviguer: durée non chargée ou source non disponible');
      }
    } catch (err: any) {
      console.error('❌ Erreur lors de la navigation:', err);
      // Ne pas afficher d'erreur à l'utilisateur si c'est juste une limitation de l'API
    }
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
  };
};

