"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Lottie from "lottie-react";
import logoAnimation from "@/public/animations/logo.json";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  MessageSquare,
  Target,
  FileText,
  Settings,
  LogOut,
  Menu,
  ArrowLeftRight,
} from "lucide-react";
import { signOut } from "@/lib/auth/client";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  userName?: string;
  userEmail?: string;
}

export function MobileMenu({ userName, userEmail }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/chat", icon: MessageSquare, label: "Chat" },
    {
      href: "/dashboard/transactions",
      icon: ArrowLeftRight,
      label: "Transações",
    },
    { href: "/dashboard/goals", icon: Target, label: "Metas" },
    { href: "/dashboard/reports", icon: FileText, label: "Relatórios" },
    { href: "/dashboard/settings", icon: Settings, label: "Configurações" },
  ];

  const handleLinkClick = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Abrir menu de navegação"
          className="min-h-11 min-w-11"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[280px] flex flex-col p-0 bg-white dark:bg-linear-to-b dark:from-gray-900/95 dark:to-gray-950/90 backdrop-blur-xl border-r border-gray-200 dark:border-gray-800/50"
      >
        <SheetHeader className="border-b border-gray-200 dark:border-gray-800/50 px-6 py-4 bg-gray-50 dark:bg-linear-to-r dark:from-blue-500/20 dark:to-purple-500/20">
          <div className="flex items-center gap-2">
            <Lottie
              animationData={logoAnimation}
              loop={true}
              style={{ width: 28, height: 28 }}
              aria-hidden="true"
            />
            <SheetTitle className="text-xl font-bold bg-linear-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              GesFinPro
            </SheetTitle>
          </div>
        </SheetHeader>

        <nav
          role="navigation"
          aria-label="Menu principal"
          className="flex-1 space-y-1 p-4 overflow-y-auto"
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 min-h-11 group relative overflow-hidden",
                  isActive
                    ? "bg-linear-to-r from-blue-500 to-purple-600 text-white shadow-md"
                    : "text-gray-700 dark:text-gray-300"
                )}
                style={
                  !isActive
                    ? {
                        background: "transparent",
                      }
                    : {
                        color: "white",
                      }
                }
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background =
                      "linear-gradient(to right, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))";
                    e.currentTarget.style.color = "rgb(37, 99, 235)";
                    e.currentTarget.style.boxShadow =
                      "0 1px 2px 0 rgb(0 0 0 / 0.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "";
                    e.currentTarget.style.boxShadow = "";
                  }
                }}
              >
                <item.icon
                  className="h-5 w-5 shrink-0 transition-transform group-hover:scale-110"
                  aria-hidden="true"
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-200 dark:border-gray-800/50 p-4 space-y-3 bg-gray-50 dark:bg-linear-to-t dark:from-gray-900/50">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-100 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-600 text-white shadow-md font-semibold">
              {userName?.[0] || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
                {userName || "Usuário"}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {userEmail || ""}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full min-h-11 bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/70 backdrop-blur-sm hover:shadow-md transition-all"
            onClick={() => {
              setOpen(false);
              signOut();
            }}
          >
            <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
            Sair
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
