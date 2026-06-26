import React, { useState, useEffect, useMemo } from "react";
import {
  Compass, Moon, Sun, Settings, LogOut, Trophy, User, Home, BookOpen,
  Lock, Star, Flame, ArrowLeft, Check, X, Volume2, Plus, Trash2, Edit,
  Shield, Users, Hash, Sparkles, ChevronRight, RotateCcw,
} from "lucide-react";

/* ============================================================
   WordScout11Plus — single-file working app
   Brand palette: cyan #01B5C9 · yellow #FFEB5B · cream #FEF8DD
   All data is in-memory (React state) with sample sets.
   Auth is mocked — swap in Supabase/Firebase for a real backend.
   ============================================================ */

// Pick readable text colour for any background.
const textOn = (hex) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const L = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return L > 0.5 ? "#06343a" : "#ffffff";
};

// ---------- Brand constants ----------
const BRAND = "#01B5C9";       // cyan
const BRAND_DEEP = "#017A8A";  // darker cyan, for text on light
const YELLOW = "#FFEB5B";      // sunny accent
const YELLOW_STROKE = "#E6C200"; // darker yellow, for outlines/contrast
const INK = "#06343a";         // dark ink for text on bright colours

// ---------- Sample data ----------
const SAMPLE_SETS = [
  {
    id: "wk1", week: 1, title: "Synonyms — Set 1", topic: "Synonyms",
    description: "Common 11+ synonyms to broaden your vocabulary.",
    published: true, releaseDate: "2025-01-06",
    items: [
      { term: "abundant", pos: "adjective", def: "existing in large quantities; plentiful", example: "There was an abundant supply of food at the feast." },
      { term: "brisk", pos: "adjective", def: "quick and energetic", example: "She went for a brisk walk before breakfast." },
      { term: "candid", pos: "adjective", def: "truthful and straightforward; frank", example: "He gave a candid answer to the difficult question." },
      { term: "diligent", pos: "adjective", def: "showing careful and persistent effort", example: "The diligent student finished all her homework early." },
      { term: "elated", pos: "adjective", def: "extremely happy and excited", example: "They were elated when their team won the cup." },
    ],
  },
  {
    id: "wk2", week: 2, title: "Antonyms — Set 1", topic: "Antonyms",
    description: "Opposite words that often appear in 11+ exams.",
    published: true, releaseDate: "2025-01-13",
    items: [
      { term: "expand", pos: "verb", def: "to make or become larger", example: "Metal will expand when it is heated." },
      { term: "ascend", pos: "verb", def: "to go up or climb", example: "We watched the balloon ascend into the sky." },
      { term: "permit", pos: "verb", def: "to allow something to happen", example: "The teacher will permit us to leave early." },
      { term: "praise", pos: "verb", def: "to express approval or admiration", example: "The coach gave praise to the whole team." },
      { term: "gather", pos: "verb", def: "to bring together in one place", example: "They gather shells along the beach." },
    ],
  },
  {
    id: "wk3", week: 3, title: "Tricky Spellings", topic: "Spellings",
    description: "Words that are commonly misspelled in the 11+.",
    published: false, releaseDate: "2025-01-20",
    items: [
      { term: "necessary", pos: "adjective", def: "needed to be done or present", example: "It is necessary to revise before the test." },
      { term: "separate", pos: "adjective", def: "forming a unit by itself; not joined", example: "Keep the two piles separate." },
      { term: "rhythm", pos: "noun", def: "a strong, regular repeated pattern of sound", example: "The drummer kept a steady rhythm." },
    ],
  },
];

