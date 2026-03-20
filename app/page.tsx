"use client";

import { useState, useEffect, useRef, useCallback, type CSSProperties } from "react";

const KO_COUNTS = [
    "하나", "둘", "셋", "넷", "다섯", "여섯", "일곱", "여덟", "아홉", "열",
    "열하나", "열둘", "열셋", "열넷", "열다섯", "열여섯", "열일곱", "열여덟", "열아홉", "스물",
];

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
    danger: "#ff7f7f",
    shadow: "0 18px 48px rgba(31, 41, 55, 0.08)",
};

type Intensity = "normal" | "hype" | "calm";

interface StepperProps {
    label: string;
    value: number;
    onChange: (val: number) => void;
    min: number;
    max: number;
    unit: string;
    step?: number;
}

interface RingProps {
    r: number;
    progress: number;
    color: string;
    sw?: number;
    trackColor?: string;
}

const cardStyle: CSSProperties = {
    background: C.panel,
    border: `1px solid ${C.border}`,
    borderRadius: 32,
    boxShadow: C.shadow,
};

const pillButtonStyle: CSSProperties = {
    width: 42,
    height: 42,
    borderRadius: "50%",
    border: `1px solid ${C.border}`,
    background: C.panel,
    color: C.text,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.04)",
};

const Stepper = ({ label, value, onChange, min, max, unit, step = 1 }: StepperProps) => {
    const dec = () => onChange(+(Math.max(min, value - step)).toFixed(1));
    const inc = () => onChange(+(Math.min(max, value + step)).toFixed(1));
    const display = step < 1 ? value.toFixed(1) : value;

    return (
        <div style={{ ...cardStyle, padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ fontSize: 13, color: C.subtle, fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: 13, color: C.muted }}>{unit}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button onClick={dec} style={{ ...pillButtonStyle, opacity: value <= min ? 0.45 : 1, cursor: value <= min ? "default" : "pointer" }}>-</button>
                <div style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: 34, fontWeight: 700, color: C.text, letterSpacing: -1 }}>{display}</div>
                </div>
                <button onClick={inc} style={{ ...pillButtonStyle, opacity: value >= max ? 0.45 : 1, cursor: value >= max ? "default" : "pointer" }}>+</button>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(+parseFloat(e.target.value).toFixed(1))}
                style={{ width: "100%", marginTop: 14, accentColor: C.accent, cursor: "pointer" }}
            />
        </div>
    );
};

const Ring = ({ r, progress, color, sw = 12, trackColor = C.track }: RingProps) => {
    const normalized = Math.min(1, Math.max(0, progress));
    const circumference = 2 * Math.PI * r;
    const offset = circumference * (1 - normalized);
    const size = (r + sw + 2) * 2;

    return (
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)", position: "absolute", inset: 0 }}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={sw} />
            <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={color}
                strokeWidth={sw}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.4s ease, stroke 0.2s ease" }}
            />
        </svg>
    );
};

const TopBar = ({ title, subtitle, onBack, backDisabled = false }: { title: string; subtitle: string; onBack?: () => void; backDisabled?: boolean }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
        <button
            onClick={onBack}
            disabled={backDisabled}
            aria-label="뒤로가기"
            style={{ ...pillButtonStyle, opacity: backDisabled ? 0.4 : 1, cursor: backDisabled ? "default" : "pointer" }}
        >
            ‹
        </button>
        <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -1.2, color: C.text }}>{title}</div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{subtitle}</div>
        </div>
        <div style={{ ...pillButtonStyle, cursor: "default" }}>…</div>
    </div>
);

const MetricTile = ({ label, value }: { label: string; value: string }) => (
    <div style={{ ...cardStyle, padding: "16px 18px", flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.8, color: C.text }}>{value}</div>
    </div>
);

