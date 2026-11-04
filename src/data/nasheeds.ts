// القائمة المختارة: أناشيد بدون موسيقى من يوتيوب.
// لإضافة نشيد: انسخ رابط الفيديو من يوتيوب وضع الرمز (ID) هنا.
// مثال: https://www.youtube.com/watch?v=XXXXXXXXXXX  →  youtubeId: 'XXXXXXXXXXX'
// تأكد أن الفيديو منشور من قناة المنشد أو قناة مسموح لها، وأنه بدون موسيقى.

export type Nasheed = {
  id: string;
  youtubeId: string;
  title: string;
  artist: string;
  category: string;
  source: 'curated' | 'user';
};

export const CATEGORIES = [
  'مديح نبوي',
  'رمضان والعيد',
  'أطفال',
  'أدعية وابتهالات',
  'تراثية',
  'حماسية',
  'أخرى',
];

export const CURATED: Nasheed[] = [
  // { id: 'c1', youtubeId: 'XXXXXXXXXXX', title: 'طلع البدر علينا', artist: 'تراثي', category: 'مديح نبوي', source: 'curated' },
];
