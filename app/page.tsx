"use client";

import { useState, useEffect, useRef, useCallback, type CSSProperties } from "react";

// ─── Program Data ─────────────────────────────────────────────────────────────

interface Exercise {
  name: string;
  cat: "main" | "accessory";
  sets: number;
  reps: number;
  repsLabel: string;
  weight: string;
  rest: number; // seconds
  note?: string;
}

interface WorkoutDay {
  id: string;
  label: string;
  day: string;
  type: "heavy" | "volume";
  muscles: string;
  totalTime: string;
  exercises: Exercise[];
}

const PROGRAM: WorkoutDay[] = [
  {
    id: "push-a", label: "Push A", day: "월요일", type: "heavy",
    muscles: "가슴 · 어깨 · 삼두", totalTime: "약 75분",
    exercises: [
      { name: "벤치프레스", cat: "main", sets: 4, reps: 5, repsLabel: "5", weight: "87.5kg", rest: 210, note: "마지막 세트 최대 6회 도전" },
      { name: "오버헤드 프레스", cat: "main", sets: 4, reps: 6, repsLabel: "6", weight: "52.5kg", rest: 180 },
      { name: "인클라인 덤벨 프레스", cat: "accessory", sets: 3, reps: 10, repsLabel: "10", weight: "32.5kg × 2", rest: 120 },
      { name: "레터럴 레이즈", cat: "accessory", sets: 4, reps: 12, repsLabel: "12", weight: "12kg", rest: 90 },
      { name: "트라이셉 푸시다운", cat: "accessory", sets: 3, reps: 12, repsLabel: "12", weight: "30kg (케이블)", rest: 90 },
    ],
  },
  {
    id: "pull-a", label: "Pull A", day: "화요일", type: "heavy",
    muscles: "등 · 이두 · 후면삼각근", totalTime: "약 70분",
    exercises: [
      { name: "데드리프트", cat: "main", sets: 3, reps: 5, repsLabel: "5", weight: "102.5kg", rest: 270, note: "CNS 피로 높음 — 세트 간 충분히 쉬기" },
      { name: "바벨 로우", cat: "main", sets: 4, reps: 6, repsLabel: "6", weight: "67.5kg", rest: 180 },
      { name: "랫 풀다운", cat: "accessory", sets: 3, reps: 10, repsLabel: "10", weight: "70kg (케이블)", rest: 120 },
      { name: "페이스 풀", cat: "accessory", sets: 3, reps: 15, repsLabel: "15", weight: "20kg (케이블)", rest: 90, note: "회전근개 건강에 필수" },
      { name: "바벨 컬", cat: "accessory", sets: 3, reps: 10, repsLabel: "10", weight: "35kg", rest: 90 },
    ],
  },
  {
    id: "legs-a", label: "Legs A", day: "수요일", type: "heavy",
    muscles: "대퇴사두 · 둔근 · 햄스트링", totalTime: "약 80분",
    exercises: [
      { name: "스쿼트", cat: "main", sets: 4, reps: 5, repsLabel: "5", weight: "95kg", rest: 210 },
      { name: "루마니안 데드리프트", cat: "main", sets: 3, reps: 8, repsLabel: "8", weight: "80kg", rest: 180, note: "햄스트링 스트레치 집중, 허리 아치 유지" },
      { name: "레그 프레스", cat: "accessory", sets: 3, reps: 12, repsLabel: "12", weight: "120kg (머신)", rest: 120 },
      { name: "레그 컬", cat: "accessory", sets: 3, reps: 10, repsLabel: "10", weight: "50kg (머신)", rest: 120 },
      { name: "카프 레이즈", cat: "accessory", sets: 4, reps: 15, repsLabel: "15", weight: "80kg (머신)", rest: 60 },
    ],
  },
  {
    id: "push-b", label: "Push B", day: "목요일", type: "volume",
    muscles: "가슴 · 어깨 · 삼두", totalTime: "약 70분",
    exercises: [
      { name: "벤치프레스", cat: "main", sets: 4, reps: 10, repsLabel: "10", weight: "75kg", rest: 150, note: "마지막 1~2 reps는 RPE 8 이내로" },
      { name: "오버헤드 프레스", cat: "main", sets: 4, reps: 10, repsLabel: "10", weight: "45kg", rest: 120 },
      { name: "덤벨 플라이", cat: "accessory", sets: 3, reps: 15, repsLabel: "15", weight: "20kg × 2", rest: 90 },
      { name: "케이블 레터럴 레이즈", cat: "accessory", sets: 3, reps: 15, repsLabel: "15", weight: "8kg (케이블)", rest: 60 },
      { name: "오버헤드 트라이셉 익스텐션", cat: "accessory", sets: 3, reps: 12, repsLabel: "12", weight: "25kg (덤벨)", rest: 90 },
    ],
  },
  {
    id: "pull-b", label: "Pull B", day: "금요일", type: "volume",
    muscles: "등 · 이두 · 후면삼각근", totalTime: "약 65분",
    exercises: [
      { name: "데드리프트", cat: "main", sets: 3, reps: 8, repsLabel: "8", weight: "87.5kg", rest: 180, note: "볼륨 데드 — 폼 우선, 허리 라운딩 금지" },
      { name: "케이블 로우", cat: "main", sets: 4, reps: 12, repsLabel: "12", weight: "60kg (케이블)", rest: 120 },
      { name: "풀업", cat: "accessory", sets: 3, reps: 8, repsLabel: "8~10", weight: "체중", rest: 120, note: "가능하면 +5~10kg 추가" },
      { name: "리어 델트 플라이", cat: "accessory", sets: 3, reps: 15, repsLabel: "15", weight: "15kg (덤벨)", rest: 60 },
      { name: "해머 컬", cat: "accessory", sets: 3, reps: 12, repsLabel: "12", weight: "22.5kg (덤벨)", rest: 90 },
    ],
  },
  {
    id: "legs-b", label: "Legs B", day: "토요일", type: "volume",
    muscles: "대퇴사두 · 둔근 · 햄스트링", totalTime: "약 75분",
    exercises: [
      { name: "스쿼트", cat: "main", sets: 4, reps: 10, repsLabel: "10", weight: "80kg", rest: 150 },
      { name: "워킹 런지", cat: "main", sets: 3, reps: 12, repsLabel: "12 (각 다리)", weight: "20kg × 2", rest: 120 },
      { name: "레그 프레스", cat: "accessory", sets: 4, reps: 15, repsLabel: "15", weight: "100kg (머신)", rest: 120 },
      { name: "시티드 레그 컬", cat: "accessory", sets: 3, reps: 15, repsLabel: "15", weight: "40kg (머신)", rest: 90 },
      { name: "카프 레이즈", cat: "accessory", sets: 4, reps: 20, repsLabel: "20", weight: "60kg (머신)", rest: 10 },
    ],
  },
];

