// Types pour le lecteur de Quran
export type QuranPage = {
  number: number;
  source: any;
  surahs: number[]; // Liste des sourates présentes sur cette page
};

export interface Surah {
  id: number;
  name_ar: string;
  name_en: string;
  startPage: number;
  pages: number;
}

