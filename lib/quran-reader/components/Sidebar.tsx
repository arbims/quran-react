import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Alert, Animated, FlatList, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { ARABIC_FONT, SIDEBAR_WIDTH } from '../constants';
import { findPageIndexForSurah, reversedQuranPages } from '../utils';
import { hasAudioAsset } from '../utils/audioAssets';

interface SidebarProps {
  slideAnim: Animated.Value;
  currentPage: number;
  surahListVisible: boolean;
  landscapeEnabled: boolean;
  lastReadPage: number | null;
  hifdhPage: number | null;
  insets: { top: number; bottom: number };
  flatListRef: React.RefObject<any>;
  onSaveReading: () => void;
  onSaveHifdh: () => void;
  onJumpToPage: (page: number | null) => void;
  onGoToPageInput: () => void;
  onSetSurahListVisible: (visible: boolean) => void;
  onSetLandscapeEnabled: (enabled: boolean) => void;
  onSetCurrentPage: (page: number) => void;
  onSetCurrentPageIndex: (index: number) => void;
  onToggleMenu: () => void;
  onPlayAudio: (page: number) => void;
  onPauseAudio: () => void;
  onStopAudio: () => void;
  isAudioPlaying: boolean;
  isAudioLoading: boolean;
  audioError: string | null;
}


