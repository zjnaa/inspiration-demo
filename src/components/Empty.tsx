import { useEffect, useRef, useState } from "react";

/* =========================================================================
   空态页 · 顶部图标轨道（"传送带"视觉）
   · 图标沿圆弧 0°(右) → 90°(底) → 180°(左) 平滑滑动
   · 每 3 秒整体推进一格（"传送带"式），底部中心的图标会"掉"进卡片
   · 物理下落：图标在底部中心位置冻结，向卡片内垂直坠落并淡出（不缩小）
   · 新图标从右侧淡入补入，其他图标自然"顶上来"
   · 两端渐隐：越靠近圆弧末端越淡
   · 卡片：200×280 / 12px 圆角 / rgba(204,235,255,0.7) —— 与 TopicCluster 一致
   ========================================================================= */

const BASE = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

const CARD_W = 200;
const CARD_H = 280;
const CARD_BG = "rgba(204, 235, 255, 0.7)";

const ORBIT_CENTER_Y = 160; // 轨道圆心 Y（相对容器顶部）
const ORBIT_RADIUS = 180;   // 轨道半径
const ICON_COUNT = 9;        // 可见图标数（不含两侧外部淡入淡出的）
const STEP_DEG = 18;         // 每 3 秒推进一格
const TICK_MS = 3000;        // 推进周期
const FALL_MS = 700;         // 下落动画时长
const FALL_DISTANCE = 140;   // 下落距离（从轨道中心向下坠入卡片）

// 平台图标（顺序：从右到左在 tick=0 时排列在弧上）
const PLATFORM_ICONS: { key: string; label: string; bg: string; textColor: string; size?: number }[] = [
  { key: "tw-r",   label: "🐦", bg: "rgba(120, 140, 200, 0.10)", textColor: "rgba(120, 140, 200, 0.55)", size: 16 },
  { key: "bili",   label: "📺", bg: "#F4A5C8", textColor: "#FFFFFF" },
  { key: "reddit", label: "🤖", bg: "#FF8B60", textColor: "#FFFFFF" },
  { key: "pin",    label: "P",  bg: "#E60023", textColor: "#FFFFFF" },
  { key: "fb",     label: "f",  bg: "#1877F2", textColor: "#FFFFFF" },
  { key: "ig",     label: "◉",  bg: "linear-gradient(135deg,#F58529 0%,#DD2A7B 55%,#8134AF 100%)", textColor: "#FFFFFF", size: 22 },
  { key: "yt",     label: "▶",  bg: "#FF0000", textColor: "#FFFFFF" },
  { key: "dis",    label: "D",  bg: "#5865F2", textColor: "#FFFFFF" },
  { key: "wa",     label: "✓",  bg: "#25D366", textColor: "#FFFFFF" },
];

/* —— 工具函数 —— */
function posOfAngle(deg: number): { x: number; y: number } {
  const rad = (deg * Math.PI) / 180;
  return {
    x: ORBIT_RADIUS * Math.cos(rad),              // 0°=右(+x), 180°=左(-x)
    y: ORBIT_CENTER_Y + ORBIT_RADIUS * Math.sin(rad), // 0°=centerY, 90°=centerY+R(最低点)
  };
}
// 两端渐隐：根据与中心 90° 的角度距离返回 opacity
function opacityOfAngle(deg: number): number {
  const d = Math.abs(deg - 90);
  if (d >= 85) return 0;       // 已越出/未进入：完全透明
  if (d >= 70) return 0.25;    // 极边缘
  if (d >= 55) return 0.55;    // 较边缘
  if (d >= 35) return 0.85;    // 靠近
  return 1;                     // 中心区清晰
}

