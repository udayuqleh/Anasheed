# أناشيد

تطبيق أناشيد إسلامية بدون موسيقى، للآيفون والويب من نفس الكود (Expo / React Native).
الأناشيد تُشغَّل من يوتيوب عن طريق مشغّل يوتيوب الرسمي (بدون تنزيل الصوت، حسب شروط يوتيوب وآبل).

## الميزات
- مكتبة: قائمة مختارة (`src/data/nasheeds.ts`) + أناشيد يضيفها المستخدم بلصق رابط يوتيوب
- بحث في يوتيوب مع خيار «بدون موسيقى فقط» (يحتاج مفتاح API)
- تصنيفات، بحث داخل المكتبة، مفضلة
- مشغّل: تشغيل/إيقاف، التالي/السابق، شريط التقدم، الانتقال التلقائي للنشيد التالي

## التشغيل على الكمبيوتر
```bash
npm install
cp .env.example .env      # وضع مفتاح يوتيوب (اختياري)
npx expo start --web      # نسخة الويب
npx expo start            # امسح رمز QR بتطبيق Expo Go على الآيفون
```

## إضافة أناشيد للقائمة المختارة
افتح `src/data/nasheeds.ts` وأضف سطرًا لكل نشيد فيه رمز الفيديو من رابط يوتيوب.

## مفتاح YouTube API
1. ادخل https://console.cloud.google.com وأنشئ مشروعًا
2. فعّل «YouTube Data API v3»
3. من Credentials أنشئ API key، وقيّده على YouTube Data API
4. ضعه في `.env` بدل الفراغ بعد `EXPO_PUBLIC_YOUTUBE_API_KEY=`
الحصة المجانية تكفي تقريبًا ١٠٠ عملية بحث باليوم.

## نشر نسخة الويب
```bash
npx expo export --platform web   # يطلع مجلد dist
```
ارفع مجلد `dist` على Netlify أو Vercel أو GitHub Pages.

## بناء تطبيق الآيفون (بدون جهاز ماك)
1. حساب Apple Developer (٩٩ دولار بالسنة)
2. `npm install -g eas-cli` ثم `eas login`
3. `eas build --platform ios` (البناء يصير على سيرفرات Expo)
4. `eas submit --platform ios` لرفعه على App Store Connect