const KO_COUNTS = [
  "하나", "둘", "셋", "넷", "다섯", "여섯", "일곱", "여덟", "아홉", "열",
  "열하나", "열둘", "열셋", "열넷", "열다섯", "열여섯", "열일곱", "열여덟", "열아홉", "스물",
];

function getCountInterval(cat: "main" | "accessory", reps: number): number {
  if (cat === "main" && reps <= 6) return 4.0;
  if (cat === "main") return 3.0;
  if (reps >= 15) return 2.0;
  return 2.5;
}

function getTodayProgramIndex(): number {
  const d = new Date().getDay(); // 0=Sun
  if (d === 0) return 0;
  return d - 1; // Mon=0 … Sat=5
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const C = {
  bg: "#f6f8fb",
  panel: "#ffffff",
  panelSoft: "#f9fbfd",
  track: "#e9eef3",
  border: "#e6edf4",
  accent: "#46d7d4",
  accentDeep: "#23c1be",
  accentSoft: "#dcf7f6",
  text: "#111827",
  muted: "#90a0b2",
  subtle: "#64748b",
  heavy: "#D85A30",
  heavySoft: "#FAECE7",
  volume: "#1D9E75",
  volumeSoft: "#E1F5EE",
  shadow: "0 18px 48px rgba(31, 41, 55, 0.08)",
};

type Intensity = "normal" | "hype" | "calm";
type Screen = "day-select" | "exercise-list" | "loading" | "workout" | "session-complete";
type Phase = "idle" | "delay" | "counting" | "rest";

const cardStyle: CSSProperties = {
  background: C.panel,
  border: `1px solid ${C.border}`,
  borderRadius: 28,
  boxShadow: C.shadow,
};

const pillBtn: CSSProperties = {
  width: 42, height: 42, borderRadius: "50%",
  border: `1px solid ${C.border}`, background: C.panel, color: C.text,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  fontSize: 20, cursor: "pointer",
  boxShadow: "0 8px 20px rgba(15,23,42,0.04)",
};

// ─── Small components ─────────────────────────────────────────────────────────

const Ring = ({ r, progress, color, sw = 12, trackColor = C.track }: {
  r: number; progress: number; color: string; sw?: number; trackColor?: string;
}) => {
  const n = Math.min(1, Math.max(0, progress));
  const circ = 2 * Math.PI * r;
  const size = (r + sw + 2) * 2;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", position: "absolute", inset: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={sw} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw}
        strokeDasharray={circ} strokeDashoffset={circ * (1 - n)} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.4s ease" }} />
    </svg>
  );
};

