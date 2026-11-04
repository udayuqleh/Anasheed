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
  { id: 'c7', youtubeId: 'rSAZ6otZ0BI', title: 'يا نبي سلام عليك', artist: 'ماهر زين', category: 'مديح نبوي', source: 'curated' },
  { id: 'c8', youtubeId: 'YMHREMPNAxM', title: 'أغيب', artist: 'مشاري العفاسي', category: 'أدعية وابتهالات', source: 'curated' },
  { id: 'c9', youtubeId: 'Drg4vu7gtD8', title: 'جمال الوجود', artist: 'محمد المقيط', category: 'أدعية وابتهالات', source: 'curated' },
  { id: 'c10', youtubeId: 'K8vpRetNS0o', title: 'الخطايا', artist: 'محمد المقيط', category: 'أدعية وابتهالات', source: 'curated' },
  { id: 'c11', youtubeId: 'jAN6RHvUZ_Y', title: 'O Allah', artist: 'Harris J', category: 'أدعية وابتهالات', source: 'curated' },
  { id: 'c12', youtubeId: 'qboPetXxY4A', title: 'Always Listening', artist: 'Harris J', category: 'أدعية وابتهالات', source: 'curated' },
  { id: 'c13', youtubeId: 'QfdwuzqOdTc', title: 'Ya Allah', artist: 'Raef و Sintesa', category: 'أدعية وابتهالات', source: 'curated' },
  { id: 'c14', youtubeId: 'R8RaefhjcDY', title: 'رمضان', artist: '', category: 'رمضان والعيد', source: 'curated' },
  { id: 'c15', youtubeId: 'npXPREOLE3M', title: 'أهلًا رمضان', artist: '', category: 'رمضان والعيد', source: 'curated' },
  { id: 'c16', youtubeId: '3ogDp6m0vsY', title: 'المسك فاح', artist: '', category: 'أطفال', source: 'curated' },
  { id: 'c17', youtubeId: 'A-35Xm3tdzQ', title: 'احمد ربك (الحمد لله)', artist: '', category: 'أطفال', source: 'curated' },
  { id: 'c18', youtubeId: '9HEi4MQntbc', title: 'صلواتي', artist: '', category: 'أطفال', source: 'curated' },
  { id: 'c19', youtubeId: '4tlSaOBTbps', title: 'بسم الله', artist: '', category: 'أطفال', source: 'curated' },
  { id: 'c20', youtubeId: 'Br8dN2WpCCI', title: 'طلع البدر علينا (للأطفال)', artist: '', category: 'أطفال', source: 'curated' },
];
