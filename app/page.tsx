'use client';

import { useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, supabaseConfigured } from '../lib/supabase';

type Category = 'Movies' | 'Series' | 'Anime';
type Region = 'Global' | 'India';
type Language = 'en' | 'hi';
type Title = { title: string; year: number; genre: string[]; rating: number; description: string; descriptionHi: string; services: string[]; category: Category; region: Region; poster?: string; trailer: string };

const allGenres = ['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'War'];
const genreHi: Record<string, string> = { Action: 'एक्शन', Adventure: 'एडवेंचर', Animation: 'एनीमेशन', Comedy: 'कॉमेडी', Crime: 'क्राइम', Documentary: 'डॉक्यूमेंट्री', Drama: 'ड्रामा', Family: 'फैमिली', Fantasy: 'फैंटेसी', History: 'इतिहास', Horror: 'हॉरर', Mystery: 'मिस्ट्री', Romance: 'रोमांस', 'Sci-Fi': 'साइ-फाइ', Thriller: 'थ्रिलर', War: 'वॉर' };
const titles: Title[] = [
  { title: 'The Wild Robot', year: 2024, genre: ['Animation', 'Sci-Fi', 'Adventure', 'Family'], rating: 8.2, description: 'A luminous, big-hearted adventure about finding your place in a world that was never designed for you.', descriptionHi: 'एक खूबसूरत और दिल छू लेने वाला एडवेंचर, जहाँ अपनी जगह बनाने की यात्रा सबसे खास है।', services: ['Netflix India'], category: 'Movies', region: 'Global', poster: 'https://pics.filmaffinity.com/Robot_salvaje-598191664-large.jpg', trailer: '67vbA5ZJdKQ' },
  { title: 'Maharaja', year: 2024, genre: ['Crime', 'Thriller', 'Drama'], rating: 8.4, description: 'A beautifully controlled Indian thriller that turns a simple complaint into a gripping mystery.', descriptionHi: 'एक बारीकी से बनाई गई भारतीय थ्रिलर, जो एक साधारण शिकायत को शानदार रहस्य में बदल देती है।', services: ['Netflix India'], category: 'Movies', region: 'India', poster: 'https://m.media-amazon.com/images/M/MV5BZDJjNzdkNmItZDExMy00NzA3LWE3YzEtM2U3ZGRjMThlMDU2XkEyXkFqcGc%40._V1_FMjpg_UX1000_.jpg', trailer: 'ZCjFr2BWZ7Y' },
  { title: 'Dune: Part Two', year: 2024, genre: ['Sci-Fi', 'Adventure', 'Drama'], rating: 8.5, description: 'Huge-screen spectacle with a pulse: mythic scale, tactile worlds, and exceptional craft.', descriptionHi: 'विशाल स्केल, जीवंत दुनिया और बेहतरीन क्राफ्ट वाली एक शानदार सिनेमाई यात्रा।', services: ['JioHotstar'], category: 'Movies', region: 'Global', poster: 'https://image.tmdb.org/t/p/original/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', trailer: 'Way9Dexny3w' },
  { title: 'All We Imagine as Light', year: 2024, genre: ['Drama', 'Romance'], rating: 7.1, description: 'A tender, atmospheric portrait of friendship and possibility, observed with immense feeling.', descriptionHi: 'दोस्ती और उम्मीद का संवेदनशील चित्र, जिसे बहुत सादगी और गहराई से देखा गया है।', services: ['Prime Video India'], category: 'Movies', region: 'India', poster: 'https://image.tmdb.org/t/p/original/17dEoCb2gmaXlU1s7cU2iuHPRYF.jpg', trailer: '39eX2wr7FZs' },
  { title: 'Shōgun', year: 2024, genre: ['History', 'Drama', 'War'], rating: 8.6, description: 'A lavish, patient power struggle where every glance, gesture, and alliance carries weight.', descriptionHi: 'सत्ता की एक भव्य और धीमी लड़ाई, जहाँ हर नज़र और हर गठजोड़ का अपना महत्व है।', services: ['JioHotstar'], category: 'Series', region: 'Global', poster: 'https://m.media-amazon.com/images/M/MV5BOTliMTk3ZDAtYTk3NS00NTMwLTk5M2ItYzBkODlmY2VhNTMzXkEyXkFqcGc%40._V1_.jpg', trailer: 'yAN5uspO_hk' },
  { title: 'Panchayat', year: 2020, genre: ['Comedy', 'Drama'], rating: 8.9, description: 'Warm, gently hilarious storytelling that finds big heart in small everyday moments.', descriptionHi: 'छोटी-छोटी रोजमर्रा की बातों में बड़ा दिल और सुकून ढूँढती बेहद प्यारी कहानी।', services: ['Prime Video India'], category: 'Series', region: 'India', trailer: 'mojZJt5Qd6E' },
  { title: 'Severance', year: 2022, genre: ['Sci-Fi', 'Mystery', 'Thriller'], rating: 8.7, description: 'Smart, unsettling workplace science fiction with immaculate design and an off-kilter mood.', descriptionHi: 'बेहतरीन डिजाइन और रहस्यमयी माहौल वाली स्मार्ट, अनोखी वर्कप्लेस साइ-फाइ।', services: ['Apple TV+'], category: 'Series', region: 'Global', trailer: 'xEQP4VVuyrY' },
  { title: 'Frieren: Beyond Journey’s End', year: 2023, genre: ['Fantasy', 'Adventure', 'Drama'], rating: 8.9, description: 'A gentle, emotionally rich fantasy about memory, time, and the quiet moments after adventure.', descriptionHi: 'यादों, समय और सफर के बाद के शांत पलों पर बनी एक भावनात्मक फैंटेसी।', services: ['Crunchyroll India'], category: 'Anime', region: 'Global', poster: 'https://pics.filmaffinity.com/Frieren_Beyond_Journey_s_End_TV_Series-366032840-large.jpg', trailer: 'Iwr1aLEDpe4' },
  { title: 'Solo Leveling', year: 2024, genre: ['Action', 'Fantasy', 'Adventure'], rating: 8.6, description: 'A sleek, high-energy power fantasy with crisp action and a hero who keeps finding another gear.', descriptionHi: 'तगड़े एक्शन और हर मोड़ पर नई ताकत पाने वाले हीरो वाली हाई-एनर्जी फैंटेसी।', services: ['Crunchyroll India'], category: 'Anime', region: 'Global', poster: 'https://image.tmdb.org/t/p/original/75cENUBSmnON8IBDc2F979CMusN.jpg', trailer: 'HkIKAnwLZCw' },
  { title: 'Pluto', year: 2023, genre: ['Sci-Fi', 'Mystery', 'Drama'], rating: 8.3, description: 'A sophisticated sci-fi mystery with gorgeous animation and questions that linger.', descriptionHi: 'खूबसूरत एनीमेशन और देर तक याद रहने वाले सवालों वाली शानदार साइ-फाइ मिस्ट्री।', services: ['Netflix India'], category: 'Anime', region: 'Global', trailer: '9ez8lm9I26Y' },
];

const titleKey = (item: Title) => `${item.category}:${item.year}:${item.title.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`;

const copy = {
  en: { create: 'Create a room', join: 'Join a room', code: 'Room code', continue: 'Continue', filters: 'Tune your movie night', filtersSub: 'Choose together before the first swipe.', where: 'What should we include?', category: 'Categories', genres: 'Genres', start: 'Start swiping', trailer: 'Watch trailer', watch: 'Watch in India', skip: 'Skip', like: 'Like', settings: 'Settings', language: 'App language', invite: 'Copy room invite', host: 'You created this room', guest: 'You joined this room', room: 'Watch together', all: 'All genres', global: 'Global', india: 'India', next: 'Your next great watch', roomPrompt: 'Start a room or join a friend.', roomInput: 'Enter a room code' },
  hi: { create: 'रूम बनाएं', join: 'रूम जॉइन करें', code: 'रूम कोड', continue: 'आगे बढ़ें', filters: 'अपनी मूवी नाइट चुनें', filtersSub: 'पहले स्वाइप से पहले साथ में पसंद चुनें।', where: 'क्या शामिल करें?', category: 'कैटेगरी', genres: 'जॉनर', start: 'स्वाइप शुरू करें', trailer: 'ट्रेलर देखें', watch: 'भारत में देखें', skip: 'स्किप', like: 'लाइक', settings: 'सेटिंग्स', language: 'ऐप भाषा', invite: 'रूम इनवाइट कॉपी करें', host: 'आपने यह रूम बनाया', guest: 'आप इस रूम में जुड़े हैं', room: 'साथ में देखें', all: 'सभी जॉनर', global: 'ग्लोबल', india: 'भारत', next: 'आपका अगला शानदार वॉच', roomPrompt: 'रूम बनाएं या दोस्त के रूम में जुड़ें।', roomInput: 'रूम कोड डालें' },
};

export default function Home() {
  const [screen, setScreen] = useState<'room' | 'filters' | 'swipe'>('room');
  const [language, setLanguage] = useState<Language>('en');
  const [room, setRoom] = useState('');
  const [role, setRole] = useState<'host' | 'guest'>('host');
  const [selectedCategories, setSelectedCategories] = useState<Category[]>(['Movies', 'Series', 'Anime']);
  const [selectedRegions, setSelectedRegions] = useState<Region[]>(['Global', 'India']);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(allGenres);
  const [liked, setLiked] = useState<Title[]>([]);
  const [trailerOpen, setTrailerOpen] = useState(false); const [settingsOpen, setSettingsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null); const [seenTitles, setSeenTitles] = useState<string[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null); const [email, setEmail] = useState(''); const [accountNote, setAccountNote] = useState('');
  const t = copy[language];
  const queue = useMemo(() => titles.filter((item) => selectedCategories.includes(item.category) && selectedRegions.includes(item.region) && item.genre.some((genre) => selectedGenres.includes(genre)) && !seenTitles.includes(titleKey(item))), [selectedCategories, selectedRegions, selectedGenres, seenTitles]);
  const current = queue[0];
  const toggle = <T,>(value: T, values: T[], setValues: (next: T[]) => void, minimum = 1) => setValues(values.includes(value) ? values.length > minimum ? values.filter((entry) => entry !== value) : values : [...values, value]);
  useEffect(() => {
    const saved = window.localStorage.getItem('cine-match:seen-titles');
    if (saved) setSeenTitles(JSON.parse(saved));
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => listener.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!supabase || !user) return;
    supabase.from('profiles').upsert({ id: user.id, display_name: user.user_metadata.full_name ?? null, locale: language });
    supabase.from('title_actions').select('title_id').eq('user_id', user.id).then(({ data }) => {
      if (data) setSeenTitles((items) => [...new Set([...items, ...data.map((item) => item.title_id)])]);
    });
  }, [user, language]);
  const createRoom = async () => {
    const newCode = `CINE-${Math.floor(1000 + Math.random() * 9000)}`;
    if (supabase && user) {
      const { data, error } = await supabase.from('rooms').insert({ code: newCode, created_by: user.id }).select('id').single();
      if (error || !data) { setAccountNote(error?.message ?? 'Could not create the room. Please try again.'); return; }
      await supabase.from('room_members').insert({ room_id: data.id, user_id: user.id });
      setRoomId(data.id);
    } else if (supabaseConfigured) { setAccountNote('Sign in in Settings to create a live room.'); setSettingsOpen(true); return; }
    setRoom(newCode); setRole('host'); setScreen('filters');
  };
  const joinRoom = async () => {
    if (!room.trim()) return;
    if (supabase && user) {
      const { data, error } = await supabase.rpc('join_room_by_code', { room_code: room });
      if (error || !data) { setAccountNote(error?.message ?? 'Room not found.'); return; }
      setRoomId(data);
    } else if (supabaseConfigured) { setAccountNote('Sign in in Settings to join a live room.'); setSettingsOpen(true); return; }
    setRole('guest'); setScreen('filters');
  };
  const swipe = (action: 'liked' | 'disliked' | 'watched') => {
    if (!current) return;
    const key = titleKey(current); const nextSeen = [...new Set([...seenTitles, key])];
    setSeenTitles(nextSeen); window.localStorage.setItem('cine-match:seen-titles', JSON.stringify(nextSeen));
    if (action === 'liked') setLiked((items) => items.some((item) => item.title === current.title) ? items : [...items, current]);
    if (supabase && user) {
      supabase.from('title_actions').upsert({ user_id: user.id, title_id: key, action });
      if (roomId && action !== 'watched') supabase.from('room_swipes').upsert({ room_id: roomId, user_id: user.id, title_id: key, decision: action });
    }
  };
  const invite = () => navigator.clipboard?.writeText(`${window.location.origin}${window.location.pathname}?room=${room}`);
  const setAllGenres = () => setSelectedGenres(selectedGenres.length === allGenres.length ? [] : allGenres);
  const sendMagicLink = async () => {
    if (!supabase || !email) return;
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
    setAccountNote(error ? error.message : 'Check your inbox for your secure sign-in link.');
  };

  return <main className="mobile-app" lang={language}>
    <header className="app-header"><div className="brand"><span>♥</span> cinematch</div>{screen === 'swipe' && <><button className="room-chip" onClick={invite}>⌁ {room}</button><button className="icon-button" onClick={() => setSettingsOpen(true)} aria-label={t.settings}>⚙</button></>}</header>
    {screen === 'room' && <section className="onboarding"><div className="orb orb-one" /><div className="orb orb-two" /><p className="tiny-label">{t.room}</p><h1>{t.next}<br /><i>{t.room}</i></h1><p>{t.roomPrompt}</p><div className="room-actions"><button className="primary-button" onClick={createRoom}>✦ {t.create}</button><div className="join-box"><label>{t.join}</label><div><input value={room} placeholder={t.roomInput} onChange={(event) => setRoom(event.target.value.toUpperCase())} /><button onClick={joinRoom}>{t.continue} →</button></div></div></div><small>Mobile-first · Global picks · India streaming</small></section>}
    {screen === 'filters' && <section className="filters-screen"><div className="stepper"><span className="active" /> <span className="active" /> <span /></div><p className="tiny-label">{role === 'host' ? t.host : t.guest} · {room}</p><h1>{t.filters}</h1><p className="lead">{t.filtersSub}</p><FilterSection title={t.where}><div className="choice-row"><Choice active={selectedRegions.includes('Global')} label={t.global} onClick={() => toggle('Global', selectedRegions, setSelectedRegions)} /><Choice active={selectedRegions.includes('India')} label={t.india} onClick={() => toggle('India', selectedRegions, setSelectedRegions)} /></div></FilterSection><FilterSection title={t.category}><div className="choice-row">{(['Movies', 'Series', 'Anime'] as Category[]).map((category) => <Choice key={category} active={selectedCategories.includes(category)} label={language === 'hi' ? ({ Movies: 'मूवीज़', Series: 'सीरीज़', Anime: 'एनीमे' }[category]) : category} onClick={() => toggle(category, selectedCategories, setSelectedCategories)} />)}</div></FilterSection><FilterSection title={t.genres}><button className={`all-genres ${selectedGenres.length === allGenres.length ? 'active' : ''}`} onClick={setAllGenres}>{t.all}</button><div className="genre-grid">{allGenres.map((genre) => <button key={genre} className={selectedGenres.includes(genre) ? 'selected' : ''} onClick={() => toggle(genre, selectedGenres, setSelectedGenres, 0)}>{language === 'hi' ? genreHi[genre] : genre}</button>)}</div></FilterSection>{seenTitles.length > 0 && <p className="history-note">✓ {seenTitles.length} already seen, passed, or liked titles are excluded.</p>}<button className="primary-button wide" disabled={!queue.length} onClick={() => setScreen('swipe')}>♥ {t.start} <span>({queue.length})</span></button></section>}
    {screen === 'swipe' && (current ? <section className="swipe-screen"><div className="swipe-top"><div><p className="tiny-label">{current.region === 'India' ? t.india : t.global} · {language === 'hi' ? ({ Movies: 'मूवीज़', Series: 'सीरीज़', Anime: 'एनीमे' }[current.category]) : current.category}</p><h1>{current.title}</h1></div><div className="rating">★<strong>{current.rating}</strong><small>IMDb</small></div></div><article className="movie-card"><div className="cover" style={current.poster ? { backgroundImage: `linear-gradient(180deg, transparent 48%, rgba(0,0,0,.76)), url(${current.poster})` } : undefined}><div className="cover-fallback">{current.title}</div><div className="cover-bottom"><span>{current.year}</span><button onClick={() => setTrailerOpen(true)}>▶ {t.trailer}</button></div></div><div className="movie-details"><div className="genre-tags">{current.genre.map((genre) => <span key={genre}>{language === 'hi' ? genreHi[genre] : genre}</span>)}</div><p>{language === 'hi' ? current.descriptionHi : current.description}</p><div className="services"><small>{t.watch.toUpperCase()}</small>{current.services.map((service) => <b key={service}>{service}</b>)}</div></div></article><button className="watched-button" onClick={() => swipe('watched')}>◉ Already watched</button><div className="swipe-actions"><button className="pass" onClick={() => swipe('disliked')} aria-label={t.skip}>×</button><button className="heart" onClick={() => swipe('liked')} aria-label={t.like}>♥</button></div><p className="swipe-instruction">{t.skip} ← &nbsp;·&nbsp; {t.like} →</p>{liked.length > 0 && <div className="match-strip">♥ {liked.length} {language === 'hi' ? 'पसंद सेव हुई' : 'picks saved in this room'}</div>}</section> : <section className="empty-deck"><p className="tiny-label">Cine-Match</p><h1>You’re all caught up.</h1><p>Every title in this filter has already been seen, passed, or liked.</p><button className="primary-button" onClick={() => setScreen('filters')}>Change filters</button></section>)}
    {settingsOpen && <div className="sheet-backdrop" role="dialog" aria-modal="true"><section className="settings-sheet"><div className="handle" /><div className="sheet-title"><h2>{t.settings}</h2><button onClick={() => setSettingsOpen(false)}>×</button></div><p>{t.language}</p><div className="language-toggle"><button className={language === 'en' ? 'selected' : ''} onClick={() => setLanguage('en')}>English</button><button className={language === 'hi' ? 'selected' : ''} onClick={() => setLanguage('hi')}>हिन्दी</button></div><div className="account-panel"><p className="account-title">Your account</p>{user ? <><strong>{user.email ?? 'Signed in'}</strong><small>Likes, passes, and watched picks stay off your next deck.</small><button className="signout-button" onClick={() => supabase?.auth.signOut()}>Sign out</button></> : <>{supabaseConfigured ? <><small>Use an email link to save your tastes and use live rooms with friends.</small><div className="email-login"><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /><button onClick={sendMagicLink}>Send link</button></div></> : <small>Account connection is being set up. Your swipes are saved privately on this device for now.</small>}</>}{accountNote && <small className="account-note">{accountNote}</small>}</div><button className="invite-button" onClick={invite}>⌁ {t.invite}</button></section></div>}
    {trailerOpen && <div className="trailer-backdrop" role="dialog" aria-modal="true"><section className="trailer-pane"><button className="close-trailer" onClick={() => setTrailerOpen(false)}>×</button><iframe src={`https://www.youtube-nocookie.com/embed/${current.trailer}?autoplay=1&rel=0`} title={`${current.title} trailer`} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen /></section></div>}
  </main>;
}

function Choice({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) { return <button className={`choice ${active ? 'active' : ''}`} onClick={onClick}>{active && <span>✓</span>}{label}</button>; }
function FilterSection({ title, children }: { title: string; children: React.ReactNode }) { return <section className="filter-section"><h2>{title}</h2>{children}</section>; }

