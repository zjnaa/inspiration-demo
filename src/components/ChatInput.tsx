import { useEffect, useRef, useState, KeyboardEvent } from "react";
import { Plus, X } from "lucide-react";

interface Props {
  onSubmit?: (text: string) => void;
  selectedTopic?: string | null;
  onClearTopic?: () => void;
}

export function ChatInput({ onSubmit, selectedTopic, onClearTopic }: Props) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedTopic) {
      inputRef.current?.focus();
    }
  }, [selectedTopic]);

  const nonEmpty = value.trim().length > 0 || !!selectedTopic;

  const handleSend = () => {
    let text = value.trim();
    if (selectedTopic) {
      if (text.length === 0) {
        text = `给「${selectedTopic}」补充素材`;
      } else {
        text = `给「${selectedTopic}」${text}`;
      }
    }
    if (!text) return;
    onSubmit?.(text);
    setValue("");
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "Backspace" && value.length === 0 && selectedTopic) {
      e.preventDefault();
      onClearTopic?.();
    }
  };

  return (
    <div
      className="flex items-center w-full bg-white rounded-[16px] border border-[#e5e7eb] px-2"
      style={{ minHeight: "52px" }}
    >
      <button
        className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-[#3f3f46] hover:bg-[#f5f5f5] transition-colors"
        title="添加"
        onClick={() => inputRef.current?.focus()}
      >
        <Plus size={20} strokeWidth={1.8} />
      </button>

      {/* 选中主题 pill —— 标签样式：主题：{主题名} + X */}
      {selectedTopic && (
        <div
          className="shrink-0 flex items-center gap-2 h-7 ml-1 px-3 text-[13px] font-medium"
          style={{
            borderRadius: "8px",
            background: "#EEF3FF",
            color: "#2B5CE6",
            border: "1px solid #DCE5FF",
          }}
        >
          <span>主题：{selectedTopic}</span>
          <button
            onClick={onClearTopic}
            className="flex items-center justify-center"
            style={{
              width: "14px",
              height: "14px",
              color: "#2B5CE6",
              cursor: "pointer",
            }}
            title="移除主题"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKey}
        placeholder={
          selectedTopic
            ? "回车直接补素材，也可以输入具体要求"
            : "描述你想补充的主题，例如「给视觉叙事系统补素材」"
        }
        className="flex-1 bg-transparent outline-none text-[14px] text-[#1a1a1a] placeholder:text-[#9ca3af] leading-6 ml-1"
      />

      <button
        onClick={handleSend}
        disabled={!nonEmpty}
        title="发送"
        className={
          "shrink-0 w-9 h-9 mr-1 rounded-full flex items-center justify-center transition-all " +
          (nonEmpty
            ? "text-white"
            : "opacity-60 cursor-not-allowed")
        }
      >
        <img src="/icon_send.svg" width="36" height="36" alt="发送" />
      </button>
    </div>
  );
}
