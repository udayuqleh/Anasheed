import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  I18nManager,
  Linking,
  Image,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';
import { CATEGORIES, CURATED, Nasheed } from './src/data/nasheeds';
import { API_KEY, fetchTitle, parseYouTubeId, searchYouTube, SearchResult, thumb } from './src/lib/youtube';
import { load, save } from './src/lib/storage';
import { YouTubePlayer } from './src/components/YouTubePlayer';
import type { PlayerHandle, PlayerState } from './src/components/types';

if (Platform.OS === 'web' && typeof document !== 'undefined') {
  document.documentElement.dir = 'rtl';
  document.documentElement.lang = 'ar';
  document.title = 'أناشيد';
} else {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}

const light = { bg: '#F3F5F1', surface: '#FFFFFF', ink: '#14231F', muted: '#5C6E68', line: '#DCE3DE', accent: '#0E6B57', onAccent: '#FFFFFF', gold: '#A77B22', soft: '#E3EEE9', danger: '#A33A2A' };
const dark = { bg: '#0C1513', surface: '#13201D', ink: '#E6EEEA', muted: '#93A6A0', line: '#24342F', accent: '#3FB898', onAccent: '#06211A', gold: '#D6AC55', soft: '#18302A', danger: '#E07A66' };
type Theme = typeof light;

