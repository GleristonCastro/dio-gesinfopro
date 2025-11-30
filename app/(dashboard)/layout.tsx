"use client";

import { useSession, signOut } from "@/lib/auth/client";
import type { Session } from "@/lib/auth/config";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Lottie from "lottie-react";
import logoAnimation from "@/public/animations/logo.json";
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
import type { LucideIcon } from "lucide-react";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { LayoutTransition } from "@/components/animations/layout-transition";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

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

  return (
    <DashboardShell session={session} navItems={navItems}>
      {children}
    </DashboardShell>
  );
}

type NavItem = {
  href: string;
  icon: LucideIcon;
  label: string;
};

function DashboardShell({
  children,
  session,
  navItems,
}: {
  children: React.ReactNode;
  session: Session;
  navItems: NavItem[];
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background transition-colors">
      {/* Skip to main content link - acessibilidade */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Pular para o conteúdo principal
      </a>

      {/* Sidebar Desktop */}
      <aside
        role="complementary"
        aria-label="Barra lateral de navegação"
        className="fixed left-0 top-0 z-40 h-screen w-64 bg-white dark:bg-linear-to-b dark:from-gray-900/90 dark:to-gray-950/80 backdrop-blur-xl border-r border-gray-200 dark:border-gray-800/50 shadow-xl hidden lg:block"
      >
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center gap-2 border-b border-gray-200 dark:border-gray-800/50 px-4 bg-gray-50 dark:bg-linear-to-r dark:from-blue-500/20 dark:to-purple-500/20">
            <Lottie
              animationData={logoAnimation}
              loop={true}
              style={{ width: 48, height: 48 }}
              aria-hidden="true"
            />
            <h1 className="text-xl font-bold bg-linear-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              GesFinPro
            </h1>
          </div>
          <nav
            role="navigation"
            aria-label="Menu principal"
            className="flex-1 space-y-1 p-4"
          >
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 group relative overflow-hidden",
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
                    className="h-5 w-5 transition-transform group-hover:scale-110"
                    aria-hidden="true"
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-gray-200 dark:border-gray-800/50 p-4 bg-gray-50 dark:bg-linear-to-t dark:from-gray-900/50">
            <div className="flex items-center gap-3 mb-3 p-2 rounded-lg bg-gray-100 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-600 text-white shadow-md font-semibold">
                {session.user?.name?.[0] || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
                  {session.user?.name}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {session.user?.email}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/70 backdrop-blur-sm hover:shadow-md transition-all"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 lg:hidden">
          <MobileMenu
            userName={session.user?.name}
            userEmail={session.user?.email}
          />
          <h1 className="text-xl font-bold flex-1">FinBot</h1>
        </header>
        <main id="main-content" tabIndex={-1} className="p-4 lg:p-8">
          <LayoutTransition>{children}</LayoutTransition>
        </main>
      </div>
    </div>
  );
}
