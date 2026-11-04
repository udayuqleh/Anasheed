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
  // نسخ «Vocals Only» / «بدون موسيقى» كما هو مكتوب في عنوان الفيديو على يوتيوب
  { id: 'c1', youtubeId: 'F0FCSBwi89A', title: 'ليتك معنا', artist: 'ماهر زين', category: 'مديح نبوي', source: 'curated' },
  { id: 'c2', youtubeId: 'UW5K0OzOmVI', title: 'رحمة للعالمين', artist: 'ماهر زين', category: 'مديح نبوي', source: 'curated' },
  { id: 'c3', youtubeId: 'Hu2S4GtwDlo', title: 'قمرٌ', artist: 'ماهر زين', category: 'مديح نبوي', source: 'curated' },
  { id: 'c4', youtubeId: 'J4qCphVvhXU', title: 'قلبي في المدينة', artist: 'ماهر زين', category: 'مديح نبوي', source: 'curated' },
  { id: 'c5', youtubeId: 'cuZ3HHlgOJM', title: 'ما لي سواك', artist: 'ماهر زين', category: 'أدعية وابتهالات', source: 'curated' },
  { id: 'c6', youtubeId: '6ZNCxgrgrrI', title: 'طلع البدر علينا / الحمد لله والشكر لله', artist: 'نزار القرماني', category: 'تراثية', source: 'curated' },
  // { id: 'c1', youtubeId: 'XXXXXXXXXXX', title: 'طلع البدر علينا', artist: 'تراثي', category: 'مديح نبوي', source: 'curated' },
];