const useTheme = () => {
  const [dark, setDark] = useState(
    typeof window !== "undefined" && window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  return { dark, setDark };
};

// Game palettes — all within the cyan / yellow brand family.
const GAME_THEMES = {
  flashcards: { name: "Flashcards", accent: "#01B5C9", icon: BookOpen },
  fillblank: { name: "Fill the Blank", accent: "#0193A4", icon: Edit },
  spelling: { name: "Spelling Test", accent: "#E6B800", icon: Volume2 },
  match: { name: "Match-Up Pairs", accent: "#017A8A", icon: Sparkles },
  kahoot: { name: "Quiz Rush", accent: "#01B5C9", icon: Trophy },
  goldhunt: { name: "Gold Hunt", accent: "#F2C200", icon: Star },
  hangman: { name: "Hangman", accent: "#04C7DA", icon: User },
  wordle: { name: "Word Guess", accent: "#01B5C9", icon: Hash },
};

// ---------- Root ----------
export default function App() {
  const { dark, setDark } = useTheme();
  const [sets, setSets] = useState(SAMPLE_SETS);
  const [user, setUser] = useState(null);
  const [view, setView] = useState({ name: "landing" });
  const [progress, setProgress] = useState({});
  const [streak] = useState(5);
  const [showSettings, setShowSettings] = useState(false);

  const bg = dark ? "#06262B" : "#FEF8DD";
  const surface = dark ? "#0E3A41" : "#FFFFFF";
  const text = dark ? "#EAFCFF" : "#0A3B42";
  const muted = dark ? "#8FBFC6" : "#5E7A80";
  const border = dark ? "#185660" : "#ECE2BE";

  const t = {
    bg, surface, text, muted, border, dark,
    brand: BRAND, brandDeep: dark ? "#5AD7E6" : BRAND_DEEP,
    gold: YELLOW, goldStroke: YELLOW_STROKE, ink: INK,
  };

  const publishedSets = sets.filter((s) => s.published);

  const awardStars = (setId, mode, stars) => {
    setProgress((p) => {
      const cur = p[setId] || {};
      const best = Math.max(cur[mode] || 0, stars);
      return { ...p, [setId]: { ...cur, [mode]: best } };
    });
  };

  const go = (v) => { setShowSettings(false); setView(v); };

  const Nav = () => (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 20px", background: surface, borderBottom: `1px solid ${border}`,
      position: "sticky", top: 0, zIndex: 50,
    }}>
      <div onClick={() => go(user ? { name: "dashboard" } : { name: "landing" })}
        style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
        <div style={{ width: 38, height: 38, borderRadius: 11, background: BRAND, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Compass size={22} color={INK} />
        </div>
        <span style={{ fontWeight: 800, fontSize: 19, color: text, letterSpacing: -0.5, fontFamily: "Fredoka, sans-serif" }}>
          WordScout<span style={{ color: t.brandDeep }}>11Plus</span>
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {user && (
          <>
            <NavLink active={view.name === "dashboard"} onClick={() => go({ name: "dashboard" })} icon={Home} label="Home" t={t} />
            <NavLink active={view.name === "leaderboard"} onClick={() => go({ name: "leaderboard" })} icon={Trophy} label="Leaderboard" t={t} />
            <NavLink active={view.name === "profile"} onClick={() => go({ name: "profile" })} icon={User} label="Profile" t={t} />
            {user.role === "admin" && (
              <NavLink active={view.name === "admin"} onClick={() => go({ name: "admin" })} icon={Shield} label="Admin" t={t} />
            )}
          </>
        )}
        <button onClick={() => setShowSettings((s) => !s)} title="Settings" style={iconBtn(t)}><Settings size={18} /></button>
        {user ? (
          <button onClick={() => { setUser(null); go({ name: "landing" }); }} style={iconBtn(t)} title="Sign out"><LogOut size={18} /></button>
        ) : (
          <button onClick={() => go({ name: "login" })} style={{ ...pill(BRAND), marginLeft: 4 }}>Sign in</button>
        )}
      </div>

      {showSettings && (
        <div style={{
          position: "absolute", right: 20, top: 66, background: surface,
          border: `1px solid ${border}`, borderRadius: 14, padding: 14, width: 220,
          boxShadow: "0 12px 40px rgba(0,0,0,0.18)", zIndex: 60,
        }}>
          <div style={{ fontWeight: 800, color: text, marginBottom: 10 }}>Settings</div>
          <button onClick={() => setDark((d) => !d)} style={{
            display: "flex", alignItems: "center", gap: 10, width: "100%",
            padding: "10px 12px", borderRadius: 10, border: `1px solid ${border}`,
            background: bg, color: text, cursor: "pointer", fontSize: 14, fontWeight: 700,
          }}>
            {dark ? <Sun size={16} /> : <Moon size={16} />}
            {dark ? "Light mode" : "Dark mode"}
          </button>
        </div>
      )}
    </div>
  );

  let screen;
  if (view.name === "landing") screen = <Landing t={t} onStart={() => go({ name: "login" })} onJoin={() => go({ name: "join" })} />;
  else if (view.name === "login") screen = <Auth mode="login" t={t} onAuth={(u) => { setUser(u); go({ name: u.role === "admin" ? "admin" : "dashboard" }); }} switchMode={() => go({ name: "register" })} />;
  else if (view.name === "register") screen = <Auth mode="register" t={t} onAuth={(u) => { setUser(u); go({ name: "dashboard" }); }} switchMode={() => go({ name: "login" })} />;
  else if (view.name === "join") screen = <JoinByCode t={t} sets={publishedSets} onPlay={(setId, mode) => go({ name: "game", setId, mode, guest: true })} />;
  else if (view.name === "dashboard") screen = <Dashboard t={t} sets={publishedSets} progress={progress} streak={streak} user={user} onOpen={(setId) => go({ name: "set", setId })} />;
  else if (view.name === "set") screen = <SetDetail t={t} set={sets.find((s) => s.id === view.setId)} progress={progress[view.setId] || {}} onBack={() => go({ name: "dashboard" })} onPlay={(mode) => go({ name: "game", setId: view.setId, mode })} />;
  else if (view.name === "game") screen = <GameHost t={t} set={sets.find((s) => s.id === view.setId)} mode={view.mode} onExit={() => go(view.guest ? { name: "join" } : { name: "set", setId: view.setId })} onFinish={(stars) => { if (!view.guest) awardStars(view.setId, view.mode, stars); }} />;
  else if (view.name === "profile") screen = <Profile t={t} user={user} progress={progress} sets={sets} streak={streak} />;
  else if (view.name === "leaderboard") screen = <Leaderboard t={t} user={user} />;
  else if (view.name === "admin") screen = <Admin t={t} sets={sets} setSets={setSets} />;

  return (
    <div style={{ minHeight: "100vh", background: bg, color: text, fontFamily: "'Nunito', system-ui, sans-serif" }}>
      <style>{`
        @keyframes pop { 0%{transform:scale(.8);opacity:0} 100%{transform:scale(1);opacity:1} }
        @keyframes fall { to { transform: translateY(420px) rotate(360deg); opacity: 0; } }
        .pop { animation: pop .25s ease both; }
        h1,h2,h3 { font-family: 'Fredoka', sans-serif; }
      `}</style>
      <Nav />
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 20px" }}>{screen}</div>
    </div>
  );
}

// ---------- UI helpers ----------
const iconBtn = (t) => ({
  display: "flex", alignItems: "center", justifyContent: "center",
  width: 38, height: 38, borderRadius: 10, border: `1px solid ${t.border}`,
  background: t.bg, color: t.text, cursor: "pointer",
});
const pill = (c) => ({
  padding: "9px 18px", borderRadius: 999, border: "none", background: c,
  color: textOn(c), fontWeight: 800, fontSize: 14, cursor: "pointer",
});
const NavLink = ({ active, onClick, icon: Icon, label, t }) => (
  <button onClick={onClick} style={{
    display: "flex", alignItems: "center", gap: 6, padding: "8px 12px",
    borderRadius: 10, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 800,
    background: active ? t.brand : "transparent", color: active ? INK : t.muted,
  }}>
    <Icon size={16} /> <span style={{ display: typeof window !== "undefined" && window.innerWidth < 640 ? "none" : "inline" }}>{label}</span>
  </button>
);
const card = (t) => ({ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 18, padding: 20 });

// ---------- Landing ----------
function Landing({ t, onStart, onJoin }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 0 80px" }}>
      <div style={{ display: "inline-flex", padding: 18, borderRadius: 24, background: t.brand, marginBottom: 22 }}>
        <Compass size={48} color={INK} />
      </div>
      <h1 style={{ fontSize: 46, margin: "0 0 12px", color: t.text, letterSpacing: -1 }}>
        Make 11+ vocabulary feel like an <span style={{ color: t.brandDeep }}>adventure</span>
      </h1>
      <p style={{ fontSize: 18, color: t.muted, maxWidth: 560, margin: "0 auto 30px" }}>
        Eight fun game modes. New word sets every week. Learn synonyms, antonyms, spellings and more — without the boring drills.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <button onClick={onStart} style={{ ...pill(t.brand), padding: "14px 28px", fontSize: 16 }}>Get started</button>
        <button onClick={onJoin} style={{
          padding: "14px 28px", borderRadius: 999, border: `2px solid ${t.gold}`,
          background: t.gold, color: INK, fontWeight: 800, fontSize: 16, cursor: "pointer",
        }}>Join with a code</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14, marginTop: 56 }}>
        {Object.values(GAME_THEMES).map((g) => (
          <div key={g.name} style={{ ...card(t), padding: 16, textAlign: "center" }}>
            <div style={{ display: "inline-flex", padding: 10, borderRadius: 12, background: g.accent + "22", marginBottom: 8 }}>
              <g.icon size={22} color={g.accent} />
            </div>
            <div style={{ fontWeight: 800, color: t.text, fontSize: 14 }}>{g.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Auth (mocked) ----------
function Auth({ mode, t, onAuth, switchMode }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [pw, setPw] = useState("");
  const isLogin = mode === "login";

  const submit = () => {
    const role = email.trim().toLowerCase() === "admin@wordscout11plus.com" ? "admin" : "student";
    onAuth({ name: name || (role === "admin" ? "Admin" : email.split("@")[0] || "Scout"), email, role });
  };
  const input = {
    width: "100%", padding: "12px 14px", borderRadius: 12, border: `1px solid ${t.border}`,
    background: t.bg, color: t.text, fontSize: 15, marginBottom: 12, outline: "none",
  };
  return (
    <div style={{ maxWidth: 400, margin: "50px auto" }}>
      <div style={card(t)}>
        <h2 style={{ marginTop: 0, color: t.text }}>{isLogin ? "Welcome back" : "Create your account"}</h2>
        {!isLogin && <input style={input} placeholder="Display name" value={name} onChange={(e) => setName(e.target.value)} />}
        <input style={input} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input style={input} type="password" placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} />
        <button onClick={submit} style={{ ...pill(t.brand), width: "100%", padding: 13, fontSize: 15 }}>
          {isLogin ? "Sign in" : "Create account"}
        </button>
        <button onClick={submit} style={{
          width: "100%", marginTop: 10, padding: 12, borderRadius: 12, cursor: "pointer",
          border: `1px solid ${t.border}`, background: t.surface, color: t.text, fontWeight: 700,
        }}>Continue with Google</button>
        <p style={{ textAlign: "center", color: t.muted, fontSize: 13, marginTop: 16 }}>
          {isLogin ? "New here? " : "Already have an account? "}
          <span onClick={switchMode} style={{ color: t.brandDeep, fontWeight: 800, cursor: "pointer" }}>
            {isLogin ? "Create an account" : "Sign in"}
          </span>
        </p>
        <p style={{ textAlign: "center", color: t.muted, fontSize: 11, marginTop: 6 }}>
          Tip: sign in as <b>admin@wordscout11plus.com</b> to see the admin panel.
        </p>
      </div>
    </div>
  );
}

// ---------- Join by code ----------
function JoinByCode({ t, sets, onPlay }) {
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const join = () => {
    if (code.trim().length < 4) { setErr("Enter a valid game code."); return; }
    if (!sets.length) { setErr("No sets available yet."); return; }
    onPlay(sets[0].id, "flashcards");
  };
  return (
    <div style={{ maxWidth: 420, margin: "60px auto", textAlign: "center" }}>
      <div style={card(t)}>
        <Hash size={36} color={t.brand} />
        <h2 style={{ color: t.text }}>Enter your game code</h2>
        <p style={{ color: t.muted, fontSize: 14 }}>No account needed — just type the code your teacher gave you.</p>
        <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={6} placeholder="ABC123"
          style={{
            width: "100%", textAlign: "center", letterSpacing: 8, fontSize: 28, fontWeight: 900,
            padding: "16px", borderRadius: 14, border: `2px solid ${t.border}`,
            background: t.bg, color: t.text, margin: "12px 0", outline: "none",
          }} />
        {err && <div style={{ color: "#d92d20", fontSize: 13, marginBottom: 8 }}>{err}</div>}
        <button onClick={join} style={{ ...pill(t.brand), width: "100%", padding: 13 }}>Join game</button>
      </div>
    </div>
  );
}

// ---------- Dashboard ----------
function Dashboard({ t, sets, progress, streak, user, onOpen }) {
  const thisWeek = sets[sets.length - 1];
  const starsFor = (id) => Object.values(progress[id] || {}).reduce((a, b) => a + b, 0);
  return (
    <div style={{ padding: "28px 0 60px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ color: t.text, margin: 0 }}>Hi {user?.name || "Scout"}</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: t.gold, border: `2px solid ${t.goldStroke}`, padding: "7px 14px", borderRadius: 999 }}>
          <Flame size={18} color={INK} />
          <span style={{ fontWeight: 800, color: INK }}>{streak} day streak</span>
        </div>
      </div>

      {thisWeek && (
        <div onClick={() => onOpen(thisWeek.id)} style={{
          ...card(t), marginTop: 22, background: t.brand, color: INK, cursor: "pointer", border: "none",
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.7, textTransform: "uppercase", letterSpacing: 1 }}>This week's set</div>
            <div style={{ fontSize: 26, fontWeight: 900, fontFamily: "Fredoka" }}>{thisWeek.title}</div>
            <div style={{ opacity: 0.85 }}>{thisWeek.items.length} words · {thisWeek.topic}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800 }}>Play now <ChevronRight /></div>
        </div>
      )}

      <h3 style={{ color: t.text, marginTop: 34 }}>Your set library</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 16 }}>
        {sets.map((s) => (
          <div key={s.id} onClick={() => onOpen(s.id)} style={{ ...card(t), cursor: "pointer" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: t.brandDeep, background: t.brand + "22", padding: "4px 10px", borderRadius: 999 }}>Week {s.week}</span>
              <span style={{ fontSize: 12, color: t.muted }}>{s.topic}</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: t.text, margin: "12px 0 4px" }}>{s.title}</div>
            <div style={{ fontSize: 13, color: t.muted, marginBottom: 12 }}>{s.items.length} words</div>
            <div style={{ display: "flex", gap: 3 }}>
              {[...Array(8)].map((_, i) => {
                const on = i < Math.min(8, starsFor(s.id));
                return <Star key={i} size={16} fill={on ? t.gold : "none"} color={on ? t.goldStroke : t.border} />;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Set detail ----------
function SetDetail({ t, set, progress, onBack, onPlay }) {
  if (!set) return null;
  return (
    <div style={{ padding: "24px 0 60px" }}>
      <button onClick={onBack} style={{ ...iconBtn(t), width: "auto", padding: "8px 14px", gap: 8, display: "flex", marginBottom: 18 }}>
        <ArrowLeft size={16} /> Back
      </button>
      <h1 style={{ color: t.text, margin: "0 0 4px" }}>{set.title}</h1>
      <p style={{ color: t.muted, marginTop: 0 }}>{set.description}</p>

      <h3 style={{ color: t.text }}>Choose a game</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 14 }}>
        {Object.entries(GAME_THEMES).map(([key, g]) => (
          <div key={key} onClick={() => onPlay(key)} style={{ ...card(t), cursor: "pointer", textAlign: "center", borderTop: `4px solid ${g.accent}` }}>
            <div style={{ display: "inline-flex", padding: 12, borderRadius: 14, background: g.accent + "22", marginBottom: 8 }}>
              <g.icon size={26} color={g.accent} />
            </div>
            <div style={{ fontWeight: 800, color: t.text }}>{g.name}</div>
            <div style={{ display: "flex", gap: 2, justifyContent: "center", marginTop: 6 }}>
              {[1, 2, 3].map((i) => {
                const on = i <= (progress[key] || 0);
                return <Star key={i} size={13} fill={on ? t.gold : "none"} color={on ? t.goldStroke : t.border} />;
              })}
            </div>
          </div>
        ))}
      </div>

      <h3 style={{ color: t.text, marginTop: 32 }}>Words in this set</h3>
      <div style={card(t)}>
        {set.items.map((it, i) => (
          <div key={i} style={{ padding: "10px 0", borderBottom: i < set.items.length - 1 ? `1px solid ${t.border}` : "none" }}>
            <span style={{ fontWeight: 800, color: t.text }}>{it.term}</span>
            <span style={{ color: t.muted, fontStyle: "italic", fontSize: 13 }}> ({it.pos})</span>
            <span style={{ color: t.muted }}> — {it.def}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Game host ----------
function GameHost({ t, set, mode, onExit, onFinish }) {
  const g = GAME_THEMES[mode];
  const [done, setDone] = useState(null);
  if (!set) return null;
  const finish = (result) => { onFinish(result.stars); setDone(result); };
  const common = { t, set, accent: g.accent, onFinish: finish };

  return (
    <div style={{ padding: "20px 0 60px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <button onClick={onExit} style={{ ...iconBtn(t), width: "auto", padding: "8px 14px", gap: 8, display: "flex" }}>
          <ArrowLeft size={16} /> Exit
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, color: t.text }}>
          <g.icon size={20} color={g.accent} /> {g.name}
        </div>
      </div>

      {done ? (
        <ResultScreen t={t} accent={g.accent} result={done} onReplay={() => setDone(null)} onExit={onExit} />
      ) : (
        <>
          {mode === "flashcards" && <Flashcards {...common} />}
          {mode === "fillblank" && <FillBlank {...common} />}
          {mode === "spelling" && <Spelling {...common} />}
          {mode === "match" && <MatchUp {...common} />}
          {mode === "kahoot" && <Kahoot {...common} />}
          {mode === "goldhunt" && <GoldHunt {...common} />}
          {mode === "hangman" && <Hangman {...common} />}
          {mode === "wordle" && <Wordle {...common} />}
        </>
      )}
    </div>
  );
}

function ResultScreen({ t, accent, result, onReplay, onExit }) {
  return (
    <div style={{ ...card(t), textAlign: "center", maxWidth: 460, margin: "30px auto", position: "relative", overflow: "hidden" }}>
      <Confetti accent={accent} />
      <h2 style={{ color: t.text }}>Great work</h2>
      <div style={{ display: "flex", gap: 6, justifyContent: "center", margin: "12px 0" }}>
        {[1, 2, 3].map((i) => (
          <Star key={i} size={42} fill={i <= result.stars ? t.gold : "none"} color={i <= result.stars ? t.goldStroke : t.border} className="pop" />
        ))}
      </div>
      {result.score != null && <p style={{ color: t.muted }}>You scored {result.score} / {result.total}</p>}
      {result.missed && result.missed.length > 0 && (
        <div style={{ textAlign: "left", background: t.bg, borderRadius: 12, padding: 14, margin: "12px 0" }}>
          <div style={{ fontWeight: 800, color: t.text, marginBottom: 6 }}>Words to review:</div>
          {result.missed.map((m, i) => <div key={i} style={{ color: t.muted }}>{m}</div>)}
        </div>
      )}
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 14 }}>
        <button onClick={onReplay} style={{ ...pill(accent), display: "flex", alignItems: "center", gap: 6 }}><RotateCcw size={16} /> Play again</button>
        <button onClick={onExit} style={{ padding: "9px 18px", borderRadius: 999, border: `1px solid ${t.border}`, background: t.surface, color: t.text, fontWeight: 800, cursor: "pointer" }}>Done</button>
      </div>
    </div>
  );
}

function Confetti({ accent }) {
  const colors = [accent, "#01B5C9", "#FFEB5B", "#FFF59A", "#0193A4"];
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {[...Array(24)].map((_, i) => (
        <div key={i} style={{
          position: "absolute", top: -10, left: `${(i * 4.1) % 100}%`,
          width: 8, height: 12, background: colors[i % colors.length], borderRadius: 2,
          animation: `fall ${1 + (i % 5) * 0.3}s linear ${(i % 7) * 0.1}s forwards`,
        }} />
      ))}
    </div>
  );
}

// ===== GAME 1: Flashcards =====
function Flashcards({ t, set, accent, onFinish }) {
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mastered, setMastered] = useState(0);
  const it = set.items[i];
  const mark = (got) => {
    if (got) setMastered((m) => m + 1);
    if (i + 1 >= set.items.length) {
      const score = mastered + (got ? 1 : 0);
      onFinish({ stars: stars(score, set.items.length), score, total: set.items.length });
    } else { setI(i + 1); setFlipped(false); }
  };
  return (
    <div style={{ textAlign: "center", maxWidth: 480, margin: "0 auto" }}>
      <ProgressBar t={t} accent={accent} value={i} total={set.items.length} />
      <div onClick={() => setFlipped((f) => !f)} style={{
        ...card(t), minHeight: 200, display: "flex", flexDirection: "column", justifyContent: "center",
        cursor: "pointer", borderTop: `5px solid ${accent}`, margin: "16px 0",
      }}>
        <div style={{ fontSize: 13, color: t.muted, marginBottom: 8 }}>{flipped ? "Definition" : "Tap to flip"}</div>
        {!flipped ? (
          <div style={{ fontSize: 34, fontWeight: 900, color: t.text, fontFamily: "Fredoka" }}>{it.term}</div>
        ) : (
          <div>
            <div style={{ fontSize: 18, color: t.text }}>{it.def}</div>
            <div style={{ fontSize: 13, color: t.muted, fontStyle: "italic", marginTop: 8 }}>"{it.example}"</div>
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <button onClick={() => mark(false)} style={{ ...pill("#94a3b8"), display: "flex", gap: 6, alignItems: "center" }}><X size={16} /> Not yet</button>
        <button onClick={() => mark(true)} style={{ ...pill(accent), display: "flex", gap: 6, alignItems: "center" }}><Check size={16} /> Got it</button>
      </div>
    </div>
  );
}

// ===== GAME 2: Fill in the blank =====
function FillBlank({ t, set, accent, onFinish }) {
  const [i, setI] = useState(0);
  const [val, setVal] = useState("");
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const it = set.items[i];
  const sentence = it.example.replace(new RegExp(it.term, "i"), "______");
  const check = () => {
    const correct = val.trim().toLowerCase() === it.term.toLowerCase();
    setFeedback({ correct, answer: it.term });
    if (correct) setScore((s) => s + 1);
  };
  const next = () => {
    if (i + 1 >= set.items.length) onFinish({ stars: stars(score, set.items.length), score, total: set.items.length });
    else { setI(i + 1); setVal(""); setFeedback(null); }
  };
  return (
    <div style={{ maxWidth: 520, margin: "0 auto" }}>
      <ProgressBar t={t} accent={accent} value={i} total={set.items.length} />
      <div style={{ ...card(t), margin: "16px 0", borderTop: `5px solid ${accent}` }}>
        <div style={{ fontSize: 22, color: t.text, lineHeight: 1.5, marginBottom: 16 }}>{sentence}</div>
        <input autoFocus value={val} disabled={!!feedback} onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (feedback ? next() : check())} placeholder="Type the missing word"
          style={{ width: "100%", padding: 14, fontSize: 18, borderRadius: 12, border: `2px solid ${feedback ? (feedback.correct ? "#16a34a" : "#d92d20") : t.border}`, background: t.bg, color: t.text, outline: "none" }} />
        {feedback && (
          <div style={{ marginTop: 12, color: feedback.correct ? "#16a34a" : "#d92d20", fontWeight: 800 }}>
            {feedback.correct ? "Correct" : `The answer was "${feedback.answer}"`}
          </div>
        )}
        <button onClick={feedback ? next : check} disabled={!val.trim() && !feedback}
          style={{ ...pill(accent), width: "100%", marginTop: 16, padding: 13, opacity: !val.trim() && !feedback ? 0.5 : 1 }}>
          {feedback ? (i + 1 >= set.items.length ? "Finish" : "Next") : "Check"}
        </button>
      </div>
    </div>
  );
}

// ===== GAME 3: Spelling test =====
function Spelling({ t, set, accent, onFinish }) {
  const [i, setI] = useState(0);
  const [val, setVal] = useState("");
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const it = set.items[i];
  const speak = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const u = new SpeechSynthesisUtterance(it.def);
      window.speechSynthesis.speak(u);
    }
  };
  useEffect(() => { speak(); /* eslint-disable-next-line */ }, [i]);
  const check = () => {
    const correct = val.trim().toLowerCase() === it.term.toLowerCase();
    setFeedback({ correct });
    if (correct) setScore((s) => s + 1); else setMissed((m) => [...m, it.term]);
  };
  const next = () => {
    if (i + 1 >= set.items.length) onFinish({ stars: stars(score, set.items.length), score, total: set.items.length, missed });
    else { setI(i + 1); setVal(""); setFeedback(null); }
  };
  return (
    <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
      <ProgressBar t={t} accent={accent} value={i} total={set.items.length} />
      <div style={{ ...card(t), margin: "16px 0", borderTop: `5px solid ${accent}` }}>
        <div style={{ fontSize: 14, color: t.muted, marginBottom: 6 }}>Spell the word from its definition:</div>
        <div style={{ fontSize: 18, color: t.text, marginBottom: 8 }}>{it.def}</div>
        <button onClick={speak} style={{ ...iconBtn(t), margin: "0 auto 16px", width: 46, height: 46, background: accent + "22", border: "none" }}>
          <Volume2 size={22} color={accent} />
        </button>
        <input autoFocus value={val} disabled={!!feedback} onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (feedback ? next() : check())} placeholder="Type the word"
          style={{ width: "100%", textAlign: "center", padding: 14, fontSize: 22, fontWeight: 800, borderRadius: 12, border: `2px solid ${feedback ? (feedback.correct ? "#16a34a" : "#d92d20") : t.border}`, background: t.bg, color: t.text, outline: "none" }} />
        {feedback && <div style={{ marginTop: 12, color: feedback.correct ? "#16a34a" : "#d92d20", fontWeight: 800 }}>{feedback.correct ? "Spot on" : `Correct spelling: ${it.term}`}</div>}
        <button onClick={feedback ? next : check} style={{ ...pill(accent), width: "100%", marginTop: 16, padding: 13 }}>
          {feedback ? (i + 1 >= set.items.length ? "Finish" : "Next word") : "Check"}
        </button>
      </div>
    </div>
  );
}

// ===== GAME 4: Match-up pairs =====
function MatchUp({ t, set, accent, onFinish }) {
  const pairItems = set.items.slice(0, 5);
  const deck = useMemo(() => {
    const cards = [];
    pairItems.forEach((it, idx) => {
      cards.push({ id: "t" + idx, pair: idx, label: it.term, type: "term" });
      cards.push({ id: "d" + idx, pair: idx, label: it.def, type: "def" });
    });
    return shuffle(cards);
    // eslint-disable-next-line
  }, [set.id]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const click = (cardObj) => {
    if (flipped.length === 2 || flipped.find((c) => c.id === cardObj.id) || matched.includes(cardObj.pair)) return;
    const nf = [...flipped, cardObj];
    setFlipped(nf);
    if (nf.length === 2) {
      setMoves((m) => m + 1);
      if (nf[0].pair === nf[1].pair) {
        setTimeout(() => {
          const nm = [...matched, cardObj.pair];
          setMatched(nm); setFlipped([]);
          if (nm.length === pairItems.length) {
            const s = moves + 1 <= pairItems.length + 1 ? 3 : moves + 1 <= pairItems.length + 4 ? 2 : 1;
            setTimeout(() => onFinish({ stars: s, score: pairItems.length, total: pairItems.length }), 300);
          }
        }, 450);
      } else setTimeout(() => setFlipped([]), 800);
    }
  };
  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <div style={{ textAlign: "center", color: t.muted, marginBottom: 12 }}>Moves: {moves} · Matched: {matched.length}/{pairItems.length}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 10 }}>
        {deck.map((cardObj) => {
          const isUp = flipped.find((c) => c.id === cardObj.id) || matched.includes(cardObj.pair);
          const isMatch = matched.includes(cardObj.pair);
          const bgc = isUp ? (isMatch ? "#16a34a" : accent) : t.surface;
          return (
            <div key={cardObj.id} onClick={() => click(cardObj)} style={{
              minHeight: 90, borderRadius: 14, padding: 10, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center",
              fontSize: cardObj.type === "term" ? 16 : 12, fontWeight: cardObj.type === "term" ? 800 : 600,
              background: bgc, color: isUp ? textOn(bgc) : t.muted, border: `2px solid ${isUp ? "transparent" : t.border}`,
              transition: "all .2s",
            }}>{isUp ? cardObj.label : "?"}</div>
          );
        })}
      </div>
    </div>
  );
}

// ===== GAME 5: Kahoot-style quiz =====
function Kahoot({ t, set, accent, onFinish }) {
  const questions = useMemo(() => set.items.map((it, idx) => {
    const wrong = shuffle(set.items.filter((_, j) => j !== idx)).slice(0, 3).map((w) => w.def);
    return { q: it.term, correct: it.def, options: shuffle([it.def, ...wrong]) };
  }), [set.id]);
  const COLORS = ["#01B5C9", "#0193A4", "#017A8A", "#015E6B"];
  const [i, setI] = useState(0);
  const [time, setTime] = useState(20);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null);
  const q = questions[i];
  useEffect(() => {
    if (picked != null) return;
    if (time <= 0) { answer(null); return; }
    const tm = setTimeout(() => setTime((s) => s - 1), 1000);
    return () => clearTimeout(tm);
    // eslint-disable-next-line
  }, [time, picked]);
  const answer = (opt) => {
    setPicked(opt ?? "timeout");
    if (opt === q.correct) setScore((s) => s + 100 + time * 5);
    setTimeout(() => {
      if (i + 1 >= questions.length) {
        const max = questions.length * 200;
        onFinish({ stars: stars(score, max * 0.6), score, total: questions.length });
      } else { setI(i + 1); setTime(20); setPicked(null); }
    }, 1100);
  };
  return (
    <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "space-between", color: t.muted, fontWeight: 800 }}>
        <span>Q{i + 1}/{questions.length}</span>
        <span>Score: {score}</span>
        <span style={{ color: time <= 5 ? "#d92d20" : t.text }}>Time {time}s</span>
      </div>
      <div style={{ ...card(t), margin: "14px 0", padding: 28, fontSize: 26, fontWeight: 900, color: t.text, fontFamily: "Fredoka" }}>
        What does "{q.q}" mean?
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {q.options.map((opt, idx) => {
          let bgc = COLORS[idx];
          if (picked != null) bgc = opt === q.correct ? "#16a34a" : (opt === picked ? "#94a3b8" : COLORS[idx]);
          const faded = picked != null && opt !== q.correct && opt !== picked;
          return (
            <button key={idx} onClick={() => picked == null && answer(opt)} style={{
              padding: 18, borderRadius: 14, border: "none", background: bgc, color: textOn(bgc),
              fontWeight: 800, fontSize: 15, cursor: picked == null ? "pointer" : "default", minHeight: 70,
              opacity: faded ? 0.45 : 1,
            }}>{opt}</button>
          );
        })}
      </div>
    </div>
  );
}

