"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CheckSquare,
  Users,
  Calendar,
  Settings,
  LayoutDashboard,
  MessageSquare,
  Camera,
  ClipboardCheck,
  PartyPopper,
  BarChart3,
  FolderKanban,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "ダッシュボード",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "やることリスト",
    href: "/todos",
    icon: CheckSquare,
  },
  {
    label: "女の子マスタ",
    href: "/girls",
    icon: Users,
  },
  {
    label: "出勤管理",
    href: "/attendance",
    icon: Calendar,
  },
  {
    label: "声かけリスト",
    href: "/contacts",
    icon: MessageSquare,
  },
  {
    label: "写メ日記",
    href: "/photo-diary",
    icon: Camera,
  },
  {
    label: "日次チェック",
    href: "/daily-check",
    icon: ClipboardCheck,
  },
  {
    label: "イベント",
    href: "/events",
    icon: PartyPopper,
  },
  {
    label: "シティヘブン",
    href: "/cityheaven",
    icon: BarChart3,
  },
  {
    label: "プロジェクト管理",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    label: "設定",
    href: "/settings",
    icon: Settings,
  },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-slate-900 text-white">
      {/* ロゴ */}
      <div className="flex h-16 items-center border-b border-slate-700 px-6">
        <h1 className="text-xl font-bold">管理システム</h1>
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-slate-800 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* フッター */}
      <div className="border-t border-slate-700 p-4">
        <p className="text-xs text-slate-400">© 2024 管理システム</p>
      </div>
    </div>
  );
}