export const Sidebar: React.FC<SidebarProps> = ({
  slideAnim,
  currentPage,
  surahListVisible,
  landscapeEnabled,
  lastReadPage,
  hifdhPage,
  insets,
  flatListRef,
  onSaveReading,
  onSaveHifdh,
  onJumpToPage,
  onGoToPageInput,
  onSetSurahListVisible,
  onSetLandscapeEnabled,
  onSetCurrentPage,
  onSetCurrentPageIndex,
  onToggleMenu,
  onPlayAudio,
  onPauseAudio,
  onStopAudio,
  isAudioPlaying,
  isAudioLoading,
  audioError,
}) => {
  const hasAudio = hasAudioAsset(currentPage);
  
  return (
    <Animated.View style={[styles.sidebarContainer, { transform: [{ translateX: slideAnim }] }]}>
      <LinearGradient
        colors={['#1a1a1a', '#2d2d2d', '#1a1a1a']} // Dégradé noir
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.sidebar, { paddingTop: insets.top + 48 + 20, paddingBottom: insets.bottom + 20 }]}
      >
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
          <TouchableOpacity style={styles.menuItem} onPress={onSaveReading} activeOpacity={0.7}>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemText}>حفظ موقع القراءة</Text>
              <Ionicons name="bookmark-outline" size={22} color="#FFFFFF" style={styles.menuIcon} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => onJumpToPage(lastReadPage)} activeOpacity={0.7}>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemText}>العودة إلى علامة القراءة</Text>
              <Ionicons name="bookmark" size={22} color="#FFFFFF" style={styles.menuIcon} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={onSaveHifdh} activeOpacity={0.7}>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemText}> تسجيل الصفحة للحفظ</Text>
              <Ionicons name="school-outline" size={22} color="#FFFFFF" style={styles.menuIcon} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => onJumpToPage(hifdhPage)} activeOpacity={0.7}>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemText}>الانتقال إلى صفحة الحفظ</Text>
              <Ionicons name="school" size={22} color="#FFFFFF" style={styles.menuIcon} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={onGoToPageInput} activeOpacity={0.7}>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemText}>الانتقال إلى صفحة محددة</Text>
              <Ionicons name="navigate" size={22} color="#FFFFFF" style={styles.menuIcon} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => onSetSurahListVisible(true)} activeOpacity={0.7}>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemText}>قائمة السور</Text>
              <Ionicons name="list" size={22} color="#FFFFFF" style={styles.menuIcon} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.menuItem, isAudioLoading && !isAudioPlaying && styles.menuItemDisabled]} 
            onPress={() => {
              if (!hasAudio) {
                Alert.alert(
                  'معلومة',
                  'لا يوجد ملف صوتي متاح لهذه الصفحة',
                  [{ text: 'حسناً', style: 'default' }],
                  { cancelable: true }
                );
                return;
              }
              if (isAudioPlaying) {
                onPauseAudio();
              } else {
                onPlayAudio(currentPage);
              }
            }} 
            activeOpacity={0.7}
            disabled={isAudioLoading && !isAudioPlaying}
          >
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemText}>
                {isAudioLoading ? 'جاري التحميل...' : audioError ? 'إعادة المحاولة' : isAudioPlaying ? 'إيقاف مؤقت' : 'تشغيل الصوت'}
              </Text>
              <Ionicons 
                name={isAudioPlaying ? 'pause' : 'play'} 
                size={22} 
                color={isAudioLoading && !audioError ? "#888888" : "#FFFFFF"} 
                style={styles.menuIcon} 
              />
            </View>
          </TouchableOpacity>
          {audioError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{audioError}</Text>
            </View>
          )}
          {isAudioPlaying && (
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={onStopAudio} 
              activeOpacity={0.7}
            >
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemText}>إيقاف الصوت</Text>
                <Ionicons name="stop" size={22} color="#FFFFFF" style={styles.menuIcon} />
              </View>
            </TouchableOpacity>
          )}
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>تفعيل الوضع الأفقي</Text>
            <View style={styles.switchLabelContainer}>
              <Ionicons name="phone-portrait-outline" color="#FFFFFF"  size={20} style={styles.switchIcon} />
            </View>
            <Switch
              value={landscapeEnabled}
              onValueChange={onSetLandscapeEnabled}
              thumbColor="#FFFFFF"
              trackColor={{ false: 'rgba(255,255,255,0.3)', true: '#FFFFFF' }}
              ios_backgroundColor="rgba(255,255,255,0.3)"
            />
          </View>
        </ScrollView>
      ) : (
        <>
          <View style={styles.surahListHeader}>
            <TouchableOpacity onPress={() => onSetSurahListVisible(false)} style={styles.backButton} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={[styles.sidebarTitle, { flex: 1, textAlign: 'right' }]}>قائمة السور</Text>
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
                    const targetPage = reversedQuranPages[surahIndex]?.number;
                    if (targetPage) {
                      onSetCurrentPage(targetPage);
                      onSetCurrentPageIndex(surahIndex);
                    }
                    
                    onSetSurahListVisible(false);
                    onToggleMenu();
                    
                    setTimeout(() => {
                      flatListRef.current?.scrollToIndex({ 
                        index: surahIndex, 
                        animated: true 
                      });
                    }, 300);
                  }
                }}
              >
                <Text style={styles.surahListItemText}>{item.id}. {item.name_ar}</Text>
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
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sidebarContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    zIndex: 2000, // Au-dessus de la barre de progression audio (zIndex: 1000)
    elevation: 25, // Au-dessus de la barre de progression audio (elevation: 20)
  },
  sidebar: { 
    flex: 1,
    paddingHorizontal: 20, 
    borderTopLeftRadius: 24, 
    borderBottomLeftRadius: 24, 
    elevation: 25, // Au-dessus de la barre de progression audio
    direction: 'ltr',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#FFFFFF',
  },
  sidebarHeader: { marginTop: 12, marginBottom: 16 },
  sidebarTitle: { 
    fontSize: 22,
    color: '#FFFFFF', 
    textAlign: 'right', 
    marginBottom: 8, 
    marginRight: 0, 
    letterSpacing: 0.5,
    fontFamily: 'NotoKufiArabic_400Regular',
  },
  pageIndicator: { 
    textAlign: 'right', 
    color: '#FFFFFF', 
    fontSize: 15, 
    marginRight: 0, 
    fontWeight: '500',
    fontFamily: ARABIC_FONT,
  },
  menuItem: { 
    paddingVertical: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 2,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  menuIcon: {
    marginRight: 12,
    marginLeft: 12,
  },
  menuItemText: { 
    fontSize: 15, 
    color: '#FFFFFF', 
    textAlign: 'right', 
    marginRight: 0,
    fontFamily: ARABIC_FONT,
  },
  switchRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingVertical: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    marginTop: 8,
  },
  switchLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  switchIcon: {
    marginLeft: 8,
  },
  switchLabel: { 
    fontSize: 16, 
    color: '#FFFFFF', 
    textAlign: 'right', 
    marginRight: 0, 
    fontWeight: '500',
    fontFamily: ARABIC_FONT,
  },
  divider: { height: 1, backgroundColor: 'rgba(255, 255, 255, 0.3)', marginVertical: 12 },
  surahListHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingVertical: 8 },
  backButton: { 
    paddingVertical: 8, 
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  surahList: { flex: 1 },
  surahListItem: { 
    paddingVertical: 14, 
    paddingHorizontal: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    marginVertical: 2,
  },
  surahListItemText: { 
    fontSize: 18, 
    color: '#FFFFFF', 
    fontWeight: '600', 
    marginBottom: 4, 
    textAlign: 'right', 
    marginRight: 0,
    fontFamily: ARABIC_FONT,
  },
  surahListItemSubtext: { 
    fontSize: 14, 
    color: '#FFFFFF', 
    textAlign: 'right', 
    marginRight: 0,
    opacity: 0.8,
    fontFamily: ARABIC_FONT,
  },
  errorContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    borderRadius: 8,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.5)',
  },
  errorText: {
    fontSize: 14,
    color: '#FF6B6B',
    textAlign: 'right',
    fontFamily: ARABIC_FONT,
  },
  menuItemDisabled: {
    opacity: 0.5,
  },
});

