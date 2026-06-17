import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";

// 4 套半透明底色（来自 card-style-params.md §3）
const PALETTES: Record<string, { bg: string; label: string }> = {
  blue: { bg: "rgba(204, 235, 255, 0.7)", label: "blue" },
  green: { bg: "rgba(213, 255, 243, 0.7)", label: "green" },
  yellow: { bg: "rgba(255, 230, 156, 0.7)", label: "yellow" },
  orange: { bg: "rgba(255, 232, 223, 0.7)", label: "orange" },
};

// 8 张卡片排布参数（来自 card-style-params.md §5）
interface CardLayout {
  id: string;
  title: string;
  subtitle: string;
  palette: string;
  rotate: number;
  offsetX: number;
  offsetY: number;
  z: number;
  count: number;
  time: string;
  isMine?: boolean;
}

// 统一的花瓣式坐标排布（8 张一组，两屏复用，保证视觉均衡）
const LAYOUT: { rotate: number; offsetX: number; offsetY: number; z: number }[] = [
  { rotate: 6, offsetX: -295, offsetY: -44, z: 1 },
  { rotate: -29, offsetX: -231, offsetY: 71, z: 2 },
  { rotate: -49, offsetX: -109, offsetY: -47, z: 3 },
  { rotate: 0, offsetX: 13, offsetY: -84, z: 4 },
  { rotate: 37, offsetX: 297, offsetY: 0, z: 5 },
  { rotate: -17, offsetX: 179, offsetY: -57, z: 6 },
  { rotate: 17, offsetX: 187, offsetY: 79, z: 7 },
  { rotate: -18, offsetX: -39, offsetY: 82, z: 8 },
];

const RAW_DATA: CardLayout[] = [
  // 第 1 屏
  { id: "t-1", title: "视觉叙事系统", subtitle: "从故事板到动态海报，构建一致的品牌视觉语言与叙事节奏", palette: "blue", ...LAYOUT[0], count: 18, time: "12:00", isMine: true },
  { id: "t-2", title: "产品设计语言", subtitle: "面向 Web 与移动端的组件规范、交互模式与动效标准", palette: "green", ...LAYOUT[1], count: 15, time: "14:20" },
  { id: "t-3", title: "企业知识问答工作台", subtitle: "面向 RAG 与 Agent 的知识库结构、检索策略与工程落地实践", palette: "yellow", ...LAYOUT[2], count: 22, time: "09:45" },
  { id: "t-4", title: "设计系统 3.0", subtitle: "从 token 到组件到文档的全链路视觉与交互规范建设", palette: "orange", ...LAYOUT[3], count: 16, time: "16:05", isMine: true },
  { id: "t-5", title: "插画与角色设计", subtitle: "品牌角色、插画风格、表情包与应用场景的统一视觉资产库", palette: "blue", ...LAYOUT[4], count: 12, time: "20:30" },
  { id: "t-6", title: "多智能体协作", subtitle: "任务拆解、工具调用与 Agent 间通信的编排与评估体系", palette: "green", ...LAYOUT[5], count: 20, time: "11:10" },
  { id: "t-7", title: "产品发布文档", subtitle: "Release Notes、更新公告与用户引导文案的模板与发布流程", palette: "orange", ...LAYOUT[6], count: 9, time: "15:40" },
  { id: "t-8", title: "知识图谱构建", subtitle: "从非结构化语料到结构化图谱的端到端知识建模与维护", palette: "blue", ...LAYOUT[7], count: 24, time: "10:15" },
  // 第 2 屏
  { id: "t-9", title: "品牌 VI 管理", subtitle: "Logo、色彩、字体到应用场景的品牌资产库与使用规范", palette: "green", ...LAYOUT[0], count: 14, time: "13:25" },
  { id: "t-10", title: "深色模式适配", subtitle: "对比度、层级、语义色彩与跨平台渲染的深色模式规范", palette: "orange", ...LAYOUT[1], count: 11, time: "21:00" },
  { id: "t-11", title: "数据可视化主题", subtitle: "图表类型选型、颜色映射到信息层级的可视化设计规范", palette: "yellow", ...LAYOUT[2], count: 19, time: "17:45" },
  { id: "t-12", title: "营销内容生产", subtitle: "从海报、短视频到 H5 的素材库与创意变体管理", palette: "green", ...LAYOUT[3], count: 13, time: "19:20", isMine: true },
  { id: "t-13", title: "对话式工作流", subtitle: "对话入口、指令解析、结果呈现到用户反馈的端到端流程", palette: "blue", ...LAYOUT[4], count: 17, time: "08:50" },
  { id: "t-14", title: "运营物料管理", subtitle: "Banner、封面图、卡片与物料组件的统一设计规范与复用", palette: "orange", ...LAYOUT[5], count: 21, time: "22:10" },
  { id: "t-15", title: "业务指标看板", subtitle: "指标体系、卡片布局、数据故事化表达与看板建设流程", palette: "yellow", ...LAYOUT[6], count: 16, time: "14:55" },
  { id: "t-16", title: "组件库建设", subtitle: "从设计规范到代码落地的 UI Kit 建设、维护与升级策略", palette: "orange", ...LAYOUT[7], count: 23, time: "07:30", isMine: true },
];