export default function Empty({ onAdd }: { onAdd?: () => void }) {
  // tick: 已推进格数（整数）；fraction: 当前 3s 周期内的进度（0~1，连续）
  const [tick, setTick] = useState(0);
  const [fraction, setFraction] = useState(0);
  // fallingIdx: 当前正在下落的图标索引；fallingProgress: 下落动画进度（0~1）
  const [fallingIdx, setFallingIdx] = useState<number | null>(null);
  const [fallingProgress, setFallingProgress] = useState(0);
  // 记录：每次 tick 时，正在底部中心位置的图标索引
  const bottomIconIdxRef = useRef<number | null>(null);

  const rafRef = useRef<number | null>(null);
  const tickStartRef = useRef<number>(performance.now());
  const fallStartRef = useRef<number | null>(null);

  // —— 主循环：推进 tick + 平滑 fraction ——
  useEffect(() => {
    const loop = () => {
      const now = performance.now();
      const elapsed = now - tickStartRef.current;
      const f = Math.min(1, elapsed / TICK_MS);
      setFraction(f);

      if (f >= 1) {
        // 推进一格：重置起点 + tick+1
        tickStartRef.current = now;
        setTick((t) => t + 1);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // —— 每次 tick 变化：检测到达底部中心的图标，并启动下落动画 ——
  useEffect(() => {
    if (tick <= 0) return;
    // 底部中心角度 = 90° = positionIndex = 5 → icon i 满足 (i - tick) * STEP_DEG ≈ 90°
    // 即 i ≈ tick + 5（不做模，因为图标按顺序循环）
    const bottomIndex = (tick + 5) % ICON_COUNT;
    bottomIconIdxRef.current = bottomIndex;
    setFallingIdx(bottomIndex);
    fallStartRef.current = performance.now();
    // 下落动画由独立的 rAF 驱动
    let fallRaf = 0;
    const fallLoop = () => {
      const start = fallStartRef.current;
      if (start == null) return;
      const p = Math.min(1, (performance.now() - start) / FALL_MS);
      setFallingProgress(p);
      if (p < 1) {
        fallRaf = requestAnimationFrame(fallLoop);
      } else {
        // 下落结束：清理
        setFallingIdx(null);
        setFallingProgress(0);
        fallStartRef.current = null;
      }
    };
    fallRaf = requestAnimationFrame(fallLoop);
    return () => cancelAnimationFrame(fallRaf);
  }, [tick]);

  // 卡片中心、底部位置坐标（为了计算坠落终点）
  const bottomCenter = posOfAngle(90);
  const cardTopY = ORBIT_CENTER_Y + 60;
  const cardCenterY = cardTopY + CARD_H / 2;
  const targetY = cardTopY + CARD_H * 0.25; // 掉到卡片上部位置（"被吞进去"的感觉）

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: 760,
        userSelect: "none",
      }}
    >
      {/* 轨道圆心参考系：容器水平中心为 0 */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 0,
          bottom: 0,
          width: 0,
          pointerEvents: "none",
        }}
      >
        {/* —— 平台图标（沿弧平滑滑动）—— */}
        {PLATFORM_ICONS.map((icon, i) => {
          // icon i 的当前角度（平滑）：angle = i*STEP_DEG - (tick + fraction) * STEP_DEG
          const angleDeg = i * STEP_DEG - (tick + fraction) * STEP_DEG;
          const isFalling = fallingIdx === i;

          let x: number;
          let y: number;
          let opacity: number;

          if (isFalling) {
            // 冻结在轨道最低点（底部中心），然后向下坠落 + opacity 淡出
            const { x: bx, y: by } = bottomCenter;
            x = bx;
            // 从底部中心向下坠落：使用 ease-in 模拟重力加速
            const p = fallingProgress;
            const easeIn = p * p; // 平方加速
            y = by + easeIn * (targetY - by); // 从 by 掉到 targetY
            opacity = 1 - easeIn;
          } else {
            const pos = posOfAngle(angleDeg);
            x = pos.x;
            y = pos.y;
            opacity = opacityOfAngle(angleDeg);
          }

          return (
            <div
              key={icon.key}
              style={{
                position: "absolute",
                left: x - 21,
                top: y - 21,
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: icon.bg,
                color: icon.textColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: icon.size || 18,
                fontWeight: 700,
                fontFamily: '"PingFang SC","Microsoft YaHei",sans-serif',
                lineHeight: 1,
                boxShadow: "0 4px 14px rgba(20,30,60,0.16)",
                opacity: opacity,
                zIndex: isFalling ? 5 : 1,
                // 平滑过渡：fraction 驱动的 rAF 让 transform 每帧更新，所以不需要 CSS transition
                // 但为了让动画更柔和，加一个极短 transition
                transition: isFalling
                  ? `opacity ${FALL_MS}ms linear`
                  : "opacity 500ms ease-out",
                willChange: "transform, opacity",
              }}
            >
              {icon.label}
            </div>
          );
        })}

        {/* —— 卡片（与 TopicCluster 视觉规范一致）—— */}
        <div
          style={{
            position: "absolute",
            left: -CARD_W / 2,
            top: ORBIT_CENTER_Y + 60,
            width: CARD_W,
            height: CARD_H,
            borderRadius: 12,
            border: "1px solid #FFFFFF",
            background: CARD_BG,
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            boxShadow:
              "0 8px 24px -8px rgba(20, 30, 60, 0.16), 0 2px 6px -2px rgba(20, 30, 60, 0.08)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "11px 15px", textAlign: "left" }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 500,
                lineHeight: "22px",
                color: "#1A1A1A",
              }}
            >
              Flux 灵感使用指南
            </div>
            <div
              style={{
                fontSize: 12,
                lineHeight: "18px",
                color: "#666666",
                marginTop: 6,
              }}
            >
              系统化覆盖 AI Agent 的核心理念、操作流程与最佳实践，帮你快速搭建灵感来源。
            </div>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={`${BASE}/octopus.png`}
              alt="灵感助手"
              style={{
                width: 140,
                height: 140,
                objectFit: "contain",
                display: "block",
              }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          </div>

          <div style={{ padding: "11px 15px", display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
              <span style={{ fontSize: 13, lineHeight: "20px", color: "#666666" }}>18</span>
              <span style={{ fontSize: 10, lineHeight: "14px", color: "#666666" }}>个来源</span>
            </div>
            <span
              style={{
                fontSize: 12,
                lineHeight: "18px",
                color: "#666666",
                fontFamily: "monospace",
              }}
            >
              12:00
            </span>
          </div>
        </div>

        {/* —— 添加新主题按钮 —— */}
        <div
          style={{
            position: "absolute",
            top: ORBIT_CENTER_Y + 60 + CARD_H + 30,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <button
            onClick={onAdd}
            style={{
              height: 36,
              padding: "0 20px",
              borderRadius: 18,
              border: "1px solid rgba(136,136,136,0.25)",
              background: "#FFFFFF",
              color: "#1A1A1A",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(20,30,60,0.06)",
              transition: "transform 150ms ease-out, background 150ms ease-out",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.background = "#FAFAFA";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.background = "#FFFFFF";
            }}
          >
            添加新主题
          </button>
        </div>
      </div>
    </div>
  );
}