// ===== GAME 6: Gold Hunt =====
function GoldHunt({ t, set, accent, onFinish }) {
  const questions = useMemo(() => set.items.map((it, idx) => {
    const wrong = shuffle(set.items.filter((_, j) => j !== idx)).slice(0, 2).map((w) => w.term);
    return { def: it.def, correct: it.term, options: shuffle([it.term, ...wrong]) };
  }), [set.id]);
  const [i, setI] = useState(0);
  const [coins, setCoins] = useState(0);
  const [revealed, setRevealed] = useState([]);
  const q = questions[i];
  const answer = (opt) => {
    const right = opt === q.correct;
    if (right) { setCoins((c) => c + 10); setRevealed((r) => [...r, i]); }
    if (i + 1 >= questions.length) {
      onFinish({ stars: stars(coins + (right ? 10 : 0), questions.length * 10 * 0.6), score: coins + (right ? 10 : 0), total: questions.length * 10 });
    } else setI(i + 1);
  };
  return (
    <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontWeight: 900, fontSize: 22, color: t.text, marginBottom: 12 }}>
        <Star size={24} fill={t.gold} color={t.goldStroke} /> {coins} coins
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6, maxWidth: 280, margin: "0 auto 18px" }}>
        {questions.map((_, idx) => (
          <div key={idx} style={{
            aspectRatio: "1", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
            background: revealed.includes(idx) ? t.gold : t.surface, border: `2px solid ${revealed.includes(idx) ? t.goldStroke : t.border}`,
          }}>{revealed.includes(idx) ? <Star size={18} fill={INK} color={INK} /> : <Lock size={14} color={t.muted} />}</div>
        ))}
      </div>
      <div style={{ ...card(t), borderTop: `5px solid ${accent}` }}>
        <div style={{ fontSize: 14, color: t.muted }}>Which word means:</div>
        <div style={{ fontSize: 20, color: t.text, fontWeight: 700, margin: "8px 0 16px" }}>{q.def}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {q.options.map((opt, idx) => (
            <button key={idx} onClick={() => answer(opt)} style={{ ...pill(accent), padding: 14, fontSize: 16 }}>{opt}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== GAME 7: Hangman =====
function Hangman({ t, set, accent, onFinish }) {
  const word = useMemo(() => set.items[Math.floor(Math.random() * set.items.length)].term.toUpperCase(), [set.id]);
  const [guessed, setGuessed] = useState([]);
  const wrong = guessed.filter((l) => !word.includes(l)).length;
  const won = word.split("").every((l) => guessed.includes(l) || l === " ");
  const lost = wrong >= 6;
  const ended = won || lost;
  useEffect(() => {
    if (won) setTimeout(() => onFinish({ stars: wrong === 0 ? 3 : wrong <= 2 ? 2 : 1, score: 1, total: 1 }), 900);
    if (lost) setTimeout(() => onFinish({ stars: 0, score: 0, total: 1, missed: [word] }), 1200);
    // eslint-disable-next-line
  }, [won, lost]);
  const guess = (l) => !ended && !guessed.includes(l) && setGuessed((g) => [...g, l]);
  const lives = 6 - wrong;
  return (
    <div style={{ maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
      <svg viewBox="0 0 120 120" style={{ width: 160, height: 160 }}>
        <line x1="10" y1="115" x2="70" y2="115" stroke={t.muted} strokeWidth="3" />
        <line x1="30" y1="115" x2="30" y2="10" stroke={t.muted} strokeWidth="3" />
        <line x1="30" y1="10" x2="75" y2="10" stroke={t.muted} strokeWidth="3" />
        <line x1="75" y1="10" x2="75" y2="25" stroke={t.muted} strokeWidth="3" />
        {wrong > 0 && <circle cx="75" cy="33" r="8" stroke={accent} strokeWidth="3" fill="none" />}
        {wrong > 1 && <line x1="75" y1="41" x2="75" y2="70" stroke={accent} strokeWidth="3" />}
        {wrong > 2 && <line x1="75" y1="50" x2="62" y2="60" stroke={accent} strokeWidth="3" />}
        {wrong > 3 && <line x1="75" y1="50" x2="88" y2="60" stroke={accent} strokeWidth="3" />}
        {wrong > 4 && <line x1="75" y1="70" x2="63" y2="85" stroke={accent} strokeWidth="3" />}
        {wrong > 5 && <line x1="75" y1="70" x2="87" y2="85" stroke={accent} strokeWidth="3" />}
      </svg>
      <div style={{ fontSize: 13, color: t.muted }}>Topic: {set.topic}</div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", margin: "16px 0", flexWrap: "wrap" }}>
        {word.split("").map((l, idx) => (
          <div key={idx} style={{
            width: 34, height: 44, borderBottom: `3px solid ${t.text}`, fontSize: 28, fontWeight: 900,
            color: lost && !guessed.includes(l) ? "#d92d20" : t.text,
          }}>{guessed.includes(l) || lost ? l : ""}</div>
        ))}
      </div>
      <div style={{ color: t.muted, marginBottom: 10 }}>Lives: {lives}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", maxWidth: 460, margin: "0 auto" }}>
        {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((l) => {
          const used = guessed.includes(l);
          const ok = used && word.includes(l);
          const bgc = used ? (ok ? "#16a34a" : "#94a3b8") : accent;
          return (
            <button key={l} onClick={() => guess(l)} disabled={used || ended} style={{
              width: 34, height: 40, borderRadius: 8, border: "none", fontWeight: 800, cursor: used ? "default" : "pointer",
              background: bgc, color: textOn(bgc), opacity: used ? 0.75 : 1,
            }}>{l}</button>
          );
        })}
      </div>
    </div>
  );
}

// ===== GAME 8: Wordle (no hints) =====
function Wordle({ t, set, accent, onFinish }) {
  const word = useMemo(() => {
    const candidates = set.items.map((it) => it.term.toUpperCase()).filter((w) => /^[A-Z]+$/.test(w));
    return candidates[Math.floor(Math.random() * candidates.length)] || "ABUNDANT";
  }, [set.id]);
  const LEN = word.length;
  const MAX = 6;
  const [guesses, setGuesses] = useState([]);
  const [cur, setCur] = useState("");
  const won = guesses.includes(word);
  const lost = guesses.length >= MAX && !won;
  const ended = won || lost;
  useEffect(() => {
    if (won) setTimeout(() => onFinish({ stars: guesses.length <= 2 ? 3 : guesses.length <= 4 ? 2 : 1, score: 1, total: 1 }), 700);
    if (lost) setTimeout(() => onFinish({ stars: 0, score: 0, total: 1, missed: [word] }), 1000);
    // eslint-disable-next-line
  }, [won, lost]);
  const submit = () => { if (cur.length !== LEN || ended) return; setGuesses((g) => [...g, cur]); setCur(""); };
  const type = (k) => {
    if (ended) return;
    if (k === "ENTER") submit();
    else if (k === "DEL") setCur((c) => c.slice(0, -1));
    else if (cur.length < LEN) setCur((c) => c + k);
  };
  // brand: correct = cyan, present = yellow, absent = grey
  const CORRECT = "#01B5C9", PRESENT = "#FFEB5B", ABSENT = "#64748b";
  const letterState = (guess, idx) => {
    const l = guess[idx];
    if (word[idx] === l) return CORRECT;
    if (word.includes(l)) return PRESENT;
    return ABSENT;
  };
  const keyState = (l) => {
    let st = "";
    guesses.forEach((g) => g.split("").forEach((gl, idx) => {
      if (gl !== l) return;
      if (word[idx] === l) st = CORRECT;
      else if (word.includes(l) && st !== CORRECT) st = PRESENT;
      else if (!word.includes(l) && !st) st = ABSENT;
    }));
    return st;
  };
  const rows = [...guesses, ...(ended ? [] : [cur]), ...Array(Math.max(0, MAX - guesses.length - (ended ? 0 : 1))).fill(null)].slice(0, MAX);
  return (
    <div style={{ maxWidth: 420, margin: "0 auto", textAlign: "center" }}>
      <div style={{ fontSize: 13, color: t.muted, marginBottom: 12 }}>Guess the {LEN}-letter word from this set. No hints.</div>
      <div style={{ display: "grid", gap: 6, justifyContent: "center", marginBottom: 18 }}>
        {rows.map((g, ri) => (
          <div key={ri} style={{ display: "flex", gap: 6 }}>
            {Array(LEN).fill(0).map((_, ci) => {
              const isGuess = g != null && ri < guesses.length;
              const bgc = isGuess ? letterState(g, ci) : "transparent";
              return (
                <div key={ci} style={{
                  width: 42, height: 42, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, fontWeight: 900, color: isGuess ? textOn(bgc) : t.text,
                  background: bgc, border: isGuess ? "none" : `2px solid ${t.border}`,
                }}>{g != null ? (g[ci] || "") : ""}</div>
              );
            })}
          </div>
        ))}
      </div>
      <Keyboard t={t} onKey={type} keyState={keyState} />
    </div>
  );
}
function Keyboard({ t, onKey, keyState }) {
  const rows = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
      {rows.map((row, i) => (
        <div key={i} style={{ display: "flex", gap: 4 }}>
          {i === 2 && <KbKey label="ENTER" wide t={t} onKey={onKey} />}
          {row.split("").map((l) => <KbKey key={l} label={l} t={t} onKey={onKey} state={keyState(l)} />)}
          {i === 2 && <KbKey label="DEL" wide t={t} onKey={onKey} />}
        </div>
      ))}
    </div>
  );
}
function KbKey({ label, wide, t, onKey, state }) {
  return (
    <button onClick={() => onKey(label)} style={{
      minWidth: wide ? 52 : 30, height: 46, borderRadius: 6, cursor: "pointer",
      fontWeight: 800, fontSize: wide ? 11 : 14,
      background: state || t.surface, color: state ? textOn(state) : t.text,
      border: state ? "none" : `1px solid ${t.border}`,
    }}>{label}</button>
  );
}

// ---------- Profile ----------
function Profile({ t, user, progress, sets, streak }) {
  const totalStars = Object.values(progress).reduce((a, m) => a + Object.values(m).reduce((x, y) => x + y, 0), 0);
  const wordsLearned = sets.filter((s) => progress[s.id]).reduce((a, s) => a + s.items.length, 0);
  const badges = [
    { name: "First steps", earned: totalStars > 0 },
    { name: "7-day streak", earned: streak >= 7 },
    { name: "Star collector", earned: totalStars >= 10 },
    { name: "Word wizard", earned: wordsLearned >= 10 },
  ];
  return (
    <div style={{ padding: "28px 0", maxWidth: 640, margin: "0 auto" }}>
      <div style={{ ...card(t), textAlign: "center" }}>
        <div style={{ width: 80, height: 80, borderRadius: 999, background: t.brand, color: INK, fontSize: 34, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
          {(user?.name || "S")[0].toUpperCase()}
        </div>
        <h2 style={{ color: t.text, margin: "0 0 4px" }}>{user?.name}</h2>
        <div style={{ color: t.muted }}>{user?.email}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginTop: 16 }}>
        <Stat t={t} label="Stars" value={totalStars} icon={Star} />
        <Stat t={t} label="Words learned" value={wordsLearned} icon={BookOpen} />
        <Stat t={t} label="Day streak" value={streak} icon={Flame} />
      </div>
      <h3 style={{ color: t.text, marginTop: 28 }}>Badges</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 12 }}>
        {badges.map((b) => (
          <div key={b.name} style={{ ...card(t), textAlign: "center", opacity: b.earned ? 1 : 0.45 }}>
            <Trophy size={28} color={b.earned ? t.goldStroke : t.muted} fill={b.earned ? t.gold : "none"} />
            <div style={{ fontWeight: 800, color: t.text, marginTop: 8, fontSize: 13 }}>{b.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
const Stat = ({ t, label, value, icon: Icon }) => (
  <div style={{ ...card(t), textAlign: "center" }}>
    <Icon size={22} color={t.brand} />
    <div style={{ fontSize: 28, fontWeight: 900, color: t.text }}>{value}</div>
    <div style={{ fontSize: 12, color: t.muted }}>{label}</div>
  </div>
);

// ---------- Leaderboard ----------
function Leaderboard({ t, user }) {
  const rows = [
    { name: "Maya", stars: 42 }, { name: "Leo", stars: 38 },
    { name: user?.name || "You", stars: 31, me: true },
    { name: "Aisha", stars: 27 }, { name: "Tom", stars: 19 },
  ].sort((a, b) => b.stars - a.stars);
  return (
    <div style={{ padding: "28px 0", maxWidth: 540, margin: "0 auto" }}>
      <h1 style={{ color: t.text }}>Leaderboard</h1>
      <div style={card(t)}>
        {rows.map((r, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 8px",
            borderBottom: i < rows.length - 1 ? `1px solid ${t.border}` : "none",
            background: r.me ? t.brand + "22" : "transparent", borderRadius: 8,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontWeight: 900, color: i < 3 ? t.goldStroke : t.muted, width: 24 }}>#{i + 1}</span>
              <span style={{ fontWeight: 800, color: t.text }}>{r.name}{r.me && " (you)"}</span>
            </div>
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: 800, color: t.text }}>
              <Star size={15} fill={t.gold} color={t.goldStroke} /> {r.stars}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Admin ----------
function Admin({ t, sets, setSets }) {
  const [tab, setTab] = useState("sets");
  const [editing, setEditing] = useState(null);
  const togglePublish = (id) => setSets((ss) => ss.map((s) => s.id === id ? { ...s, published: !s.published } : s));
  const remove = (id) => setSets((ss) => ss.filter((s) => s.id !== id));
  return (
    <div style={{ padding: "28px 0 60px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Shield size={26} color={t.brand} />
        <h1 style={{ color: t.text, margin: 0 }}>Admin dashboard</h1>
      </div>
      <div style={{ display: "flex", gap: 8, margin: "18px 0", flexWrap: "wrap" }}>
        {[["sets", "Sets", BookOpen], ["users", "Users", Users], ["codes", "Game codes", Hash]].map(([k, lbl, Ic]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, cursor: "pointer",
            border: `1px solid ${t.border}`, fontWeight: 800, background: tab === k ? t.brand : t.surface, color: tab === k ? INK : t.text,
          }}><Ic size={15} /> {lbl}</button>
        ))}
      </div>

      {tab === "sets" && (
        <>
          <button onClick={() => setEditing({ id: "wk" + (sets.length + 1) + "-" + Date.now(), week: sets.length + 1, title: "", topic: "Synonyms", description: "", published: false, releaseDate: "", items: [{ term: "", pos: "", def: "", example: "" }] })}
            style={{ ...pill(t.brand), display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
            <Plus size={16} /> New set
          </button>
          <div style={{ display: "grid", gap: 12 }}>
            {sets.map((s) => (
              <div key={s.id} style={{ ...card(t), display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 800, color: t.text }}>Week {s.week} · {s.title || "(untitled)"}</div>
                  <div style={{ fontSize: 13, color: t.muted }}>{s.topic} · {s.items.length} words · {s.published ? "Published" : "Locked"}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => togglePublish(s.id)} style={{ ...pill(s.published ? "#94a3b8" : "#16a34a"), padding: "8px 14px", fontSize: 13 }}>
                    {s.published ? "Lock" : "Publish"}
                  </button>
                  <button onClick={() => setEditing(s)} style={iconBtn(t)}><Edit size={16} /></button>
                  <button onClick={() => remove(s.id)} style={{ ...iconBtn(t), color: "#d92d20" }}><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "users" && (
        <div style={card(t)}>
          {[{ n: "Maya R.", e: "maya@example.com", r: "student" }, { n: "Parent (Tom's mum)", e: "parent@example.com", r: "parent" }, { n: "Admin", e: "admin@wordscout11plus.com", r: "admin" }].map((u, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: i < 2 ? `1px solid ${t.border}` : "none" }}>
              <div><div style={{ fontWeight: 800, color: t.text }}>{u.n}</div><div style={{ fontSize: 13, color: t.muted }}>{u.e}</div></div>
              <span style={{ fontSize: 12, fontWeight: 800, color: t.brandDeep, background: t.brand + "22", padding: "4px 12px", borderRadius: 999, height: "fit-content" }}>{u.r}</span>
            </div>
          ))}
        </div>
      )}

      {tab === "codes" && <CodeGen t={t} sets={sets} />}

      {editing && <SetEditor t={t} draft={editing} onClose={() => setEditing(null)} onSave={(d) => {
        setSets((ss) => ss.find((s) => s.id === d.id) ? ss.map((s) => s.id === d.id ? d : s) : [...ss, d]);
        setEditing(null);
      }} />}
    </div>
  );
}

function CodeGen({ t, sets }) {
  const [setId, setSetId] = useState(sets[0]?.id || "");
  const [mode, setMode] = useState("flashcards");
  const [code, setCode] = useState("");
  const gen = () => setCode(Math.random().toString(36).slice(2, 8).toUpperCase());
  return (
    <div style={card(t)}>
      <div style={{ display: "grid", gap: 12 }}>
        <select value={setId} onChange={(e) => setSetId(e.target.value)} style={selStyle(t)}>
          {sets.map((s) => <option key={s.id} value={s.id}>{s.title || "(untitled)"}</option>)}
        </select>
        <select value={mode} onChange={(e) => setMode(e.target.value)} style={selStyle(t)}>
          {Object.entries(GAME_THEMES).map(([k, g]) => <option key={k} value={k}>{g.name}</option>)}
        </select>
        <button onClick={gen} style={{ ...pill(t.brand), padding: 12 }}>Generate code</button>
        {code && (
          <div style={{ textAlign: "center", padding: 20, background: t.bg, borderRadius: 12 }}>
            <div style={{ fontSize: 13, color: t.muted }}>Share this code:</div>
            <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: 6, color: t.brandDeep }}>{code}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function SetEditor({ t, draft, onClose, onSave }) {
  const [d, setD] = useState(draft);
  const upd = (k, v) => setD({ ...d, [k]: v });
  const updItem = (i, k, v) => setD({ ...d, items: d.items.map((it, j) => j === i ? { ...it, [k]: v } : it) });
  const addItem = () => setD({ ...d, items: [...d.items, { term: "", pos: "", def: "", example: "" }] });
  const delItem = (i) => setD({ ...d, items: d.items.filter((_, j) => j !== i) });
  return (
    <div style={{ background: "rgba(0,0,0,0.45)", borderRadius: 16, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "30px 14px", marginTop: 20 }}>
      <div style={{ ...card(t), width: "100%", maxWidth: 640 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ color: t.text, margin: 0 }}>Edit set</h2>
          <button onClick={onClose} style={iconBtn(t)}><X size={18} /></button>
        </div>
        <div style={{ display: "grid", gap: 10, margin: "16px 0" }}>
          <input value={d.title} onChange={(e) => upd("title", e.target.value)} placeholder="Set title" style={selStyle(t)} />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input value={d.topic} onChange={(e) => upd("topic", e.target.value)} placeholder="Topic" style={{ ...selStyle(t), flex: 1, minWidth: 140 }} />
            <input type="date" value={d.releaseDate} onChange={(e) => upd("releaseDate", e.target.value)} style={{ ...selStyle(t), flex: 1, minWidth: 140 }} />
          </div>
          <textarea value={d.description} onChange={(e) => upd("description", e.target.value)} placeholder="Description" style={{ ...selStyle(t), minHeight: 60 }} />
        </div>
        <div style={{ fontWeight: 800, color: t.text, marginBottom: 8 }}>Words</div>
        {d.items.map((it, i) => (
          <div key={i} style={{ border: `1px solid ${t.border}`, borderRadius: 12, padding: 12, marginBottom: 10 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
              <input value={it.term} onChange={(e) => updItem(i, "term", e.target.value)} placeholder="Term" style={{ ...selStyle(t), flex: 1, minWidth: 120 }} />
              <input value={it.pos} onChange={(e) => updItem(i, "pos", e.target.value)} placeholder="Part of speech" style={{ ...selStyle(t), flex: 1, minWidth: 120 }} />
              <button onClick={() => delItem(i)} style={{ ...iconBtn(t), color: "#d92d20" }}><Trash2 size={15} /></button>
            </div>
            <input value={it.def} onChange={(e) => updItem(i, "def", e.target.value)} placeholder="Definition" style={{ ...selStyle(t), marginBottom: 8 }} />
            <input value={it.example} onChange={(e) => updItem(i, "example", e.target.value)} placeholder="Example sentence (use the term in it)" style={selStyle(t)} />
          </div>
        ))}
        <button onClick={addItem} style={{ ...iconBtn(t), width: "auto", padding: "8px 14px", gap: 6, display: "inline-flex", marginBottom: 16 }}><Plus size={15} /> Add word</button>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => onSave(d)} style={{ ...pill(t.brand), flex: 1, padding: 12 }}>Save set</button>
          <button onClick={onClose} style={{ padding: 12, borderRadius: 999, border: `1px solid ${t.border}`, background: t.surface, color: t.text, fontWeight: 800, cursor: "pointer", flex: 1 }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
const selStyle = (t) => ({
  width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${t.border}`,
  background: t.bg, color: t.text, fontSize: 14, outline: "none",
});

// ---------- shared bits ----------
function ProgressBar({ t, accent, value, total }) {
  return (
    <div style={{ height: 8, background: t.border, borderRadius: 999, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${(value / total) * 100}%`, background: accent, transition: "width .3s" }} />
    </div>
  );
}
function stars(score, total) {
  const pct = total > 0 ? score / total : 0;
  if (pct >= 0.9) return 3;
  if (pct >= 0.6) return 2;
  if (pct > 0) return 1;
  return 0;
}
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