interface Props {
  onAddMaterial?: (topic: string) => void;
  onSelect?: (topic: string) => void;
  selectedTopic?: string | null;
}

const PAGE_SIZE = 8;

export function TopicCluster({ onAddMaterial, onSelect, selectedTopic }: Props) {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(RAW_DATA.length / PAGE_SIZE));
  const cards = useMemo(
    () => RAW_DATA.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [page]
  );

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPage((p) => (p - 1 + totalPages) % totalPages);
  };
  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPage((p) => (p + 1) % totalPages);
  };

  const handleCardClick = (e: React.MouseEvent, title: string) => {
    e.stopPropagation();
    onSelect?.(title);
  };

  const handleAddMaterial = (e: React.MouseEvent, title: string) => {
    e.stopPropagation();
    e.preventDefault();
    onAddMaterial?.(title);
  };

  return (
    <div className="flex flex-col items-center w-full select-none">
      {/* 卡片堆叠容器：扩大高度让整组在 flex 布局中上下居中 */}
      <div
        className="relative w-full flex items-center justify-center flex-1"
        style={{ maxWidth: "750px", minHeight: "320px" }}
      >
        {/* 左翻页箭头：属于卡片区域，贴近卡片边缘 */}
        <button
          onClick={handlePrev}
          style={{
            position: "absolute",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            border: "1px solid #E4E4E4",
            background: "#FFFFFF",
            color: "#1A1A1A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 10,
            boxShadow: "0 2px 8px -2px rgba(20,30,60,0.08)",
          }}
        >
          <ChevronLeft size={16} strokeWidth={2} />
        </button>
        {/* 右翻页箭头：属于卡片区域，贴近卡片边缘 */}
        <button
          onClick={handleNext}
          style={{
            position: "absolute",
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            border: "1px solid #E4E4E4",
            background: "#FFFFFF",
            color: "#1A1A1A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 10,
            boxShadow: "0 2px 8px -2px rgba(20,30,60,0.08)",
          }}
        >
          <ChevronRight size={16} strokeWidth={2} />
        </button>

        <div
          className="relative origin-center"
          style={{ width: "750px", height: "315px", transform: "scale(0.85)" }}
        >
          {cards.map((card) => {
            const isHover = hoverId === card.id;
            const isSelected = selectedTopic === card.title;
            const paletteKey = card.palette as keyof typeof PALETTES;
            const bg = PALETTES[paletteKey].bg;

            return (
              <div
                key={card.id}
                onMouseEnter={() => setHoverId(card.id)}
                onMouseLeave={() => setHoverId(null)}
                onClick={(e) => handleCardClick(e, card.title)}
                className="absolute cursor-pointer overflow-hidden"
                style={{
                  // 尺寸：200 × 280
                  width: "200px",
                  height: "280px",
                  // 定位：以中心点为参考
                  left: "50%",
                  top: "50%",
                  // 圆角：12px
                  borderRadius: "12px",
                  // 边框：1px white（所有卡片一致，不做颜色区分）
                  border: "1px solid #FFFFFF",
                  // 背景：半透明色
                  background: bg,
                  // 背景模糊
                  backdropFilter: "blur(4px)",
                  WebkitBackdropFilter: "blur(4px)",
                  // flex column，上下两端对齐
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  // transform 公式：translate(-50%, -50%) + translate(offset) + rotate
                  // hover 时：offsetY - 14, rotate * 0.6, scale 1.03
                  transform: isHover
                    ? `translate(-50%, -50%) translate(${card.offsetX}px, ${card.offsetY - 14}px) rotate(${card.rotate * 0.6}deg) scale(1.03)`
                    : `translate(-50%, -50%) translate(${card.offsetX}px, ${card.offsetY}px) rotate(${card.rotate}deg)`,
                  // 过渡：300ms ease-out
                  transition: "all 300ms ease-out",
                  // 阴影
                  boxShadow: isHover
                    ? "0 18px 40px -10px rgba(20, 30, 60, 0.24), 0 4px 12px -2px rgba(20, 30, 60, 0.12)"
                    : "0 8px 24px -8px rgba(20, 30, 60, 0.16), 0 2px 6px -2px rgba(20, 30, 60, 0.08)",
                  zIndex: isHover ? 100 : card.z,
                  willChange: "transform",
                }}
              >
                {/* "我"的标签，放在右上角避免挡标题 */}
                {card.isMine && (
                  <div
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      padding: "2px 8px",
                      height: "18px",
                      borderRadius: "9px",
                      background: "rgba(255, 255, 255, 0.92)",
                      color: "#3A3A3A",
                      fontSize: "11px",
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      lineHeight: 1,
                      zIndex: 5,
                      border: "1px solid rgba(0, 0, 0, 0.06)",
                    }}
                  >
                    我的
                  </div>
                )}

                {/* 顶部标题区：padding 11px 15px */}
                <div style={{ padding: "11px 15px" }}>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 500,
                      lineHeight: "22px",
                      color: "#1A1A1A",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {card.title}
                  </div>
                  <div
                    style={{
                      width: "168px",
                      fontSize: "12px",
                      lineHeight: "18px",
                      color: "#666666",
                      marginTop: "6px",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {card.subtitle}
                  </div>
                </div>

                {/* 底部信息 */}
                <div
                  style={{
                    padding: "11px 15px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
                    <span
                      style={{
                        fontSize: "13px",
                        lineHeight: "20px",
                        color: "#666666",
                      }}
                    >
                      {card.count}
                    </span>
                    <span
                      style={{
                        fontSize: "10px",
                        lineHeight: "14px",
                        color: "#666666",
                      }}
                    >
                      个来源
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: "12px",
                      lineHeight: "18px",
                      color: "#666666",
                      fontFamily: "monospace",
                    }}
                  >
                    {card.time}
                  </span>
                </div>

                {/* hover 时出现的 chat 图标 —— 跟随卡片角度，无底色，默认灰 hover 深 */}
                <button
                  onClick={(e) => handleAddMaterial(e, card.title)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    bottom: "12px",
                    width: "22px",
                    height: "22px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: isHover ? "#1A1A1A" : "#8A8A8A",
                    opacity: isHover ? 1 : 0,
                    pointerEvents: isHover ? "auto" : "none",
                    transform: isHover ? "translateY(0)" : "translateY(2px)",
                    transition: "all 300ms ease-out",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                  title={`给「${card.title}」补素材`}
                >
                  <MessageCircle size={18} strokeWidth={1.8} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 分页指示器 —— 轮播小圆点 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginTop: "24px",
        }}
      >
        {Array.from({ length: totalPages }).map((_, idx) => (
          <span
            key={idx}
            style={{
              width: idx === page ? "20px" : "6px",
              height: "6px",
              borderRadius: "3px",
              background: idx === page ? "#1A1A1A" : "rgba(26,26,26,0.18)",
              transition: "all 300ms ease-out",
              cursor: "pointer",
            }}
            onClick={() => setPage(idx)}
          />
        ))}
      </div>

      {/* see all —— 与卡片拉开距离 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginTop: "40px",
          fontSize: "13px",
          color: "#666666",
          cursor: "pointer",
          transition: "color 300ms ease-out",
        }}
        className="hover:text-gray-900"
      >
        <span>see all</span>
        <ChevronRight size={14} strokeWidth={2} />
      </div>
    </div>
  );
}
