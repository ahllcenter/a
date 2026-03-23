import { Bell, Menu, X, Home, AlertTriangle, Archive, Download, Settings, Info, BookOpen, MessageSquare, Phone } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const AppHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const NAV_ITEMS = [
    { label: "الرئيسية", path: "/home", icon: Home },
    { label: "التنبيهات النشطة", path: "/alerts", icon: AlertTriangle },
    { label: "أرقام الطوارئ", path: "/emergency", icon: Phone },
    { label: "تواصل وبلاغات", path: "/contact", icon: MessageSquare },
    { label: "الأرشيف", path: "/archive", icon: Archive },
    { label: "تثبيت التطبيق", path: "/install", icon: Download },
    { label: "عن منارة الأنبار", path: "/about", icon: Info },
    { label: "دليل التنبيهات", path: "/guide", icon: BookOpen },
    ...(user?.is_admin ? [{ label: "لوحة الإدارة", path: "/admin", icon: Settings }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
      <div className="container flex items-center justify-between h-14 px-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center beacon-pulse">
            <Bell className="w-4 h-4 text-accent-foreground" />
          </div>
          <div className="leading-tight">
            <h1 className="text-sm font-bold tracking-tight">منارة الأنبار العاجلة</h1>
            <p className="text-[10px] opacity-70">Anbar Urgent Beacon</p>
          </div>
        </Link>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded-md hover:bg-primary/80 active:scale-95 transition-transform md:hidden"
          aria-label="القائمة"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-primary/80"
              }`}
            >
              <item.icon className="w-3.5 h-3.5" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {menuOpen && (
        <nav className="md:hidden border-t border-primary/30 animate-fade-up">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-primary/80"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
};

export default AppHeader;