const TopBar = ({ title, subtitle, onBack, disabled = false }: {
  title: string; subtitle: string; onBack?: () => void; disabled?: boolean;
}) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
    <button onClick={onBack} disabled={disabled} aria-label="뒤로가기"
      style={{ ...pillBtn, opacity: disabled ? 0.4 : 1, cursor: disabled ? "default" : "pointer" }}>‹</button>
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -1, color: C.text }}>{title}</div>
      <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{subtitle}</div>
    </div>
    <div style={{ ...pillBtn, cursor: "default" }}>…</div>
  </div>
);

const Tile = ({ label, value }: { label: string; value: string }) => (
  <div style={{ ...cardStyle, padding: "14px 16px", flex: 1, minWidth: 0 }}>
    <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>{label}</div>
    <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.6, color: C.text }}>{value}</div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

export default function GymCoach() {
  // Navigation
  const [screen, setScreen] = useState<Screen>("day-select");
  const [selectedDayIdx, setSelectedDayIdx] = useState(getTodayProgramIndex);
  const [selectedExIdx, setSelectedExIdx] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());

  // Workout display state
  const [phase, setPhase] = useState<Phase>("idle");
  const [loadMsg, setLoadMsg] = useState("");
  const [loadPct, setLoadPct] = useState(0);
  const [ttsWarning, setTtsWarning] = useState("");
  const [currentSet, setCurrentSet] = useState(1);
  const [currentRep, setCurrentRep] = useState(0);
  const [timer, setTimer] = useState(0);
  const [encText, setEncText] = useState("");
  const [completedSets, setCompletedSets] = useState(0);
  const [repKey, setRepKey] = useState(0);
  const [barPct, setBarPct] = useState(0);

  // Mutable refs (workout engine)
  interface AudioCache { buffers: (AudioBuffer | null)[]; }
  const phaseRef = useRef<Phase>("idle");
  const currentSetRef = useRef(1);
  const targetSetsRef = useRef(4);
  const targetRepsRef = useRef(12);
  const restTimeRef = useRef(90);
  const countIntervalRef = useRef(3.0);
  const encsRef = useRef<{ rep: number; text: string }[]>([]);
  const restTipRef = useRef("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countTORef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const barAnimRef = useRef<number | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const audioCache = useRef<AudioCache>({ buffers: [] });
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Callback refs (stable pointers to latest closures)
  const autoCountRef = useRef<((rep: number) => void) | null>(null);
  const beginSetRef = useRef<((set: number) => void) | null>(null);
  const beginRestRef = useRef<((done: number) => void) | null>(null);
  const onExDoneRef = useRef<(() => void) | null>(null);

  // Stable index refs (accessible inside timeouts)
  const dayIdxRef = useRef(selectedDayIdx);
  const exIdxRef = useRef(selectedExIdx);
  useEffect(() => { dayIdxRef.current = selectedDayIdx; }, [selectedDayIdx]);
  useEffect(() => { exIdxRef.current = selectedExIdx; }, [selectedExIdx]);

  // ── CSS injection
  useEffect(() => {
    const id = "gymc";
    if (document.getElementById(id)) return;
    const s = document.createElement("style");
    s.id = id;
    s.textContent = `
      @keyframes pulseIn{0%{transform:scale(.88);opacity:.2}100%{transform:scale(1);opacity:1}}
      @keyframes floatIn{0%{opacity:0;transform:translateY(14px)}100%{opacity:1;transform:translateY(0)}}
      @keyframes spin{to{transform:rotate(360deg)}}
      .pulse-in{animation:pulseIn .3s ease-out forwards}
      .float-in{animation:floatIn .35s ease-out forwards}
      .spin{animation:spin .8s linear infinite}
    `;
    document.head.appendChild(s);
  }, []);

  // ── Voice + audio unlock
  useEffect(() => {
    const load = () => { voicesRef.current = window.speechSynthesis?.getVoices() ?? []; };
    load();
    window.speechSynthesis?.addEventListener("voiceschanged", load);

    let audioUnlocked = false;
    const unlock = () => {
      // Unlock speech synthesis
      const u = new SpeechSynthesisUtterance(" ");
      u.volume = 0;
      window.speechSynthesis?.speak(u);
      // Unlock HTML Audio API (required on iOS/Safari)
      if (!audioUnlocked) {
        audioUnlocked = true;
        const a = new Audio("/count-audio/1.mp3");
        a.volume = 0;
        a.play().then(() => a.pause()).catch(() => {});
      }
      document.removeEventListener("touchstart", unlock);
      document.removeEventListener("click", unlock);
    };
    document.addEventListener("touchstart", unlock);
    document.addEventListener("click", unlock);
    return () => window.speechSynthesis?.removeEventListener("voiceschanged", load);
  }, []);

  // ── Audio helpers
  const speak = useCallback((text: string, intensity: Intensity = "normal") => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ko-KR";
    const p = { normal: { rate: 1.05, pitch: 0.82, volume: 1 }, hype: { rate: 1.22, pitch: 0.88, volume: 1 }, calm: { rate: 0.87, pitch: 0.78, volume: 0.9 } }[intensity];
    Object.assign(u, p);
    const v = voicesRef.current;
    // Prefer Korean male → Korean any → any available voice
    const voice = v.find(x => x.lang === "ko-KR" && /남|male/i.test(x.name))
      ?? v.find(x => x.lang === "ko-KR")
      ?? v[0];
    if (voice) u.voice = voice;
    window.speechSynthesis.speak(u);
  }, []);

  const playCount = useCallback((idx: number, fallback: string, intensity: Intensity = "normal") => {
    const ctx = audioCtxRef.current;
    const buffer = audioCache.current.buffers[idx];
    if (ctx && buffer) {
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start();
    } else {
      speak(fallback, intensity);
    }
  }, [speak]);

  const releaseAudio = useCallback(() => {
    audioCache.current = { buffers: [] };
  }, []);

  const playBeep = useCallback((freq = 440, dur = 0.12) => {
    try {
      const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc.start();
      osc.stop(ctx.currentTime + dur);
      osc.onended = () => { ctx.close(); };
    } catch { /* ignore */ }
  }, []);

  // Beep on each of the last 5 seconds of the start delay
  useEffect(() => {
    if (phase !== "delay" || timer <= 0 || timer > 5) return;
    playBeep(timer === 1 ? 880 : 440, timer === 1 ? 0.25 : 0.12);
  }, [phase, timer, playBeep]);

  // ── AI fetch
  const fetchAI = async (exercise: string, reps: number) => {
    setLoadMsg("AI 코치 멘트 생성 중...");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 900,
          messages: [{ role: "user", content: `헬스 트레이너입니다. 순수 JSON만 반환하세요:\n{"encouragements":[{"rep":숫자,"text":"추임새"}],"restTip":"팁"}\n운동: ${exercise}, 횟수: ${reps}회\n- rep 1~${reps} 각각 짧은 한국어 추임새 (3~8자)\n- 초반: 시작, 중반(${Math.ceil(reps / 2)}): 강한 격려, 마지막: 폭발적\n- restTip: 주요 근육 + 자세 팁 2문장` }],
        }),
      });
      const data = await res.json();
      return JSON.parse((data.content?.[0]?.text ?? "{}").replace(/```json|```/g, "").trim());
    } catch {
      return {
        encouragements: Array.from({ length: reps }, (_, i) => ({ rep: i + 1, text: i + 1 === reps ? "마지막!" : i + 1 >= reps - 1 ? "거의다!" : i + 1 === Math.ceil(reps / 2) ? "반 왔어!" : i + 1 <= 2 ? "파이팅!" : "좋아!" })),
        restTip: `${exercise} 동작 시 목표 근육 자극에 집중하세요. 호흡을 고르게 하며 다음 세트를 준비하세요.`,
      };
    }
  };

  // ── Timer helpers
  const startTimer = useCallback((duration: number, onDone?: () => void) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimer(duration);
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        const next = prev - 1;
        if (next <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          if (onDone) setTimeout(onDone, 50);
          return 0;
        }
        return next;
      });
    }, 1000);
  }, []);

  const startBar = useCallback((ms: number) => {
    if (barAnimRef.current !== null) cancelAnimationFrame(barAnimRef.current);
    const t0 = performance.now();
    const tick = (now: number) => {
      const pct = Math.max(0, 1 - (now - t0) / ms);
      setBarPct(pct);
      if (pct > 0) barAnimRef.current = requestAnimationFrame(tick);
    };
    barAnimRef.current = requestAnimationFrame(tick);
  }, []);

  // ── Workout engine
  const autoCount = useCallback((repNum: number) => {
    if (phaseRef.current !== "counting") return;
    const reps = targetRepsRef.current;
    const ms = countIntervalRef.current * 1000;
    const isAlmost = repNum >= reps - 1;

    setCurrentRep(repNum);
    setRepKey(k => k + 1);
    playCount(repNum - 1, KO_COUNTS[repNum - 1] ?? String(repNum), isAlmost ? "hype" : "normal");

    const enc = encsRef.current.find(e => e.rep === repNum);
    if (enc?.text) {
      setTimeout(() => {
        if (phaseRef.current !== "counting") return;
        setEncText(enc.text);
        setTimeout(() => setEncText(""), 1800);
      }, 680);
    }

    if (repNum < reps) startBar(ms);

    if (repNum >= reps) {
      countTORef.current = setTimeout(() => {
        if (phaseRef.current !== "counting") return;
        if (currentSetRef.current >= targetSetsRef.current) {
          onExDoneRef.current?.();
        } else {
          beginRestRef.current?.(currentSetRef.current);
        }
      }, ms);
    } else {
      countTORef.current = setTimeout(() => autoCountRef.current?.(repNum + 1), ms);
    }
  }, [playCount, startBar]);

  const beginSet = useCallback((setNum: number) => {
    setPhase("counting"); phaseRef.current = "counting";
    setCurrentSet(setNum); currentSetRef.current = setNum;
    setCurrentRep(0); setCompletedSets(setNum - 1);
    if (barAnimRef.current !== null) cancelAnimationFrame(barAnimRef.current);
    setBarPct(0);
    countTORef.current = setTimeout(() => autoCountRef.current?.(1), 250);
  }, []);

  const beginRest = useCallback((doneSets: number) => {
    if (countTORef.current) clearTimeout(countTORef.current);
    if (barAnimRef.current !== null) cancelAnimationFrame(barAnimRef.current);
    setPhase("rest"); phaseRef.current = "rest";
    setCompletedSets(doneSets);
    currentSetRef.current = doneSets + 1;
    setCurrentSet(doneSets + 1);
    setBarPct(0);
    // Read out the rest tip after a short pause
    if (restTipRef.current) {
      setTimeout(() => {
        if (phaseRef.current === "rest") speak(restTipRef.current, "calm");
      }, 1200);
    }
    startTimer(restTimeRef.current, () => beginSetRef.current?.(doneSets + 1));
  }, [startTimer, speak]);

  autoCountRef.current = autoCount;
  beginSetRef.current = beginSet;
  beginRestRef.current = beginRest;

  const stopEngine = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (countTORef.current) clearTimeout(countTORef.current);
    if (barAnimRef.current !== null) cancelAnimationFrame(barAnimRef.current);
    window.speechSynthesis?.cancel();
    releaseAudio();
    phaseRef.current = "idle";
    setPhase("idle"); setEncText(""); setBarPct(0);
  }, [releaseAudio]);

  // Called when all sets of an exercise finish
  const onExerciseDone = useCallback(() => {
    stopEngine();
    const totalEx = PROGRAM[dayIdxRef.current].exercises.length;
    const exIdx = exIdxRef.current;
    const newDone = new Set(Array.from(completedExercises).concat(exIdx));
    setCompletedExercises(newDone);
    setScreen(newDone.size === totalEx ? "session-complete" : "exercise-list");
  }, [stopEngine, completedExercises]);

  onExDoneRef.current = onExerciseDone;

  const handleAbort = useCallback(() => {
    stopEngine();
    setScreen("exercise-list");
  }, [stopEngine]);

  useEffect(() => () => {
    releaseAudio();
    audioCtxRef.current?.close().catch(() => {});
  }, [releaseAudio]);

  // ── Prepare + start
  const prepare = useCallback(async (exIdx: number) => {
    // Create/resume AudioContext in user-gesture context (before any await)
    try {
      type WinWithWebkit = Window & { webkitAudioContext?: typeof AudioContext };
      const AudioCtx = window.AudioContext ?? (window as WinWithWebkit).webkitAudioContext!;
      if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
        audioCtxRef.current = new AudioCtx();
      }
      await audioCtxRef.current.resume();
    } catch { /* ignore */ }

    const ex = PROGRAM[dayIdxRef.current].exercises[exIdx];
    setSelectedExIdx(exIdx);
    exIdxRef.current = exIdx;
    setScreen("loading");
    setLoadPct(0);
    setTtsWarning("");

    targetSetsRef.current = ex.sets;
    targetRepsRef.current = ex.reps;
    restTimeRef.current = ex.rest;
    countIntervalRef.current = getCountInterval(ex.cat, ex.reps);
    releaseAudio();

    const ai = await fetchAI(ex.name, ex.reps);
    encsRef.current = ai.encouragements ?? [];
    restTipRef.current = ai.restTip ?? ex.note ?? "";

    setLoadPct(18);
    setLoadMsg("카운트 음성 로딩 중...");

    // Decode audio files into AudioBuffers — playback works from any context (timer, etc.)
    const urls = Array.from({ length: ex.reps }, (_, i) => `/count-audio/${i + 1}.mp3`);
    let anyFailed = false;
    audioCache.current.buffers = await Promise.all(
      urls.map(async url => {
        try {
          const res = await fetch(url);
          const arrayBuf = await res.arrayBuffer();
          return await audioCtxRef.current!.decodeAudioData(arrayBuf);
        } catch {
          anyFailed = true;
          return null;
        }
      })
    );
    if (anyFailed) setTtsWarning("일부 오디오를 불러오지 못했습니다.");

    setLoadPct(100);
    await new Promise(r => setTimeout(r, 350));

    // start
    setScreen("workout");
    setCurrentSet(1); currentSetRef.current = 1;
    setCurrentRep(0); setCompletedSets(0);
    setPhase("delay"); phaseRef.current = "delay";
    setTimer(15);
    startTimer(15, () => beginSetRef.current?.(1));
  }, [releaseAudio, startTimer]);

  // ── Derived values for workout screen
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const day = PROGRAM[selectedDayIdx];
  const currentEx = day.exercises[selectedExIdx];
  const tSets = targetSetsRef.current;
  const tReps = targetRepsRef.current;
  const sessionReps = completedSets * tReps + (phase === "counting" ? currentRep : 0);
  const overallProg = tReps * tSets > 0 ? Math.min(1, sessionReps / (tReps * tSets)) : 0;
  const overallPct = Math.round(overallProg * 100);
  const phaseColor = phase === "rest" ? C.accentDeep : phase === "delay" ? C.subtle : C.accent;
  const phaseLabel = phase === "delay" ? "시작 준비" : phase === "rest" ? "세트 사이 휴식" : phase === "counting" ? "카운트 진행 중" : "";
  const phaseProg =
    phase === "counting" && tReps > 0 ? currentRep / tReps :
    phase === "rest" && restTimeRef.current > 0 ? Math.max(0, 1 - timer / restTimeRef.current) :
    phase === "delay" ? Math.max(0, 1 - timer / 15) : 0;

  const wrap: CSSProperties = { minHeight: "100%", width: "100%", display: "flex", flexDirection: "column", gap: 16, maxWidth: 420, margin: "0 auto", color: C.text };

  // ═══════════════════════════════════
  // DAY SELECT
  // ═══════════════════════════════════
  if (screen === "day-select") {
    const todayJsDay = new Date().getDay();
    const isToday = (i: number) => todayJsDay !== 0 && i === todayJsDay - 1;

    return (
      <div style={wrap}>
        <div style={{ textAlign: "center", padding: "4px 0 8px" }}>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -1 }}>오늘의 운동</div>
          <div style={{ fontSize: 14, color: C.muted, marginTop: 4 }}>요일을 선택하세요</div>
        </div>

        {PROGRAM.map((d, i) => {
          const today = isToday(i);
          return (
            <div key={d.id}
              onClick={() => { setSelectedDayIdx(i); dayIdxRef.current = i; setCompletedExercises(new Set()); setScreen("exercise-list"); }}
              style={{ ...cardStyle, padding: "18px 20px", cursor: "pointer", border: today ? `2px solid ${C.accent}` : `1px solid ${C.border}`, background: today ? C.accentSoft : C.panel }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16, fontWeight: 700 }}>{d.label}</span>
                    {today && <span style={{ fontSize: 11, padding: "2px 8px", background: C.accent, color: "#062b2a", borderRadius: 20, fontWeight: 700 }}>오늘</span>}
                  </div>
                  <div style={{ fontSize: 13, color: C.muted, marginTop: 3 }}>{d.day} · {d.muscles}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600, background: d.type === "heavy" ? C.heavySoft : C.volumeSoft, color: d.type === "heavy" ? C.heavy : C.volume }}>
                    {d.type === "heavy" ? "중량" : "볼륨"}
                  </span>
                  <span style={{ color: C.muted, fontSize: 22 }}>›</span>
                </div>
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>{d.exercises.length}가지 운동 · {d.totalTime}</div>
            </div>
          );
        })}
      </div>
    );
  }

  // ═══════════════════════════════════
  // EXERCISE LIST
  // ═══════════════════════════════════
  if (screen === "exercise-list") {
    const done = completedExercises.size;
    const total = day.exercises.length;
    const mainEx = day.exercises.filter(e => e.cat === "main");
    const accEx = day.exercises.filter(e => e.cat === "accessory");

    const ExCard = ({ ex }: { ex: Exercise }) => {
      const gi = day.exercises.indexOf(ex);
      const isDone = completedExercises.has(gi);
      return (
        <div onClick={isDone ? undefined : () => prepare(gi)}
          style={{ ...cardStyle, borderRadius: 20, padding: "14px 16px", marginBottom: 8, borderLeft: `3px solid ${ex.cat === "main" ? C.heavy : C.volume}`, opacity: isDone ? 0.55 : 1, cursor: isDone ? "default" : "pointer" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                {isDone && <span style={{ color: C.accent }}>✓</span>}
                {ex.name}
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
                {ex.sets}세트 × {ex.repsLabel}회 &nbsp;·&nbsp;
                <span style={{ fontWeight: 600, color: ex.cat === "main" ? C.heavy : C.volume }}>{ex.weight}</span>
              </div>
              {ex.note && <div style={{ fontSize: 11, color: C.subtle, marginTop: 4 }}>💡 {ex.note}</div>}
            </div>
            {!isDone && <span style={{ color: C.muted, fontSize: 22 }}>›</span>}
          </div>
        </div>
      );
    };

    return (
      <div style={wrap}>
        <TopBar title={day.label} subtitle={`${day.day} · ${day.muscles}`} onBack={() => setScreen("day-select")} />

        <div style={{ ...cardStyle, borderRadius: 20, padding: "14px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: C.subtle, fontWeight: 600 }}>진행률</span>
            <span style={{ fontSize: 14, fontWeight: 700 }}>{done} / {total} 완료</span>
          </div>
          <div style={{ height: 6, background: C.track, borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", background: C.accent, borderRadius: 99, width: `${(done / total) * 100}%`, transition: "width 0.4s ease" }} />
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: C.muted }}>
            <span style={{ fontWeight: 600, color: day.type === "heavy" ? C.heavy : C.volume }}>{day.type === "heavy" ? "중량 집중" : "볼륨 집중"}</span>
            &nbsp;· {day.totalTime}
          </div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>메인 리프트</div>
        {mainEx.map(ex => <ExCard key={ex.name} ex={ex} />)}

        <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>보조 운동</div>
        {accEx.map(ex => <ExCard key={ex.name} ex={ex} />)}

        {done === total && (
          <button onClick={() => setScreen("session-complete")}
            style={{ width: "100%", border: "none", borderRadius: 999, background: C.accent, color: "#062b2a", fontSize: 18, fontWeight: 700, padding: "18px 20px", cursor: "pointer", boxShadow: "0 16px 32px rgba(70,215,212,0.26)" }}>
            세션 완료 보기
          </button>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════
  // LOADING
  // ═══════════════════════════════════
  if (screen === "loading") {
    return (
      <div style={wrap}>
        <TopBar title="준비 중" subtitle={currentEx?.name ?? ""} onBack={handleAbort} />
        <section style={{ ...cardStyle, padding: "28px 24px 34px", textAlign: "center" }}>
          <div style={{ position: "relative", width: 230, height: 230, margin: "0 auto 24px" }}>
            <Ring r={92} progress={loadPct / 100} color={C.accent} sw={14} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
              <div style={{ fontSize: 54, fontWeight: 700, letterSpacing: -2 }}>{loadPct}%</div>
              <div className="spin" style={{ width: 22, height: 22, marginTop: 12, borderRadius: "50%", border: `2px solid ${C.track}`, borderTopColor: C.accent }} />
            </div>
          </div>
          <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: -1.2 }}>{currentEx?.name}</div>
          <div style={{ fontSize: 14, color: C.muted, marginTop: 8 }}>
            {currentEx && `${currentEx.sets}세트 × ${currentEx.repsLabel}회 · ${currentEx.weight}`}
          </div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 12, minHeight: 20 }}>{loadMsg}</div>
          <div style={{ height: 8, borderRadius: 999, background: C.track, overflow: "hidden", marginTop: 20 }}>
            <div style={{ width: `${loadPct}%`, height: "100%", background: C.accent, transition: "width 0.35s ease" }} />
          </div>
          {ttsWarning && <div style={{ marginTop: 12, fontSize: 12, color: C.subtle }}>{ttsWarning}</div>}
        </section>
      </div>
    );
  }

  // ═══════════════════════════════════
  // WORKOUT
  // ═══════════════════════════════════
  if (screen === "workout") {
    const primary = phase === "counting" ? `${currentRep} 회` : fmt(timer);
    const secondary =
      phase === "counting" ? `${currentSet} / ${tSets} 세트 · 목표 ${currentEx?.repsLabel}회` :
      phase === "rest" ? `다음 세트 ${currentSet} / ${tSets} · 휴식 ${fmt(restTimeRef.current)}` :
      `${timer}초 후 시작`;

    return (
      <div style={wrap}>
        <TopBar title={currentEx?.name ?? ""} subtitle={currentEx?.weight ?? ""} onBack={handleAbort} />

        <section style={{ ...cardStyle, padding: "28px 24px 28px", textAlign: "center" }}>
          <div style={{ position: "relative", width: 230, height: 230, margin: "0 auto 26px" }}>
            <Ring r={92} progress={overallProg} color={phaseColor} sw={14} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
              <div style={{ fontSize: 54, fontWeight: 700, letterSpacing: -2 }}>{overallPct}%</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>this exercise</div>
            </div>
          </div>

          <div key={`${phase}-${repKey}-${timer}`} className="pulse-in"
            style={{ fontSize: 58, lineHeight: 1, fontWeight: 700, letterSpacing: -2.2, color: C.text }}>
            {primary}
          </div>
          <div style={{ fontSize: 14, color: C.muted, marginTop: 10 }}>{secondary}</div>
          <div style={{ display: "inline-flex", alignItems: "center", padding: "8px 14px", borderRadius: 999, background: C.accentSoft, color: phaseColor, fontSize: 13, fontWeight: 700, marginTop: 14 }}>
            {phaseLabel}
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 20 }}>
            {Array.from({ length: tSets }).map((_, i) => {
              const done = i < completedSets;
              const active = i === currentSet - 1 && phase !== "rest";
              return (
                <div key={i} style={{ width: done ? 14 : active ? 16 : 10, height: done ? 14 : active ? 16 : 10, borderRadius: "50%", background: done ? phaseColor : active ? C.accentSoft : C.track, border: `2px solid ${done || active ? phaseColor : C.track}`, transition: "all 0.25s ease" }} />
              );
            })}
          </div>
        </section>

        <div style={{ display: "flex", gap: 12 }}>
          <Tile label="중량" value={currentEx?.weight ?? "-"} />
          <Tile label="인터벌" value={`${countIntervalRef.current.toFixed(1)}초`} />
          <Tile label="휴식" value={fmt(restTimeRef.current)} />
        </div>

        <section style={{ ...cardStyle, padding: "16px 18px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>{phase === "rest" ? "휴식 타이머" : "페이스"}</span>
            <span style={{ fontSize: 13, color: C.subtle }}>{phase === "counting" ? `${countIntervalRef.current.toFixed(1)}초 간격` : fmt(timer)}</span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: C.track, overflow: "hidden" }}>
            <div style={{ width: `${Math.min(100, (phase === "counting" ? barPct : phaseProg) * 100)}%`, height: "100%", background: phaseColor, borderRadius: 999, transition: "width 0.15s linear" }} />
          </div>
          <div style={{ marginTop: 10, fontSize: 13, color: C.muted }}>
            {phase === "counting" ? "다음 카운트까지 남은 간격" : phase === "rest" ? "호흡을 정리하고 다음 세트를 준비하세요." : "곧 자동 카운트가 시작됩니다."}
          </div>
        </section>

        {(encText || (phase === "rest" && restTipRef.current)) && (
          <section className="float-in" style={{ ...cardStyle, padding: "18px 18px 20px" }}>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>{phase === "rest" ? "트레이너 팁" : "코치 멘트"}</div>
            <div style={{ fontSize: phase === "rest" ? 15 : 28, lineHeight: phase === "rest" ? 1.7 : 1.2, fontWeight: phase === "rest" ? 500 : 700, letterSpacing: phase === "rest" ? 0 : -1, color: phase === "rest" ? C.text : phaseColor }}>
              {phase === "rest" ? restTipRef.current : encText}
            </div>
          </section>
        )}

        {currentEx?.note && phase !== "rest" && (
          <section style={{ ...cardStyle, borderRadius: 16, padding: "12px 16px", borderLeft: `3px solid ${currentEx.cat === "main" ? C.heavy : C.volume}` }}>
            <div style={{ fontSize: 12, color: C.subtle }}>💡 {currentEx.note}</div>
          </section>
        )}

        <button onClick={handleAbort}
          style={{ width: "100%", border: "none", borderRadius: 999, background: C.text, color: C.panel, fontSize: 17, fontWeight: 700, padding: "18px 20px", cursor: "pointer" }}>
          운동 중단
        </button>
      </div>
    );
  }

  // ═══════════════════════════════════
  // SESSION COMPLETE
  // ═══════════════════════════════════
  const totalSets = day.exercises.reduce((acc, ex) => acc + ex.sets, 0);
  const totalReps = day.exercises.reduce((acc, ex) => acc + ex.sets * ex.reps, 0);

  return (
    <div style={wrap}>
      <TopBar title="세션 완료" subtitle={`${day.label} · ${day.day}`} onBack={() => setScreen("day-select")} />

      <section style={{ ...cardStyle, padding: "32px 24px 36px", textAlign: "center" }}>
        <div style={{ position: "relative", width: 230, height: 230, margin: "0 auto 28px" }}>
          <Ring r={92} progress={1} color={C.accent} sw={14} />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
            <div style={{ fontSize: 54, fontWeight: 700, letterSpacing: -2 }}>100%</div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>완료</div>
          </div>
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5 }}>{day.label} 완료!</div>
        <div style={{ fontSize: 15, color: C.muted, marginTop: 6 }}>{day.muscles}</div>
        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          <Tile label="운동 수" value={`${day.exercises.length}가지`} />
          <Tile label="총 세트" value={`${totalSets}세트`} />
          <Tile label="총 횟수" value={`${totalReps}회`} />
        </div>
      </section>

      <button onClick={() => { setCompletedExercises(new Set()); setScreen("day-select"); }}
        style={{ width: "100%", border: "none", borderRadius: 999, background: C.accent, color: "#062b2a", fontSize: 18, fontWeight: 700, padding: "18px 20px", cursor: "pointer", boxShadow: "0 16px 32px rgba(70,215,212,0.26)" }}>
        처음으로
      </button>
    </div>
  );
}