type Tab = 'library' | 'search' | 'fav';
const AR = (n: number) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d]);
const fmt = (s: number) => {
  if (!isFinite(s) || s < 0) s = 0;
  s = Math.floor(s);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

export default function App() {
  const scheme = useColorScheme();
  const c = scheme === 'dark' ? dark : light;
  const s = useMemo(() => makeStyles(c), [c]);
  const { width } = useWindowDimensions();

  const [userItems, setUserItems] = useState<Nasheed[]>([]);
  const [favs, setFavs] = useState<string[]>([]);
  const [tab, setTab] = useState<Tab>('library');
  const [cat, setCat] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [queue, setQueue] = useState<Nasheed[]>([]);
  const [current, setCurrent] = useState<Nasheed | null>(null);
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);
  const [dur, setDur] = useState(0);
  const [adding, setAdding] = useState<Partial<Nasheed> | null>(null);
  const [toast, setToast] = useState('');
  const player = useRef<PlayerHandle>(null);

  useEffect(() => {
    load<Nasheed[]>('userItems', []).then(setUserItems);
    load<string[]>('favs', []).then(setFavs);
  }, []);

  const library = useMemo(() => [...CURATED, ...userItems], [userItems]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return library.filter(
      (n) =>
        (tab === 'fav' ? favs.includes(n.youtubeId) : cat === 'all' || n.category === cat) &&
        (!q || `${n.title} ${n.artist}`.toLowerCase().includes(q))
    );
  }, [library, favs, tab, cat, query]);

  // progress polling
  useEffect(() => {
    if (!current) return;
    const t = setInterval(async () => {
      const p = player.current;
      if (!p) return;
      setPos(await p.getCurrentTime());
      setDur(await p.getDuration());
    }, 1000);
    return () => clearInterval(t);
  }, [current]);

  function flash(m: string) {
    setToast(m);
    setTimeout(() => setToast(''), 2200);
  }

  function play(n: Nasheed, list: Nasheed[]) {
    if (current?.youtubeId === n.youtubeId) return setPlaying((p) => !p);
    setQueue(list);
    setCurrent(n);
    setPos(0);
    setDur(0);
    setPlaying(true);
  }

  function step(d: number) {
    if (!current || !queue.length) return;
    const i = queue.findIndex((n) => n.youtubeId === current.youtubeId);
    const next = queue[(i + d + queue.length) % queue.length];
    if (next) {
      setCurrent(next);
      setPos(0);
      setPlaying(true);
    }
  }

  function onState(st: PlayerState) {
    if (st === 'playing') setPlaying(true);
    else if (st === 'paused') setPlaying(false);
    else if (st === 'ended') step(1);
  }

  function toggleFav(id: string) {
    const next = favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id];
    setFavs(next);
    save('favs', next);
  }

  function addItem(n: Nasheed) {
    if (library.some((x) => x.youtubeId === n.youtubeId)) return flash('هذا النشيد موجود في المكتبة');
    const next = [...userItems, n];
    setUserItems(next);
    save('userItems', next);
    flash('تمت الإضافة إلى المكتبة');
  }

  function removeItem(id: string) {
    const next = userItems.filter((x) => x.youtubeId !== id);
    setUserItems(next);
    save('userItems', next);
    flash('تم الحذف');
  }

  const playerW = Math.min(width, 640);
  const videoH = Math.min(220, Math.round(((playerW - 32) * 9) / 16));
  const usedCats = CATEGORIES.filter((k) => library.some((n) => n.category === k));

  return (
    <SafeAreaView style={s.root}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <View style={s.column}>
        <View style={s.header}>
          <View>
            <Text style={s.h1}>أناشيد</Text>
            <Text style={s.sub}>أناشيد إسلامية بدون موسيقى</Text>
          </View>
          <Pressable style={s.btn} onPress={() => setAdding({ category: CATEGORIES[0] })} accessibilityRole="button">
            <Text style={s.btnText}>+ أضف رابط يوتيوب</Text>
          </Pressable>
        </View>

        <View style={s.tabs}>
          {([['library', 'المكتبة'], ['search', 'بحث يوتيوب'], ['fav', 'المفضلة']] as [Tab, string][]).map(([k, l]) => (
            <Pressable key={k} onPress={() => setTab(k)} style={[s.tab, tab === k && s.tabOn]} accessibilityRole="tab" accessibilityState={{ selected: tab === k }}>
              <Text style={[s.tabText, tab === k && s.tabTextOn]}>{l}</Text>
            </Pressable>
          ))}
        </View>

        {tab === 'search' ? (
          <SearchTab c={c} s={s} onPlay={play} onAdd={(r) => setAdding({ youtubeId: r.youtubeId, title: r.title, artist: r.channel, category: CATEGORIES[0] })} current={current} />
        ) : (
          <>
            <TextInput style={s.input} placeholder="ابحث باسم النشيد أو المنشد" placeholderTextColor={c.muted} value={query} onChangeText={setQuery} />
            {tab === 'library' && usedCats.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipsRow} contentContainerStyle={s.chips}>
                {[['all', 'الكل'], ...usedCats.map((k) => [k, k])].map(([k, l]) => (
                  <Pressable key={k} onPress={() => setCat(k)} style={[s.chip, cat === k && s.chipOn]}>
                    <Text style={[s.chipText, cat === k && s.chipTextOn]}>{l}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
            {visible.length > 0 && (
              <Pressable
                style={s.playAll}
                accessibilityRole="link"
                onPress={() => {
                  setPlaying(false);
                  const ids = visible.slice(0, 50).map((n) => n.youtubeId).join(',');
                  Linking.openURL(`https://www.youtube.com/watch_videos?video_ids=${ids}`);
                }}
              >
                <Text style={s.playAllText}>▶ شغّل الكل بيوتيوب (بدون إعلانات مع Premium)</Text>
              </Pressable>
            )}
            <FlatList
              data={visible}
              keyExtractor={(n) => n.youtubeId}
              contentContainerStyle={{ paddingBottom: 24 }}
              ListEmptyComponent={
                <View style={s.empty}>
                  <Text style={s.emptyTitle}>{tab === 'fav' ? 'لا توجد مفضلة بعد' : library.length ? 'لا نتائج' : 'المكتبة فارغة'}</Text>
                  <Text style={s.emptyText}>
                    {tab === 'fav'
                      ? 'اضغط على النجمة بجانب أي نشيد ليظهر هنا.'
                      : library.length
                      ? 'جرّب كلمة أخرى أو تصنيفًا آخر.'
                      : 'الصق رابط نشيد من يوتيوب من زر «أضف رابط يوتيوب»، أو ابحث من تبويب «بحث يوتيوب».'}
                  </Text>
                </View>
              }
              renderItem={({ item, index }) => (
                <Row
                  s={s}
                  c={c}
                  n={item}
                  index={index}
                  active={current?.youtubeId === item.youtubeId}
                  fav={favs.includes(item.youtubeId)}
                  onPress={() => play(item, visible)}
                  onFav={() => toggleFav(item.youtubeId)}
                  onRemove={item.source === 'user' ? () => removeItem(item.youtubeId) : undefined}
                />
              )}
            />
          </>
        )}
      </View>

      {current && (
        <View style={s.player}>
          <View style={s.column}>
            <View style={s.video}>
              <YouTubePlayer ref={player} videoId={current.youtubeId} playing={playing} height={videoH} onState={onState} />
            </View>
            <View style={s.nowRow}>
              <Text style={[s.nowTitle, { flex: 1 }]} numberOfLines={1}>{current.title}</Text>
              <Pressable
                style={s.ytBtn}
                accessibilityRole="link"
                onPress={() => {
                  setPlaying(false);
                  Linking.openURL(`https://www.youtube.com/watch?v=${current.youtubeId}`);
                }}
              >
                <Text style={s.ytBtnText}>▶ افتح بيوتيوب</Text>
              </Pressable>
            </View>
            <View style={s.progressRow}>
              <Text style={s.time}>{fmt(pos)}</Text>
              <Pressable
                style={s.track}
                onPress={(e) => {
                  const w = (e.nativeEvent as any).target?.offsetWidth ?? playerW - 120;
                  const x = e.nativeEvent.locationX;
                  if (dur) player.current?.seekTo((x / w) * dur);
                }}
              >
                <View style={[s.fill, { width: `${dur ? Math.min(100, (pos / dur) * 100) : 0}%` }]} />
              </Pressable>
              <Text style={s.time}>{fmt(dur)}</Text>
            </View>
            <View style={s.ctrls}>
              <Pressable onPress={() => step(-1)} style={s.ctrl} accessibilityLabel="السابق"><Text style={s.ctrlIcon}>⏮</Text></Pressable>
              <Pressable onPress={() => setPlaying((p) => !p)} style={s.playBtn} accessibilityLabel={playing ? 'إيقاف مؤقت' : 'تشغيل'}>
                <Text style={s.playIcon}>{playing ? '❚❚' : '▶'}</Text>
              </Pressable>
              <Pressable onPress={() => step(1)} style={s.ctrl} accessibilityLabel="التالي"><Text style={s.ctrlIcon}>⏭</Text></Pressable>
            </View>
          </View>
        </View>
      )}

      {adding && <AddSheet c={c} s={s} initial={adding} onClose={() => setAdding(null)} onSave={(n) => { addItem(n); setAdding(null); }} />}
      {!!toast && <View style={s.toast}><Text style={s.toastText}>{toast}</Text></View>}
    </SafeAreaView>
  );
}

function Row({ s, c, n, index, active, fav, onPress, onFav, onRemove }: { s: Styles; c: Theme; n: Nasheed; index: number; active: boolean; fav: boolean; onPress: () => void; onFav: () => void; onRemove?: () => void }) {
  const [armed, setArmed] = useState(false);
  return (
    <View style={[s.row, active && { backgroundColor: c.soft }]}>
      <Pressable onPress={onPress} style={s.rowMain}>
        <Image source={{ uri: thumb(n.youtubeId) }} style={s.thumb} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={s.rowTitle} numberOfLines={1}>{AR(index + 1)}. {n.title}</Text>
          <Text style={s.rowSub} numberOfLines={1}>{n.artist || 'منشد غير معروف'} · {n.category}</Text>
        </View>
      </Pressable>
      <Pressable onPress={onFav} style={s.iconBtn} accessibilityLabel={fav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}>
        <Text style={[s.star, fav && { color: c.gold }]}>{fav ? '★' : '☆'}</Text>
      </Pressable>
      {onRemove && (
        <Pressable onPress={() => (armed ? onRemove() : setArmed(true))} style={s.iconBtn} accessibilityLabel="حذف">
          <Text style={[s.rowSub, armed && { color: c.danger, fontWeight: '700' }]}>{armed ? 'تأكيد' : '✕'}</Text>
        </Pressable>
      )}
    </View>
  );
}

function SearchTab({ c, s, onPlay, onAdd, current }: { c: Theme; s: Styles; onPlay: (n: Nasheed, l: Nasheed[]) => void; onAdd: (r: SearchResult) => void; current: Nasheed | null }) {
  const [q, setQ] = useState('');
  const [vocalOnly, setVocalOnly] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  if (!API_KEY)
    return (
      <View style={s.empty}>
        <Text style={s.emptyTitle}>البحث في يوتيوب غير مفعّل بعد</Text>
        <Text style={s.emptyText}>يحتاج التطبيق مفتاح YouTube Data API. ضعه في ملف ‎.env‎ باسم EXPO_PUBLIC_YOUTUBE_API_KEY ثم أعد تشغيل التطبيق.</Text>
      </View>
    );

  async function run() {
    if (!q.trim()) return;
    setLoading(true);
    setErr('');
    try {
      setResults(await searchYouTube(q, vocalOnly));
    } catch (e: any) {
      setErr(e.message === 'HTTP_403' ? 'المفتاح غير صالح أو انتهت حصة البحث اليومية.' : 'تعذّر البحث. تأكد من الاتصال بالإنترنت.');
    }
    setLoading(false);
  }
  const asNasheed = (r: SearchResult): Nasheed => ({ id: r.youtubeId, youtubeId: r.youtubeId, title: r.title, artist: r.channel, category: 'أخرى', source: 'user' });
  const list = results.map(asNasheed);

  return (
    <View style={{ flex: 1 }}>
      <TextInput style={s.input} placeholder="ابحث عن نشيد أو منشد في يوتيوب" placeholderTextColor={c.muted} value={q} onChangeText={setQ} onSubmitEditing={run} returnKeyType="search" />
      <View style={s.searchBar}>
        <Pressable onPress={() => setVocalOnly((v) => !v)} style={[s.chip, vocalOnly && s.chipOn]}>
          <Text style={[s.chipText, vocalOnly && s.chipTextOn]}>{vocalOnly ? '✓ ' : ''}بدون موسيقى فقط</Text>
        </Pressable>
        <Pressable onPress={run} style={s.btn}><Text style={s.btnText}>ابحث</Text></Pressable>
      </View>
      <Text style={s.hint}>نتائج يوتيوب قد تحتوي موسيقى. استمع قبل أن تضيف النشيد للمكتبة.</Text>
      {loading && <ActivityIndicator color={c.accent} style={{ marginTop: 24 }} />}
      {!!err && <Text style={[s.hint, { color: c.danger }]}>{err}</Text>}
      <FlatList
        data={list}
        keyExtractor={(n) => n.youtubeId}
        renderItem={({ item, index }) => (
          <View style={[s.row, current?.youtubeId === item.youtubeId && { backgroundColor: c.soft }]}>
            <Pressable onPress={() => onPlay(item, list)} style={s.rowMain}>
              <Image source={{ uri: thumb(item.youtubeId) }} style={s.thumb} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={s.rowTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={s.rowSub} numberOfLines={1}>{item.artist}</Text>
              </View>
            </Pressable>
            <Pressable onPress={() => onAdd(results[index])} style={s.iconBtn} accessibilityLabel="أضف إلى المكتبة">
              <Text style={[s.star, { color: c.accent }]}>＋</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

function AddSheet({ c, s, initial, onClose, onSave }: { c: Theme; s: Styles; initial: Partial<Nasheed>; onClose: () => void; onSave: (n: Nasheed) => void }) {
  const [link, setLink] = useState(initial.youtubeId ? `https://youtu.be/${initial.youtubeId}` : '');
  const [title, setTitle] = useState(initial.title ?? '');
  const [artist, setArtist] = useState(initial.artist ?? '');
  const [category, setCategory] = useState(initial.category ?? CATEGORIES[0]);
  const [err, setErr] = useState('');
  const id = parseYouTubeId(link);

  useEffect(() => {
    if (!id || title) return;
    fetchTitle(id).then((r) => {
      if (r) {
        setTitle((t) => t || r.title);
        setArtist((a) => a || r.author);
      }
    });
  }, [id]);

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.sheetBg} onPress={onClose} />
      <View style={s.sheet}>
        <Text style={s.sheetTitle}>أضف نشيدًا من يوتيوب</Text>
        <Text style={s.label}>رابط الفيديو</Text>
        <TextInput style={s.input} value={link} onChangeText={(v) => { setLink(v); setErr(''); }} placeholder="https://youtube.com/watch?v=..." placeholderTextColor={c.muted} autoCapitalize="none" />
        {id && <Image source={{ uri: thumb(id) }} style={s.preview} />}
        <Text style={s.label}>اسم النشيد</Text>
        <TextInput style={s.input} value={title} onChangeText={setTitle} placeholderTextColor={c.muted} placeholder="مثال: طلع البدر علينا" />
        <Text style={s.label}>المنشد</Text>
        <TextInput style={s.input} value={artist} onChangeText={setArtist} placeholderTextColor={c.muted} placeholder="اختياري" />
        <Text style={s.label}>التصنيف</Text>
        <View style={[s.chips, { flexWrap: 'wrap' }]}>
          {CATEGORIES.map((k) => (
            <Pressable key={k} onPress={() => setCategory(k)} style={[s.chip, category === k && s.chipOn]}>
              <Text style={[s.chipText, category === k && s.chipTextOn]}>{k}</Text>
            </Pressable>
          ))}
        </View>
        {!!err && <Text style={[s.hint, { color: c.danger }]}>{err}</Text>}
        <View style={[s.searchBar, { marginTop: 8 }]}>
          <Pressable
            style={s.btn}
            onPress={() => {
              if (!id) return setErr('الرابط غير صحيح. انسخ رابط الفيديو من يوتيوب والصقه هنا.');
              onSave({ id, youtubeId: id, title: title.trim() || 'نشيد', artist: artist.trim(), category, source: 'user' });
            }}
          >
            <Text style={s.btnText}>حفظ في المكتبة</Text>
          </Pressable>
          <Pressable style={s.btnGhost} onPress={onClose}><Text style={s.btnGhostText}>إلغاء</Text></Pressable>
        </View>
      </View>
    </Modal>
  );
}

const START = (Platform.OS === 'web' ? 'right' : 'left') as 'right' | 'left';
type Styles = ReturnType<typeof makeStyles>;
function makeStyles(c: Theme) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg },
    column: { flex: 1, width: '100%', maxWidth: 640, alignSelf: 'center', paddingHorizontal: 16 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, paddingBottom: 12, gap: 12 },
    h1: { fontSize: 30, fontWeight: '800', color: c.accent, textAlign: START },
    sub: { fontSize: 12.5, color: c.muted, textAlign: START },
    btn: { backgroundColor: c.accent, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 16 },
    btnText: { color: c.onAccent, fontWeight: '600', fontSize: 14 },
    btnGhost: { borderWidth: 1, borderColor: c.line, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 16 },
    btnGhostText: { color: c.ink, fontSize: 14 },
    tabs: { flexDirection: 'row', backgroundColor: c.soft, borderRadius: 12, padding: 4, gap: 4, marginBottom: 10 },
    tab: { flex: 1, paddingVertical: 8, borderRadius: 9, alignItems: 'center' },
    tabOn: { backgroundColor: c.surface },
    tabText: { color: c.muted, fontWeight: '500' },
    tabTextOn: { color: c.ink, fontWeight: '700' },
    input: { borderWidth: 1, borderColor: c.line, backgroundColor: c.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, color: c.ink, fontSize: 15, textAlign: 'right', writingDirection: 'rtl' },
    chipsRow: { flexGrow: 0, marginTop: 10 },
    chips: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
    chip: { borderWidth: 1, borderColor: c.line, backgroundColor: c.surface, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 13 },
    chipOn: { backgroundColor: c.ink, borderColor: c.ink },
    chipText: { color: c.muted, fontSize: 13.5 },
    chipTextOn: { color: c.bg },
    row: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: c.line, paddingVertical: 8, paddingHorizontal: 4, borderRadius: 8 },
    rowMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, minWidth: 0 },
    thumb: { width: 80, height: 45, borderRadius: 8, backgroundColor: c.soft },
    rowTitle: { color: c.ink, fontWeight: '600', fontSize: 15, textAlign: START },
    rowSub: { color: c.muted, fontSize: 13, textAlign: START },
    iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    star: { fontSize: 22, color: c.muted },
    empty: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 12, gap: 6 },
    emptyTitle: { fontSize: 19, fontWeight: '700', color: c.ink, textAlign: 'center' },
    emptyText: { color: c.muted, textAlign: 'center', lineHeight: 22 },
    searchBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 10 },
    hint: { color: c.muted, fontSize: 12.5, marginVertical: 8, textAlign: START },
    player: { backgroundColor: c.surface, borderTopWidth: 1, borderTopColor: c.line, paddingVertical: 10, flexGrow: 0, flexShrink: 0 },
    video: { borderRadius: 12, overflow: 'hidden', backgroundColor: '#000' },
    playAll: { marginTop: 10, marginBottom: 4, borderRadius: 12, paddingVertical: 10, alignItems: 'center', backgroundColor: '#CC0000' },
    playAllText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
    nowRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
    ytBtn: { borderWidth: 1, borderColor: '#CC0000', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 12 },
    ytBtnText: { color: '#CC0000', fontSize: 13, fontWeight: '600' },
    nowTitle: { color: c.ink, fontWeight: '700', textAlign: START },
    progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6, direction: 'ltr' },
    time: { color: c.muted, fontSize: 12, fontVariant: ['tabular-nums'] },
    track: { flex: 1, height: 18, justifyContent: 'center', alignItems: 'flex-start', backgroundColor: c.soft, borderRadius: 9, overflow: 'hidden' },
    fill: { height: 18, backgroundColor: c.accent },
    ctrls: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 24, marginTop: 4, direction: 'ltr' },
    ctrl: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    ctrlIcon: { fontSize: 22, color: c.ink },
    playBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center' },
    playIcon: { color: c.onAccent, fontSize: 20, fontWeight: '700' },
    sheetBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
    sheet: { backgroundColor: c.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, gap: 6, width: '100%', maxWidth: 640, alignSelf: 'center' },
    sheetTitle: { fontSize: 21, fontWeight: '800', color: c.ink, marginBottom: 6, textAlign: START },
    label: { color: c.muted, fontSize: 13, marginTop: 6, textAlign: START },
    preview: { width: 160, height: 90, borderRadius: 8, marginTop: 8 },
    toast: { position: 'absolute', bottom: 40, alignSelf: 'center', backgroundColor: c.ink, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 999 },
    toastText: { color: c.bg, fontSize: 13.5 },
  });
}
