import { useState } from "react";
import { Image, Moon } from "lucide-react";

const navItems = [
  { key: "task", label: "任务", iconSrc: "/icon_task.svg" },
  { key: "team", label: "协作", iconSrc: "/icon_team.svg" },
  { key: "inspiration", label: "灵感", active: true, iconSrc: "/icon_inspiration.svg" },
];

export function Sidebar() {
  const [active, setActive] = useState("inspiration");

  return (
    <aside className="flex flex-col items-center w-[56px] h-full bg-[#f5f5f5] border-r border-gray-200 py-3 shrink-0">
      {/* 顶部 Logo（40x40） */}
      <div className="mb-4">
        <img src="/icon_40.svg" width="40" height="40" className="block" alt="logo" />
      </div>

      {/* 导航项 —— 44x44，圆角 6px，激活态背景 rgba(136,136,136,0.10)，垂直居中 */}
      <nav className="flex flex-col items-center justify-center gap-1.5 flex-1">
        {navItems.map((item) => {
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setActive(item.key)}
              className={
                "flex flex-col items-center justify-center w-11 h-11 gap-0.5 rounded-[6px] transition-colors " +
                (isActive
                  ? "bg-[rgba(136,136,136,0.10)] text-gray-900"
                  : "text-gray-400 hover:bg-[rgba(136,136,136,0.08)] hover:text-gray-700")
              }
              title={item.label}
            >
              <img src={item.iconSrc} width="16" height="16" alt={item.label} />
              <span className="text-[10px] leading-none font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* 底部 —— 图片/月亮/头像 */}
      <div className="flex flex-col items-center gap-2 pt-2">
        {/* 图片按钮 */}
        <button className="w-9 h-9 rounded-[6px] text-gray-400 hover:bg-[rgba(136,136,136,0.10)] hover:text-gray-700 flex items-center justify-center transition-colors">
          <Image size={16} strokeWidth={1.6} />
        </button>

        {/* 月亮按钮 */}
        <button className="w-9 h-9 rounded-[6px] text-gray-400 hover:bg-[rgba(136,136,136,0.10)] hover:text-gray-700 flex items-center justify-center transition-colors">
          <Moon size={16} strokeWidth={1.6} />
        </button>

        {/* 头像 (32x32 章鱼哥) */}
        <button className="mt-1">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="avatar-grad" x1="0" y1="0" x2="0" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#7dd3fc" />
                <stop offset="1" stopColor="#bae6fd" />
              </linearGradient>
            </defs>
            <rect width="32" height="32" rx="16" fill="url(#avatar-grad)" />
            <ellipse cx="16" cy="14" rx="7" ry="6" fill="#1e3a8a" opacity="0.15" />
            <circle cx="14" cy="13" r="1.4" fill="#1e293b" />
            <circle cx="18" cy="13" r="1.4" fill="#1e293b" />
            <path d="M14 18 Q16 19.5 18 18" stroke="#1e293b" strokeWidth="1" strokeLinecap="round" fill="none" />
            <path d="M10 20 Q10 25 11 26" stroke="#1e3a8a" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.3" />
            <path d="M16 21 Q16 26 16 27" stroke="#1e3a8a" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.3" />
            <path d="M22 20 Q22 25 21 26" stroke="#1e3a8a" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.3" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