export default function GymCoach() {
    const [screen, setScreen] = useState("settings");
    const [phase, setPhase] = useState("idle");

    const [exerciseName, setExerciseName] = useState("스쿼트");
    const [targetReps, setTargetReps] = useState(12);
    const [targetSets, setTargetSets] = useState(4);
    const [startDelay, setStartDelay] = useState(10);
    const [restTime, setRestTime] = useState(90);
    const [countInterval, setCountInterval] = useState(3.0);

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

    interface Cache {
        counts: (string | null)[];
        countPlayers: (HTMLAudioElement | null)[];
    }

    const phaseRef = useRef("idle");
    const currentSetRef = useRef(1);
    const targetSetsRef = useRef(4);
    const targetRepsRef = useRef(12);
    const restTimeRef = useRef(90);
    const startDelayRef = useRef(10);
    const countIntervalRef = useRef(3.0);
    const encsRef = useRef<{ rep: number; text: string }[]>([]);
    const restTipRef = useRef("");
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const countTORef = useRef<NodeJS.Timeout | null>(null);
    const barAnimRef = useRef<number | null>(null);
    const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
    const cache = useRef<Cache>({ counts: [], countPlayers: [] });

    const autoCountRef = useRef<((repNum: number) => void) | null>(null);
    const beginSetRef = useRef<((setNum: number) => void) | null>(null);
    const beginRestRef = useRef<((completedSet: number) => void) | null>(null);

    useEffect(() => {
        const id = "gymc-lite";
        if (document.getElementById(id)) return;
        const style = document.createElement("style");
        style.id = id;
        style.textContent = `
      @keyframes pulseIn{0%{transform:scale(.88);opacity:.2}100%{transform:scale(1);opacity:1}}
      @keyframes floatIn{0%{opacity:0;transform:translateY(14px)}100%{opacity:1;transform:translateY(0)}}
      @keyframes blink{0%,100%{opacity:1}50%{opacity:.45}}
      @keyframes spin{to{transform:rotate(360deg)}}
      .pulse-in{animation:pulseIn .3s ease-out forwards}
      .float-in{animation:floatIn .35s ease-out forwards}
      .blink{animation:blink 1s ease-in-out infinite}
      .spin{animation:spin .8s linear infinite}
      input[type=range]{-webkit-appearance:none;appearance:none;background:transparent}
      input[type=range]::-webkit-slider-runnable-track{height:6px;background:${C.track};border-radius:999px}
      input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:${C.accent};margin-top:-6px;cursor:pointer;box-shadow:0 6px 16px rgba(70,215,212,0.34)}
    `;
        document.head.appendChild(style);
    }, []);

    useEffect(() => {
        const load = () => { voicesRef.current = window.speechSynthesis?.getVoices() || []; };
        load();
        window.speechSynthesis?.addEventListener("voiceschanged", load);

        const unlock = () => {
            const utterance = new SpeechSynthesisUtterance(" ");
            utterance.volume = 0;
            window.speechSynthesis?.speak(utterance);
            document.removeEventListener("touchstart", unlock);
            document.removeEventListener("click", unlock);
        };

        document.addEventListener("touchstart", unlock);
        document.addEventListener("click", unlock);
        return () => window.speechSynthesis?.removeEventListener("voiceschanged", load);
    }, []);

    const speak = useCallback((text: string, intensity: Intensity = "normal") => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "ko-KR";
        const profile = {
            normal: { rate: 1.05, pitch: 0.82, volume: 1 },
            hype: { rate: 1.22, pitch: 0.88, volume: 1 },
            calm: { rate: 0.87, pitch: 0.78, volume: 0.9 },
        }[intensity];

        Object.assign(utterance, profile);
        const voices = voicesRef.current;
        const voice =
            voices.find((v) => v.lang === "ko-KR" && /남|male/i.test(v.name)) ||
            voices.find((v) => v.lang === "ko-KR" && !/여|female/i.test(v.name)) ||
            voices.find((v) => v.lang === "ko-KR");
        if (voice) utterance.voice = voice;
        window.speechSynthesis.speak(utterance);
    }, []);

    const playUrl = useCallback((url: string | null, fallback: string, intensity: Intensity = "normal") => {
        if (url) {
            new Audio(url).play().catch(() => speak(fallback, intensity));
        } else {
            speak(fallback, intensity);
        }
    }, [speak]);

    const playCount = useCallback((index: number, fallback: string, intensity: Intensity = "normal") => {
        const player = cache.current.countPlayers[index];
        if (player) {
            player.currentTime = 0;
            player.play().catch(() => speak(fallback, intensity));
            return;
        }
        playUrl(cache.current.counts[index] ?? null, fallback, intensity);
    }, [playUrl, speak]);

    const releaseCountAudio = useCallback(() => {
        cache.current.countPlayers.forEach((player) => {
            if (!player) return;
            player.pause();
            player.src = "";
        });
        cache.current = { counts: [], countPlayers: [] };
    }, []);

    const fetchAI = async (exercise: string, reps: number) => {
        setLoadMsg("AI 코치 멘트 생성 중...");
        try {
            const res = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "claude-sonnet-4-20250514",
                    max_tokens: 900,
                    messages: [{
                        role: "user",
                        content: `헬스 트레이너입니다. 순수 JSON만 반환하세요:
{"encouragements":[{"rep":숫자,"text":"추임새"}],"restTip":"팁"}
운동: ${exercise}, 횟수: ${reps}회
- rep 1~${reps} 각각 짧은 한국어 추임새 (3~8자, 전부 포함)
- 초반(1~2): 시작 격려, 중반(${Math.ceil(reps / 2)}): 강한 격려, 후반(${reps - 1}): 마무리, 마지막(${reps}): 폭발적
- restTip: ${exercise} 주요 자극 근육 + 자세 팁 2문장 (구체적으로)`,
                    }],
                }),
            });
            const data = await res.json();
            return JSON.parse((data.content?.[0]?.text || "{}").replace(/```json|```/g, "").trim());
        } catch {
            return {
                encouragements: Array.from({ length: reps }, (_, i) => ({
                    rep: i + 1,
                    text: i + 1 === reps ? "마지막!" : i + 1 >= reps - 1 ? "거의다!" : i + 1 === Math.ceil(reps / 2) ? "반 왔어!" : i + 1 <= 2 ? "파이팅!" : "좋아!",
                })),
                restTip: `${exercise} 동작 시 목표 근육 자극에 집중하세요. 호흡을 고르게 하며 다음 세트를 준비하세요.`,
            };
        }
    };

    const startTimer = useCallback((duration: number, onTick?: (rem: number) => void, onDone?: () => void) => {
        if (timerRef.current) clearInterval(timerRef.current);
        setTimer(duration);
        timerRef.current = setInterval(() => {
            setTimer((prev) => {
                const next = prev - 1;
                if (onTick) onTick(next);
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
        const startedAt = performance.now();
        const tick = (now: number) => {
            const pct = Math.max(0, 1 - (now - startedAt) / ms);
            setBarPct(pct);
            if (pct > 0) barAnimRef.current = requestAnimationFrame(tick);
        };
        barAnimRef.current = requestAnimationFrame(tick);
    }, []);

    const autoCount = useCallback((repNum: number) => {
        if (phaseRef.current !== "counting") return;
        const reps = targetRepsRef.current;
        const intervalMs = countIntervalRef.current * 1000;
        const isAlmost = repNum >= reps - 1;

        setCurrentRep(repNum);
        setRepKey((key) => key + 1);

        playCount(repNum - 1, KO_COUNTS[repNum - 1] || String(repNum), isAlmost ? "hype" : "normal");

        const encItem = encsRef.current.find((item) => item.rep === repNum);
        if (encItem?.text) {
            setTimeout(() => {
                if (phaseRef.current !== "counting") return;
                setEncText(encItem.text);
                setTimeout(() => setEncText(""), 1800);
            }, 680);
        }

        if (repNum < reps) startBar(intervalMs);

        if (repNum >= reps) {
            countTORef.current = setTimeout(() => {
                if (phaseRef.current !== "counting") return;
                if (currentSetRef.current >= targetSetsRef.current) {
                    setScreen("complete");
                    setPhase("idle");
                    phaseRef.current = "idle";
                    setTimeout(() => setEncText("운동 완료"), 300);
                } else {
                    beginRestRef.current?.(currentSetRef.current);
                }
            }, intervalMs);
        } else {
            countTORef.current = setTimeout(() => autoCountRef.current?.(repNum + 1), intervalMs);
        }
    }, [playCount, startBar]);

    const beginSet = useCallback((setNum: number) => {
        setPhase("counting");
        phaseRef.current = "counting";
        setCurrentSet(setNum);
        currentSetRef.current = setNum;
        setCurrentRep(0);
        setCompletedSets(setNum - 1);
        if (barAnimRef.current !== null) cancelAnimationFrame(barAnimRef.current);
        setBarPct(0);
        countTORef.current = setTimeout(() => autoCountRef.current?.(1), 250);
    }, []);

    const beginRest = useCallback((completedSet: number) => {
        if (countTORef.current) clearTimeout(countTORef.current);
        if (barAnimRef.current !== null) cancelAnimationFrame(barAnimRef.current);
        setPhase("rest");
        phaseRef.current = "rest";
        setCompletedSets(completedSet);
        currentSetRef.current = completedSet + 1;
        setCurrentSet(completedSet + 1);
        setBarPct(0);
        const duration = restTimeRef.current;
        startTimer(duration, () => {}, () => beginSetRef.current?.(completedSet + 1));
    }, [startTimer]);

    autoCountRef.current = autoCount;
    beginSetRef.current = beginSet;
    beginRestRef.current = beginRest;

    const startWorkout = useCallback(() => {
        setScreen("workout");
        setCurrentSet(1);
        currentSetRef.current = 1;
        setCurrentRep(0);
        setCompletedSets(0);
        if (startDelayRef.current > 0) {
            setPhase("delay");
            phaseRef.current = "delay";
            setTimer(startDelayRef.current);
            startTimer(startDelayRef.current, () => {}, () => beginSetRef.current?.(1));
        } else {
            beginSetRef.current?.(1);
        }
    }, [startTimer]);

    const prepare = async () => {
        setScreen("loading");
        setLoadPct(0);
        setTtsWarning("");
        targetSetsRef.current = targetSets;
        targetRepsRef.current = targetReps;
        restTimeRef.current = restTime;
        startDelayRef.current = startDelay;
        countIntervalRef.current = countInterval;
        releaseCountAudio();

        const ai = await fetchAI(exerciseName, targetReps);
        encsRef.current = ai.encouragements || [];
        restTipRef.current = ai.restTip || "";

        setLoadPct(18);
        setLoadMsg("카운트 음성 미리 준비 중...");

        const sourceUrls = Array.from({ length: targetReps }, (_, i) => `/count-audio/${i + 1}.mp3`);
        cache.current.counts = sourceUrls;
        cache.current.countPlayers = await Promise.all(sourceUrls.map((url) => new Promise<HTMLAudioElement | null>((resolve) => {
            const player = new Audio(url);
            player.preload = "auto";

            const cleanup = () => {
                player.removeEventListener("canplaythrough", handleReady);
                player.removeEventListener("error", handleError);
            };

            const handleReady = () => {
                cleanup();
                resolve(player);
            };

            const handleError = () => {
                cleanup();
                resolve(null);
            };

            player.addEventListener("canplaythrough", handleReady, { once: true });
            player.addEventListener("error", handleError, { once: true });
            player.load();

            window.setTimeout(() => {
                cleanup();
                resolve(player.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA ? player : null);
            }, 2000);
        })));

        if (cache.current.countPlayers.some((player) => !player)) {
            setTtsWarning("일부 카운트 파일을 미리 불러오지 못해 해당 숫자는 즉시 재생되지 않을 수 있습니다.");
        }

        setLoadPct(100);
        await new Promise((resolve) => setTimeout(resolve, 350));
        startWorkout();
    };

    const handleReset = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (countTORef.current) clearTimeout(countTORef.current);
        if (barAnimRef.current !== null) cancelAnimationFrame(barAnimRef.current);
        window.speechSynthesis?.cancel();
        releaseCountAudio();
        phaseRef.current = "idle";
        setScreen("settings");
        setPhase("idle");
        setCurrentRep(0);
        setCurrentSet(1);
        currentSetRef.current = 1;
        setCompletedSets(0);
        setEncText("");
        setBarPct(0);
    };

    useEffect(() => () => releaseCountAudio(), [releaseCountAudio]);

    const wrap: CSSProperties = {
        minHeight: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 18,
        maxWidth: 420,
        margin: "0 auto",
        color: C.text,
    };

    const fmt = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
    const todayLabel = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "long" }).format(new Date());
    const totalReps = targetReps * targetSets;
    const estimatedMinutes = Math.round((startDelay + totalReps * countInterval + Math.max(0, targetSets - 1) * restTime) / 60 * 10) / 10;
    const planPercent = Math.max(6, Math.min(100, Math.round((totalReps / 200) * 100)));
    const sessionReps = completedSets * targetReps + (phase === "counting" ? currentRep : 0);
    const overallProgress = totalReps > 0 ? Math.min(1, sessionReps / totalReps) : 0;
    const overallPercent = screen === "complete" ? 100 : Math.round(overallProgress * 100);
    const phaseProgress =
        phase === "counting" && targetReps > 0 ? currentRep / targetReps :
        (phase === "rest" && restTime > 0) || (phase === "delay" && startDelay > 0)
            ? Math.max(0, 1 - timer / (phase === "rest" ? restTime : startDelay))
            : 0;
    const phaseColor = phase === "rest" ? C.accentDeep : phase === "delay" ? C.subtle : C.accent;
    const phaseLabel =
        phase === "delay" ? "시작 준비" :
        phase === "rest" ? "세트 사이 휴식" :
        phase === "counting" ? "자동 카운트 진행 중" :
        "루틴 설정";

    if (screen === "complete") {
        return (
            <div style={wrap}>
                <TopBar title="Count Log" subtitle={exerciseName} onBack={handleReset} />
                <section style={{ ...cardStyle, padding: "28px 24px 32px", textAlign: "center" }}>
                    <div style={{ position: "relative", width: 230, height: 230, margin: "0 auto 26px" }}>
                        <Ring r={92} progress={1} color={C.accent} sw={14} />
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                            <div style={{ fontSize: 54, fontWeight: 700, letterSpacing: -2 }}>{overallPercent}%</div>
                            <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>session complete</div>
                        </div>
                    </div>
                    <div style={{ fontSize: 56, lineHeight: 1, fontWeight: 700, letterSpacing: -2, color: C.text }}>{totalReps} 회</div>
                    <div style={{ fontSize: 16, color: C.muted, marginTop: 12 }}>{todayLabel}</div>
                    <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                        <MetricTile label="세트" value={`${targetSets} 세트`} />
                        <MetricTile label="세트당" value={`${targetReps} 회`} />
                    </div>
                </section>
                <button
                    onClick={handleReset}
                    style={{
                        width: "100%",
                        border: "none",
                        borderRadius: 999,
                        background: C.accent,
                        color: "#062b2a",
                        fontSize: 18,
                        fontWeight: 700,
                        padding: "18px 20px",
                        cursor: "pointer",
                        boxShadow: "0 16px 32px rgba(70, 215, 212, 0.26)",
                    }}
                >
                    다시 설정하기
                </button>
            </div>
        );
    }

    if (screen === "loading") {
        return (
            <div style={wrap}>
                <TopBar title="Count Log" subtitle="Preparing session" onBack={handleReset} />
                <section style={{ ...cardStyle, padding: "28px 24px 34px", textAlign: "center" }}>
                    <div style={{ position: "relative", width: 230, height: 230, margin: "0 auto 24px" }}>
                        <Ring r={92} progress={loadPct / 100} color={C.accent} sw={14} />
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                            <div style={{ fontSize: 54, fontWeight: 700, letterSpacing: -2 }}>{loadPct}%</div>
                            <div className="spin" style={{ width: 22, height: 22, marginTop: 12, borderRadius: "50%", border: `2px solid ${C.track}`, borderTopColor: C.accent }} />
                        </div>
                    </div>
                    <div style={{ fontSize: 42, lineHeight: 1.05, fontWeight: 700, letterSpacing: -1.6 }}>{exerciseName}</div>
                    <div style={{ fontSize: 15, color: C.muted, marginTop: 12, minHeight: 22 }}>{loadMsg}</div>
                    <div style={{ width: "100%", height: 8, borderRadius: 999, background: C.track, overflow: "hidden", marginTop: 22 }}>
                        <div style={{ width: `${loadPct}%`, height: "100%", background: C.accent, transition: "width 0.35s ease" }} />
                    </div>
                    {ttsWarning && <div style={{ marginTop: 14, fontSize: 13, lineHeight: 1.6, color: C.subtle }}>{ttsWarning}</div>}
                </section>
            </div>
        );
    }

    if (screen === "workout") {
        const primaryValue =
            phase === "counting" ? `${currentRep} 회` :
            phase === "rest" ? `${timer} 초` :
            `${timer} 초`;
        const secondaryValue =
            phase === "counting" ? `${currentSet} / ${targetSets} 세트 · 목표 ${targetReps}회` :
            phase === "rest" ? `다음 세트 ${currentSet} / ${targetSets}` :
            `시작 전 딜레이 ${startDelay}초`;

        return (
            <div style={wrap}>
                <TopBar title="Count Log" subtitle={exerciseName} onBack={handleReset} />

                <section style={{ ...cardStyle, padding: "28px 24px 30px", textAlign: "center" }}>
                    <div style={{ position: "relative", width: 230, height: 230, margin: "0 auto 28px" }}>
                        <Ring r={92} progress={overallProgress} color={phaseColor} sw={14} />
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                            <div style={{ fontSize: 54, fontWeight: 700, letterSpacing: -2 }}>{overallPercent}%</div>
                            <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>overall progress</div>
                        </div>
                    </div>

                    <div key={`${phase}-${repKey}-${timer}`} className="pulse-in" style={{ fontSize: 58, lineHeight: 1, fontWeight: 700, letterSpacing: -2.2, color: C.text }}>
                        {primaryValue}
                    </div>
                    <div style={{ fontSize: 15, color: C.muted, marginTop: 12 }}>{secondaryValue}</div>
                    <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "8px 14px", borderRadius: 999, background: C.accentSoft, color: phaseColor, fontSize: 13, fontWeight: 700, marginTop: 16 }}>
                        {phaseLabel}
                    </div>

                    <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 22 }}>
                        {Array.from({ length: targetSets }).map((_, index) => {
                            const done = index < completedSets;
                            const active = index === currentSet - 1 && phase !== "rest";
                            return (
                                <div
                                    key={index}
                                    style={{
                                        width: done ? 14 : active ? 16 : 10,
                                        height: done ? 14 : active ? 16 : 10,
                                        borderRadius: "50%",
                                        background: done ? phaseColor : active ? C.accentSoft : C.track,
                                        border: `2px solid ${done || active ? phaseColor : C.track}`,
                                        transition: "all 0.25s ease",
                                    }}
                                />
                            );
                        })}
                    </div>
                </section>

                <section style={{ ...cardStyle, padding: "18px 18px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>현재 페이스</div>
                        <div style={{ fontSize: 13, color: C.subtle }}>
                            {phase === "counting" ? `${countInterval.toFixed(1)}초 간격` : fmt(timer)}
                        </div>
                    </div>
                    <div style={{ width: "100%", height: 8, borderRadius: 999, background: C.track, overflow: "hidden" }}>
                        <div
                            style={{
                                width: `${Math.max(0, Math.min(100, (phase === "counting" ? barPct : phaseProgress) * 100))}%`,
                                height: "100%",
                                background: phaseColor,
                                borderRadius: 999,
                                transition: "width 0.15s linear",
                            }}
                        />
                    </div>
                    <div style={{ marginTop: 12, fontSize: 13, lineHeight: 1.65, color: C.muted }}>
                        {phase === "counting" ? "다음 카운트까지 남은 간격입니다." : phase === "rest" ? "호흡을 정리하고 다음 세트를 준비하세요." : "곧 자동 카운트가 시작됩니다."}
                    </div>
                </section>

                {(encText || (phase === "rest" && restTipRef.current)) && (
                    <section className="float-in" style={{ ...cardStyle, padding: "20px 18px 22px", background: phase === "rest" ? C.panel : C.panelSoft }}>
                        <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>{phase === "rest" ? "트레이너 팁" : "코치 멘트"}</div>
                        <div style={{ fontSize: phase === "rest" ? 16 : 28, lineHeight: phase === "rest" ? 1.7 : 1.2, fontWeight: phase === "rest" ? 500 : 700, letterSpacing: phase === "rest" ? 0 : -1, color: phase === "rest" ? C.text : phaseColor }}>
                            {phase === "rest" ? restTipRef.current : encText}
                        </div>
                    </section>
                )}

                <button
                    onClick={handleReset}
                    style={{
                        width: "100%",
                        border: "none",
                        borderRadius: 999,
                        background: C.text,
                        color: C.panel,
                        fontSize: 17,
                        fontWeight: 700,
                        padding: "18px 20px",
                        cursor: "pointer",
                    }}
                >
                    세션 종료
                </button>
            </div>
        );
    }

    return (
        <div style={wrap}>
            <TopBar title="Count Log" subtitle="Daily workout planner" backDisabled />

            <section style={{ ...cardStyle, padding: "28px 24px 30px", textAlign: "center" }}>
                <div style={{ position: "relative", width: 230, height: 230, margin: "0 auto 24px" }}>
                    <Ring r={92} progress={planPercent / 100} color={C.accent} sw={14} />
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                        <div style={{ fontSize: 54, fontWeight: 700, letterSpacing: -2 }}>{planPercent}%</div>
                        <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>today target</div>
                    </div>
                </div>
                <div style={{ fontSize: 58, lineHeight: 1, fontWeight: 700, letterSpacing: -2.2, color: C.text }}>{totalReps} 회</div>
                <div style={{ fontSize: 15, color: C.muted, marginTop: 12 }}>{todayLabel} · 예상 {estimatedMinutes}분</div>

                <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                    <MetricTile label="운동 이름" value={exerciseName} />
                    <MetricTile label="카운트 간격" value={`${countInterval.toFixed(1)}초`} />
                </div>
            </section>

            <section style={{ display: "grid", gap: 14 }}>
                <div style={{ ...cardStyle, padding: 18 }}>
                    <div style={{ fontSize: 13, color: C.subtle, fontWeight: 600, marginBottom: 12 }}>운동 이름</div>
                    <input
                        value={exerciseName}
                        onChange={(e) => setExerciseName(e.target.value)}
                        placeholder="스쿼트, 푸시업, 데드리프트..."
                        style={{
                            width: "100%",
                            border: `1px solid ${C.border}`,
                            borderRadius: 18,
                            padding: "16px 18px",
                            fontSize: 20,
                            fontWeight: 700,
                            color: C.text,
                            background: C.panelSoft,
                            outline: "none",
                        }}
                    />
                    <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                        {["스쿼트", "푸시업", "데드리프트", "런지", "풀업", "벤치프레스"].map((name) => (
                            <button
                                key={name}
                                onClick={() => setExerciseName(name)}
                                style={{
                                    border: `1px solid ${exerciseName === name ? C.accent : C.border}`,
                                    borderRadius: 999,
                                    padding: "8px 12px",
                                    background: exerciseName === name ? C.accentSoft : C.panel,
                                    color: exerciseName === name ? C.accentDeep : C.subtle,
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                }}
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                </div>

                <Stepper label="횟수 (1세트)" value={targetReps} onChange={setTargetReps} min={1} max={20} unit="회" />
                <Stepper label="세트 수" value={targetSets} onChange={setTargetSets} min={1} max={10} unit="세트" />
                <Stepper label="카운트 간격" value={countInterval} onChange={setCountInterval} min={0.5} max={5.0} step={0.5} unit="초" />
                <Stepper label="시작 딜레이" value={startDelay} onChange={setStartDelay} min={0} max={60} unit="초" />
                <Stepper label="세트간 휴식" value={restTime} onChange={setRestTime} min={10} max={180} unit="초" />

                <div style={{ ...cardStyle, padding: "18px 18px 20px" }}>
                    <div style={{ fontSize: 13, color: C.subtle, fontWeight: 600, marginBottom: 10 }}>오디오 안내</div>
                    <div style={{ fontSize: 14, lineHeight: 1.75, color: C.muted }}>
                        로컬 카운트 음성을 우선 사용합니다. 경로는 <span style={{ color: C.text, fontWeight: 600 }}>/public/count-audio/1.mp3</span> 부터 <span style={{ color: C.text, fontWeight: 600 }}>/public/count-audio/20.mp3</span> 까지입니다.
                    </div>
                    {ttsWarning && <div style={{ marginTop: 10, fontSize: 13, color: C.subtle }}>{ttsWarning}</div>}
                </div>
            </section>

            <button
                onClick={prepare}
                disabled={!exerciseName.trim()}
                style={{
                    width: "100%",
                    border: "none",
                    borderRadius: 999,
                    background: exerciseName.trim() ? C.accent : C.track,
                    color: exerciseName.trim() ? "#063433" : C.muted,
                    fontSize: 18,
                    fontWeight: 700,
                    padding: "18px 20px",
                    cursor: exerciseName.trim() ? "pointer" : "not-allowed",
                    boxShadow: exerciseName.trim() ? "0 16px 32px rgba(70, 215, 212, 0.26)" : "none",
                }}
            >
                세션 시작하기
            </button>
        </div>
    );
}
