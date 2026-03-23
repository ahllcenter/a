import { Home, Bell, Archive, MessageSquare, Phone } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { path: "/", label: "الرئيسية", icon: Home },
  { path: "/alerts", label: "التنبيهات", icon: Bell },
  { path: "/emergency", label: "طوارئ", icon: Phone },
  { path: "/contact", label: "تواصل", icon: MessageSquare },
  { path: "/archive", label: "الأرشيف", icon: Archive },
];

const BottomNav = () => {
  const location = useLocation();

  // Don't show on register, admin, or when in standalone PWA (already installed)
  if (location.pathname === '/register' || location.pathname.startsWith('/admin')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border md:hidden safe-area-bottom" dir="rtl">
      <div className="flex items-center justify-around h-14 px-2">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all ${
                active
                  ? 'text-accent'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'scale-110' : ''} transition-transform`} />
              <span className="text-[10px] font-bold">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
