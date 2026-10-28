import React from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Opening titles for the Agente Davis videos: 2 lines, "*word*" = yellow (#FFD400).
export type Title = { start: number; end: number; l1: string; l2?: string };
export type TitlesProps = { titles: Title[] };

const YELLOW = "#FFD400";
const font = new FontFace("FreeSansBold", `url(${staticFile("FreeSansBold.ttf")})`);
const fontHandle = delayRender("FreeSansBold");
font.load().then((f) => {
  document.fonts.add(f);
  continueRender(fontHandle);
});

type Word = { text: string; yellow: boolean };

const parse = (s: string): Word[] => {
  const out: Word[] = [];
  s.split(/(\*[^*]+\*)/).forEach((part) => {
    const yellow = part.startsWith("*") && part.endsWith("*");
    part
      .replace(/\*/g, "")
      .split(" ")
      .filter(Boolean)
      .forEach((text) => out.push({ text, yellow }));
  });
  return out;
};

const AnimatedWord: React.FC<{ w: Word; delay: number; local: number; out: number }> = ({
  w,
  delay,
  local,
  out,
}) => {
  const { fps } = useVideoConfig();
  const p = spring({ frame: local - delay, fps, config: { damping: 13, stiffness: 160, mass: 0.7 } });
  const y = interpolate(p, [0, 1], [46, 0]);
  const scale = interpolate(p, [0, 1], [0.55, 1]);
  const blur = interpolate(p, [0, 1], [14, 0], { extrapolateRight: "clamp" });
  const opacity = interpolate(local - delay, [0, 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // yellow words: a glow flash when they land, then a soft steady glow
  const flash = w.yellow
    ? interpolate(local - delay, [4, 10, 26], [0, 1, 0.35], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;
  const glow = w.yellow
    ? `0 0 ${14 + 30 * flash}px rgba(255,212,0,${0.55 + 0.45 * flash}), 0 0 ${40 + 50 * flash}px rgba(255,180,0,${0.35 * flash + 0.2})`
    : `0 0 16px rgba(255,255,255,0.55), 0 0 36px rgba(255,255,255,0.25)`;
  return (
    <span
      style={{
        display: "inline-block",
        margin: "0 13px",
        color: w.yellow ? YELLOW : "white",
        transform: `translateY(${y - out * 18}px) scale(${scale * (1 + 0.06 * flash)})`,
        opacity: opacity * (1 - out),
        filter: `blur(${blur + out * 8}px)`,
        textShadow: `0 0 3px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.6), 0 6px 14px rgba(0,0,0,0.75), ${glow}`,
        WebkitTextStroke: "3px rgba(0,0,0,0.55)",
        paintOrder: "stroke fill",
      }}
    >
      {w.text}
    </span>
  );
};

const TitleBlock: React.FC<{ t: Title }> = ({ t }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - Math.round(t.start * fps);
  const len = Math.round((t.end - t.start) * fps);
  if (local < 0 || local >= len) return null;
  const out = interpolate(local, [len - 6, len], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const drift = interpolate(local, [0, len], [1, 1.035]); // slow push-in like the camera
  const lines = [parse(t.l1), ...(t.l2 ? [parse(t.l2)] : [])];
  let k = 0;
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 190 }}>
      <div style={{ transform: `scale(${drift})`, textAlign: "center" }}>
        {lines.map((ln, i) => (
          <div key={i} style={{ fontFamily: "FreeSansBold", fontSize: 94, lineHeight: 1.12, whiteSpace: "nowrap" }}>
            {ln.map((w, j) => (
              <AnimatedWord key={j} w={w} delay={3 * k++} local={local} out={out} />
            ))}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const Titles: React.FC<TitlesProps> = ({ titles }) => (
  <AbsoluteFill>
    {titles.map((t, i) => (
      <TitleBlock key={i} t={t} />
    ))}
  </AbsoluteFill>
);
