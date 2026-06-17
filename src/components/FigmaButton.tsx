import { useState, useEffect, useRef } from "react";
import { X, ExternalLink } from "lucide-react";
import { FigmaLogo } from "./icons";

interface FigmaEmbedProps {
  fileUrl?: string;
}

const DEFAULT_URL =
  "https://www.figma.com/design/U3ozlb4TTs4Rx64sRx1yDI/Flux-%E7%81%B5%E6%84%9F%E8%AE%BE%E8%AE%A1";

export function FigmaButton({ fileUrl = DEFAULT_URL }: FigmaEmbedProps) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  // Figma 支持通过 /proto/ 或 /file/ 嵌入预览
  // 注意：Figma iframe 要求登录状态，未登录会跳转到登录页
  const embedUrl = fileUrl.replace(
    /\/design\//,
    "/embed/"
  ) + "?embed_host=share";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 h-7 px-3 rounded-[6px] bg-[rgba(136,136,136,0.10)] text-[13px] font-medium text-[#1a1a1a] hover:bg-[rgba(136,136,136,0.15)] transition-colors"
      >
        <FigmaLogo size={14} />
        <span>Figma</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm animate-[fadeIn_200ms_ease-out]"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            ref={dialogRef}
            className="relative w-[min(1100px,95vw)] h-[min(720px,90vh)] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-[slideUp_250ms_ease-out]"
          >
            {/* 顶部栏 */}
            <div className="flex items-center justify-between h-12 px-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2">
                <FigmaLogo className="w-4 h-4 text-gray-800" />
                <span className="text-[13px] font-medium text-gray-800">
                  Flux 灵感设计 · 设计稿
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="h-8 px-3 flex items-center gap-1.5 rounded-full text-[12px] text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>在新标签打开</span>
                </a>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                  aria-label="关闭"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* iframe 内容 */}
            <div className="flex-1 bg-gray-50 relative">
              <iframe
                src={embedUrl}
                title="Figma Design"
                allow="fullscreen; clipboard-read; clipboard-write"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            </div>

            {/* 底部提示 */}
            <div className="h-9 px-4 flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-100 shrink-0 bg-white">
              <span>未登录时将看到 Figma 登录页</span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 text-[10px]">
                  Esc
                </kbd>
                <span>关闭</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
