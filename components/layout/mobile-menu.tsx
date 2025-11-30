"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
      <SheetContent side="left" className="w-[280px] flex flex-col p-0">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="text-xl font-bold">FinBot</SheetTitle>
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
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors min-h-11",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              {userName?.[0] || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {userName || "Usuário"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {userEmail || ""}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full min-h-11"
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
