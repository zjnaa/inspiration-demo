import { useState } from "react";
import { Search, Plus, Check, X } from "lucide-react";
import { Sidebar } from "../components/Sidebar";
import { TopicCluster } from "../components/TopicCluster";
import { ChatInput } from "../components/ChatInput";

// 子阶段描述：一个完整的补素材流程会按顺序经过这些步骤
const PHASES: { label: string; duration: number }[] = [
  { label: "解析主题关键词并匹配知识域", duration: 700 },
  { label: "检索内部知识库与规范文档", duration: 900 },
  { label: "拉取相关协作会话记录", duration: 1000 },
  { label: "去重、打标签、整理摘要", duration: 700 },
];

interface MaterialItem {
  type: "文档" | "会话" | "规范" | "讨论";
  title: string;
  source: string;
  time: string;
}

interface SearchTask {
  id: number;
  topic: string;
  originalText: string;
  status: "running" | "done" | "error";
  timestamp: number;
  phase: number; // 0..PHASES.length
  result?: string;
  items?: MaterialItem[];
}

// 生成具体的素材明细 & 摘要
function buildResult(topic: string): { summary: string; items: MaterialItem[] } {
  const items: MaterialItem[] = [
    {
      type: "文档",
      title: `${topic} · 产品设计文档 v2.3`,
      source: "Notion / 产品组",
      time: "2 天前",
    },
    {
      type: "会话",
      title: `${topic} 工作流评审会议记录`,
      source: "飞书妙记",
      time: "5 小时前",
    },
    {
      type: "规范",
      title: `${topic} 接口规范与字段定义`,
      source: "内部 Wiki",
      time: "昨天",
    },
    {
      type: "讨论",
      title: `关于 ${topic} 的风险点讨论`,
      source: "飞书群聊",
      time: "3 小时前",
    },
    {
      type: "文档",
      title: `${topic} 的竞品调研`,
      source: "语雀",
      time: "6 天前",
    },
  ];
  return {
    summary: `已汇总 ${items.length} 条与「${topic}」相关的参考资料`,
    items,
  };
}

function createTaskForTopic(
  topic: string,
  setTasks: React.Dispatch<React.SetStateAction<SearchTask[]>>,
  opts?: { text?: string }
) {
  const taskId = Date.now() + Math.floor(Math.random() * 1000);
  const newTask: SearchTask = {
    id: taskId,
    topic,
    originalText: opts?.text || `给「${topic}」补充素材`,
    status: "running",
    timestamp: Date.now(),
    phase: 0,
  };
  setTasks((prev) => [newTask, ...prev]);

  const tick = (idx: number) => {
    if (idx >= PHASES.length) {
      const { summary, items } = buildResult(topic);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, status: "done" as const, phase: idx, result: summary, items }
            : t
        )
      );
      return;
    }
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, phase: idx } : t))
    );
    window.setTimeout(() => tick(idx + 1), PHASES[idx].duration);
  };
  window.setTimeout(() => tick(1), 400);
}

