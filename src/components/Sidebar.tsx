"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
// import { ThemeToggle } from "@/components/ThemeToggle";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  GitPullRequestDraft,
  Calendar,
  Settings,
  Search,
  Menu,
  X,
  LogOut,
  User,
  Crown,
  Shield,
  Briefcase,
  Headphones,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, permission: "dashboard" },
  { name: "Leads", href: "/leads", icon: Users, permission: "leads" },
  { name: "Add Lead", href: "/add", icon: UserPlus, permission: "add-leads" },
  { name: "Pipeline", href: "/pipeline", icon: GitPullRequestDraft, permission: "pipeline" },
  { name: "Follow-ups", href: "/followup", icon: Calendar, permission: "followup" },
  { name: "Search", href: "/search", icon: Search, permission: "search" },
  { name: "Settings", href: "/settings", icon: Settings, permission: "settings" },
];

const ROLE_ICONS = {
  admin: Crown,
  'sub-admin': Shield,
  manager: Briefcase,
  staff: User,
  'customer-support': Headphones,
};

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, hasPermission, logout } = useUser();

  // Filter navigation items based on user permissions
  const filteredNavigation = navigation.filter(item => 
    hasPermission([item.permission])
  );

  const getRoleIcon = () => {
    if (!user) return User;
    return ROLE_ICONS[user.role] || User;
  };

  const getRoleColor = () => {
    if (!user) return 'text-slate-500';
    switch (user.role) {
      case 'admin': return 'text-red-600';
      case 'sub-admin': return 'text-orange-600';
      case 'manager': return 'text-blue-600';
      case 'staff': return 'text-green-600';
      case 'customer-support': return 'text-purple-600';
      default: return 'text-slate-500';
    }
  };

  return (
    <div>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-3 rounded-xl bg-white/90 backdrop-blur-sm border border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-blue-50"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5 text-slate-700" />
          ) : (
            <Menu className="h-5 w-5 text-slate-700" />
          )}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Desktop/Tablet Sidebar - Always visible on md+ */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:bg-white md:border-r md:border-blue-200/30 md:shadow-lg md:z-30">
        <div className="flex h-16 shrink-0 items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-base">L</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                LMS v3
              </h1>
              <p className="text-xs text-slate-500 font-medium">Lead Management</p>
            </div>
          </div>
        </div>
        
        <nav className="flex flex-1 flex-col px-6 py-4">
          <ul role="list" className="flex flex-1 flex-col gap-y-1">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "group flex gap-x-3 rounded-xl p-3 text-sm font-semibold leading-6 transition-all duration-300",
                      isActive
                        ? "bg-blue-600 text-white shadow-lg"
                        : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 shrink-0",
                        isActive ? "text-white" : "text-slate-500 group-hover:text-blue-600"
                      )}
                    />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
          
          <div className="mt-auto pt-6 border-t border-slate-200/50">
            {user && (
              <div className="mb-4 p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center bg-white shadow-sm", getRoleColor())}>
                    {(() => {
                      const RoleIcon = getRoleIcon();
                      return <RoleIcon className="w-4 h-4" />;
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{user.username}</p>
                    <p className="text-xs text-slate-500 capitalize">{user.role.replace('-', ' ')}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="w-full mt-2 text-xs text-slate-600 hover:text-red-600"
                >
                  <LogOut className="w-3 h-3 mr-2" />
                  Logout
                </Button>
              </div>
            )}
            <div className="text-xs text-slate-500 text-center font-medium">
              <div className="flex items-center justify-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>System Active</span>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Sidebar - Slide in overlay */}
      <div className={cn(
        "md:hidden fixed inset-y-0 left-0 w-80 bg-white border-r border-blue-200/30 shadow-xl z-50 transition-transform duration-300",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 shrink-0 items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-base">L</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                LMS v3
              </h1>
              <p className="text-xs text-slate-500 font-medium">Lead Management</p>
            </div>
          </div>
        </div>
        
        <nav className="flex flex-1 flex-col px-6 py-4">
          <ul role="list" className="flex flex-1 flex-col gap-y-1">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "group flex gap-x-3 rounded-xl p-3 text-sm font-semibold leading-6 transition-all duration-300",
                      isActive
                        ? "bg-blue-600 text-white shadow-lg"
                        : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 shrink-0",
                        isActive ? "text-white" : "text-slate-500 group-hover:text-blue-600"
                      )}
                    />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
          
          <div className="mt-auto pt-6 border-t border-slate-200/50">
            {user && (
              <div className="mb-4 p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center bg-white shadow-sm", getRoleColor())}>
                    {(() => {
                      const RoleIcon = getRoleIcon();
                      return <RoleIcon className="w-4 h-4" />;
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{user.username}</p>
                    <p className="text-xs text-slate-500 capitalize">{user.role.replace('-', ' ')}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="w-full mt-2 text-xs text-slate-600 hover:text-red-600"
                >
                  <LogOut className="w-3 h-3 mr-2" />
                  Logout
                </Button>
              </div>
            )}
            <div className="text-xs text-slate-500 text-center font-medium">
              <div className="flex items-center justify-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>System Active</span>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}