export function Home() {
  const now = Date.now();
  const [tasks, setTasks] = useState<SearchTask[]>([
    {
      id: 1,
      topic: "Multi-Agent 编排",
      originalText: "给「Multi-Agent 编排」补充素材",
      status: "done",
      timestamp: now - 18 * 1000,
      phase: PHASES.length,
      result: "已拉取 12 条相关协作会话记录",
      items: [
        { type: "文档", title: "Multi-Agent 编排 · 产品设计文档 v2.3", source: "Notion / 产品组", time: "2 天前" },
        { type: "会话", title: "Multi-Agent 工作流评审会议记录", source: "飞书妙记", time: "5 小时前" },
        { type: "规范", title: "Multi-Agent 接口规范与字段定义", source: "内部 Wiki", time: "昨天" },
      ],
    },
    {
      id: 2,
      topic: "设计系统 3.0",
      originalText: "给「设计系统 3.0」补充素材",
      status: "done",
      timestamp: now - 23 * 1000,
      phase: PHASES.length,
      result: "已汇总 7 份团队设计规范与组件库链接",
      items: [
        { type: "规范", title: "设计系统 3.0 · Token 与配色规范", source: "Figma Library", time: "1 周前" },
        { type: "文档", title: "设计系统 3.0 · 组件清单", source: "语雀", time: "3 天前" },
      ],
    },
  ]);
  const [expanded, setExpanded] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [drawerTask, setDrawerTask] = useState<SearchTask | null>(null);

  const total = tasks.length;
  const runningCount = tasks.filter((t) => t.status === "running").length;

  // 输入框输入文本后提交
  const handleSubmit = (text: string) => {
    const topic = extractTopic(text);
    setSelectedTopic(null);
    createTaskForTopic(topic, setTasks, { text });
  };

  // 点击卡片的 chat 图标 —— 把主题引用到输入框的 pill
  const handleAddMaterial = (topic: string) => {
    setSelectedTopic(topic);
  };

  // 点击卡片主体 —— 切换主题选中状态
  const handleSelectTopic = (topic: string) => {
    setSelectedTopic((prev) => (prev === topic ? null : prev));
  };

  const handleClearTopic = () => setSelectedTopic(null);

  const handleDeleteTask = (taskId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (drawerTask?.id === taskId) setDrawerTask(null);
  };

  const handleOpenDrawer = (task: SearchTask) => {
    if (task.status === "running") return;
    setDrawerTask(task);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-gray-900">
      <Sidebar />

      <main
        className="flex-1 flex flex-col min-w-0 bg-white relative"
        style={{ scrollbarGutter: "stable" }}
      >
        {/* 顶栏 */}
        <header className="flex items-center justify-between h-14 px-5 shrink-0 bg-white border-b border-gray-100 z-10">
          <h1 className="text-[14px] font-medium text-[#1a1a1a]">灵感主题</h1>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 h-7 px-3 rounded-[6px] bg-[rgba(136,136,136,0.10)] text-[13px] font-medium text-[#1a1a1a] hover:bg-[rgba(136,136,136,0.15)] transition-colors">
              <img src="/icon_summary.svg" width="14" height="14" alt="查看素材库" />
              <span>查看素材库</span>
            </button>
            <button className="w-7 h-7 rounded-[6px] bg-[rgba(136,136,136,0.10)] flex items-center justify-center hover:bg-[rgba(136,136,136,0.15)] transition-colors text-gray-700">
              <Search size={14} strokeWidth={1.8} />
            </button>
          </div>
        </header>

        {/* 中央内容区 */}
        <section
          className="flex-1 overflow-y-auto px-6"
          style={{ scrollbarGutter: "stable" }}
        >
          <div className="flex flex-col items-center w-full py-10 gap-10">
            <div className="flex flex-col items-center">
              <p className="text-[14px] text-gray-500 mb-3">创建你的灵感主题</p>
              <button className="flex items-center gap-1.5 h-9 px-4 rounded-full bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-400 hover:to-sky-500 text-white text-[14px] font-medium shadow-[0_6px_14px_-4px_rgba(14,165,233,0.5)]">
                <Plus size={16} strokeWidth={2.2} />
                <span>添加主题</span>
              </button>
            </div>

            <TopicCluster
              onAddMaterial={handleAddMaterial}
              onSelect={handleSelectTopic}
              selectedTopic={selectedTopic}
            />
          </div>
        </section>

        {/* 底部：素材搜寻条 + 输入框 */}
        <div className="pb-5 pt-1 flex flex-col items-center">
          <div
            className="w-full max-w-[640px] flex flex-col items-center"
            style={{
              background: "#F3F3F3",
              borderRadius: "14px",
              padding: "0",
              margin: "0",
              gap: "0",
            }}
          >
            {total > 0 && (
              <div className="w-full">
                <div
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center w-full cursor-pointer transition-colors"
                  style={{
                    height: "44px",
                    background: "transparent",
                    borderRadius: "0",
                    padding: "8px 16px",
                    gap: "10px",
                  }}
                >
                  <img src="/icon_text_editor.svg" width="22" height="22" alt="素材搜寻" style={{ flexShrink: 0 }} />

                  <span
                    className="shrink-0"
                    style={{
                      fontSize: "14px",
                      fontWeight: 400,
                      lineHeight: "22px",
                      color: "#1A1A1A",
                    }}
                  >
                    素材搜寻
                  </span>

                  <span
                    className="shrink-0 flex items-center justify-center"
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "999px",
                      background: "rgba(136, 136, 136, 0.14)",
                      fontSize: "11px",
                      fontWeight: 400,
                      lineHeight: "1",
                      color: "#1A1A1A",
                    }}
                  >
                    {total}
                  </span>

                  <span
                    className="shrink-0"
                    style={{
                      marginLeft: "auto",
                      fontSize: "13px",
                      fontWeight: 400,
                      lineHeight: "22px",
                      color: "#8A8A8A",
                    }}
                  >
                    {(() => {
                      const done = tasks.filter((t) => t.status === "done").length;
                      const running = tasks.filter((t) => t.status === "running").length;
                      const allDone = tasks.length > 0 && tasks.every((t) => t.status === "done");
                      if (allDone) return `已完成：${done} / 点击查看结果`;
                      return `进行中：${running} / 已完成：${done}`;
                    })()}
                  </span>

                  <span
                    className="shrink-0 flex items-center justify-center"
                    style={{ width: "16px", height: "16px", color: "#8A8A8A", marginLeft: "2px" }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        transition: "transform 200ms",
                        transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                        display: "block",
                      }}
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </span>
                </div>

                {expanded && tasks.length > 0 && (
                  <div
                    className="w-full flex flex-col"
                    style={{
                      gap: "8px",
                      padding: "0 12px 0 12px",
                      background: "transparent",
                      animation: "fadeIn 200ms ease-out both",
                    }}
                  >
                    {tasks.map((task) => {
                      const isRunning = task.status === "running";
                      const isDone = task.status === "done";
                      const isError = task.status === "error";
                      return (
                        <div
                          key={task.id}
                          onClick={() => handleOpenDrawer(task)}
                          className={`w-full flex items-start ${
                            isRunning ? "" : "cursor-pointer hover:bg-[#FAFAFA]"
                          }`}
                          style={{
                            gap: "10px",
                            background: "#FFFFFF",
                            borderRadius: "10px",
                            padding: "14px 16px",
                            transition: "background 150ms",
                          }}
                        >
                          {/* 状态图标 */}
                          <div
                            className="shrink-0 flex items-center justify-center"
                            style={{
                              width: "20px",
                              height: "20px",
                              color: isDone
                                ? "#10B981"
                                : isError
                                ? "#ef4444"
                                : "#9ca3af",
                              marginTop: "2px",
                            }}
                          >
                            {isRunning && (
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeDasharray="3 3"
                                className="animate-spin"
                              >
                                <circle cx="12" cy="12" r="8" />
                              </svg>
                            )}
                            {isDone && (
                              <span
                                className="flex items-center justify-center"
                                style={{
                                  width: "20px",
                                  height: "20px",
                                  borderRadius: "999px",
                                  background: "#ECFDF5",
                                }}
                              >
                                <Check size={14} color="#10B981" strokeWidth={2.5} />
                              </span>
                            )}
                            {isError && <X size={18} strokeWidth={2} />}
                          </div>

                          {/* 内容 */}
                          <div className="flex-1 min-w-0">
                            <div
                              style={{
                                fontSize: "14px",
                                fontWeight: 400,
                                lineHeight: "22px",
                                color: "#1A1A1A",
                              }}
                            >
                              给「{task.topic}」补充问答相关素材
                            </div>
                            <div
                              style={{
                                fontSize: "13px",
                                fontWeight: 400,
                                lineHeight: "20px",
                                color: "#8A8A8A",
                                marginTop: "4px",
                              }}
                            >
                              {isRunning &&
                                (task.phase > 0 && task.phase < PHASES.length
                                  ? `${PHASES[task.phase].label}…`
                                  : "准备中…")}
                              {isDone && task.result}
                              {isError && "获取失败，请稍后重试"}
                            </div>
                            {isRunning && (
                              <div
                                style={{
                                  marginTop: "10px",
                                  height: "3px",
                                  width: "100%",
                                  background: "rgba(136,136,136,0.12)",
                                  borderRadius: "999px",
                                  overflow: "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    height: "100%",
                                    width: `${Math.min(
                                      100,
                                      Math.round((Math.max(task.phase, 0) / PHASES.length) * 100)
                                    )}%`,
                                    background: "#1A1A1A",
                                    transition: "width 500ms ease-out",
                                  }}
                                />
                              </div>
                            )}
                          </div>

                          {/* 右侧：时间 + 删除 */}
                          <div
                            className="shrink-0 flex items-center"
                            style={{ gap: "6px", marginLeft: "8px" }}
                          >
                            <span
                              style={{
                                fontSize: "13px",
                                fontWeight: 400,
                                lineHeight: "20px",
                                color: "#9ca3af",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {formatHumanTime(task.timestamp, isRunning)}
                            </span>
                            <button
                              onClick={(e) => handleDeleteTask(task.id, e)}
                              className="flex items-center justify-center rounded-[6px] hover:bg-[rgba(136,136,136,0.12)] transition-colors"
                              style={{
                                width: "22px",
                                height: "22px",
                                color: "#9ca3af",
                              }}
                              title="删除任务"
                            >
                              <X size={14} strokeWidth={1.8} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <ChatInput
              onSubmit={handleSubmit}
              selectedTopic={selectedTopic}
              onClearTopic={handleClearTopic}
            />
          </div>
        </div>

        {/* 抽屉：任务详情 */}
        {drawerTask && (
          <>
            {/* 遮罩 */}
            <div
              onClick={() => setDrawerTask(null)}
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.25)",
                zIndex: 30,
                animation: "fadeIn 150ms ease-out both",
              }}
            />
            {/* 抽屉本体 */}
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "420px",
                height: "100%",
                background: "#FFFFFF",
                boxShadow: "-12px 0 32px -8px rgba(0,0,0,0.12)",
                zIndex: 40,
                display: "flex",
                flexDirection: "column",
                animation: "drawerIn 220ms cubic-bezier(0.2, 0.8, 0.2, 1) both",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "14px 18px",
                  borderBottom: "1px solid #F0F0F0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "22px",
                    height: "22px",
                    borderRadius: "999px",
                    background: "#ECFDF5",
                    color: "#10B981",
                  }}
                >
                  <Check size={14} strokeWidth={2.5} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#1A1A1A",
                      lineHeight: "22px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    「{drawerTask.topic}」素材补充
                  </div>
                  <div style={{ fontSize: "12px", color: "#9ca3af", lineHeight: "18px" }}>
                    {drawerTask.result ?? "进行中…"}
                  </div>
                </div>
                <button
                  onClick={() => setDrawerTask(null)}
                  className="flex items-center justify-center rounded-[6px] hover:bg-[rgba(136,136,136,0.12)] transition-colors"
                  style={{ width: "28px", height: "28px", color: "#9ca3af" }}
                >
                  <X size={16} strokeWidth={1.8} />
                </button>
              </div>

              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "14px 18px 24px 18px",
                  scrollbarGutter: "stable",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    color: "#9ca3af",
                    marginBottom: "8px",
                    letterSpacing: "0.2px",
                  }}
                >
                  本次检索到 {drawerTask.items?.length ?? 0} 条相关素材
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {drawerTask.items?.map((it, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "12px 14px",
                        borderRadius: "10px",
                        background: "#FAFAFA",
                        border: "1px solid #F0F0F0",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          marginBottom: "6px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "11px",
                            padding: "2px 6px",
                            borderRadius: "999px",
                            background:
                              it.type === "文档"
                                ? "#EEF4FF"
                                : it.type === "会话"
                                ? "#F2F8F1"
                                : it.type === "规范"
                                ? "#FFF4E5"
                                : "#F3EEFB",
                            color:
                              it.type === "文档"
                                ? "#2563EB"
                                : it.type === "会话"
                                ? "#16A34A"
                                : it.type === "规范"
                                ? "#D97706"
                                : "#7C3AED",
                            fontWeight: 500,
                            lineHeight: "1.4",
                          }}
                        >
                          {it.type}
                        </span>
                        <span style={{ fontSize: "12px", color: "#9ca3af" }}>
                          {it.time}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          color: "#1A1A1A",
                          lineHeight: "22px",
                          fontWeight: 400,
                        }}
                      >
                        {it.title}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#9ca3af",
                          lineHeight: "18px",
                          marginTop: "4px",
                        }}
                      >
                        {it.source}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function formatHumanTime(timestamp: number, _running?: boolean): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds} s 后自动消失`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes} min 后自动消失`;
}

function extractTopic(text: string): string {
  const patterns = [
    /给(.+?)补/,
    /为(.+?)补充/,
    /(?:补充|添加|搜索|找|补)(.+?)(?:的|素材|主题)/,
    /(.+?)的素材/,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m && m[1]) return m[1].trim();
  }
  return text.trim();
}
