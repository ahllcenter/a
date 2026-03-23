import { useState, useEffect, useCallback } from 'react';
import {
  Shield, ShieldCheck, Bell, RefreshCw, LogOut, MapPin, Wifi, WifiOff,
  Download, ChevronLeft, Clock, AlertTriangle, Zap, Droplets, CloudRain,
  Settings, Eye, Volume2, VolumeX
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getAlerts, getAllAlerts } from '@/lib/api';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import AlertCard from '@/components/citizen/AlertCard';
import AppHeader from '@/components/citizen/AppHeader';
import type { Alert } from '@/lib/alert-data';
import { CATEGORIES } from '@/lib/alert-data';
import { Link } from 'react-router-dom';

const POLL_INTERVAL = 15_000; // 15 seconds for near real-time

const Home = () => {
  const { user, logout } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(navigator.onLine);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('anbar_sound') !== 'off');
  const [prevAlertCount, setPrevAlertCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'active' | 'all' | 'categories'>('active');

  useLocationTracking();

  // PWA install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = localStorage.getItem('anbar_install_dismissed');
      if (!dismissed) setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallBanner(false);
    }
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  const dismissInstall = () => {
    setShowInstallBanner(false);
    localStorage.setItem('anbar_install_dismissed', '1');
  };

  const fetchAlerts = useCallback(async () => {
    try {
      const [activeRes, allRes] = await Promise.all([getAlerts(), getAllAlerts()]);
      const newAlerts = activeRes.data.alerts || [];
      setAlerts(newAlerts);
      setRecentAlerts((allRes.data.alerts || []).slice(0, 20));
      setLastUpdate(new Date());
      // Play sound on new alert
      if (soundEnabled && newAlerts.length > prevAlertCount && prevAlertCount > 0) {
        try { new Audio('/notification.mp3').play().catch(() => {}); } catch {}
      }
      setPrevAlertCount(newAlerts.length);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setLoading(false);
    }
  }, [soundEnabled, prevAlertCount]);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('anbar_sound', next ? 'on' : 'off');
  };

  const activeAlerts = alerts.filter(a => a.is_active !== false);

  // Group alerts by category
  const alertsByCategory: Record<string, Alert[]> = {};
  recentAlerts.forEach(a => {
    const cat = a.category || 'other';
    if (!alertsByCategory[cat]) alertsByCategory[cat] = [];
    alertsByCategory[cat].push(a);
  });

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <AppHeader />

      <main className="container max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* PWA Install Banner */}
        {showInstallBanner && (
          <div className="bg-accent/10 border border-accent/30 rounded-xl px-4 py-3 flex items-center gap-3 animate-fade-up">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shrink-0">
              <Download className="w-5 h-5 text-accent-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">ثبّت التطبيق على هاتفك</p>
              <p className="text-[11px] text-muted-foreground">للحصول على تنبيهات فورية وتجربة أسرع</p>
            </div>
            <div className="flex gap-1.5">
              <button onClick={handleInstall} className="px-3 py-1.5 rounded-lg bg-accent text-accent-foreground text-xs font-bold hover:opacity-90 transition-opacity">
                تثبيت
              </button>
              <button onClick={dismissInstall} className="px-2 py-1.5 rounded-lg text-muted-foreground hover:text-foreground text-xs transition-colors">
                لاحقاً
              </button>
            </div>
          </div>
        )}

        {/* User info bar */}
        <div className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3 animate-fade-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{user?.name}</p>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {user?.city}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${
              online ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
            }`}>
              {online ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {online ? 'متصل' : 'غير متصل'}
            </div>
            <button onClick={toggleSound} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors" title={soundEnabled ? 'كتم الصوت' : 'تفعيل الصوت'}>
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
            <button onClick={logout} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors" title="تسجيل خروج">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick stats bar */}
        <div className="grid grid-cols-3 gap-2 animate-fade-up stagger-1">
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-lg font-extrabold text-foreground tabular-nums">{activeAlerts.length}</p>
            <p className="text-[10px] text-muted-foreground">تنبيهات نشطة</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-lg font-extrabold text-foreground tabular-nums">{recentAlerts.length}</p>
            <p className="text-[10px] text-muted-foreground">إجمالي التنبيهات</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-[11px] font-bold text-foreground">
              {lastUpdate ? lastUpdate.toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }) : '—'}
            </p>
            <p className="text-[10px] text-muted-foreground">آخر تحديث</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 bg-card border border-border rounded-xl p-1.5 animate-fade-up stagger-1">
          {[
            { key: 'active' as const, label: `نشطة (${activeAlerts.length})`, icon: Bell },
            { key: 'all' as const, label: 'الكل', icon: Clock },
            { key: 'categories' as const, label: 'الأنواع', icon: AlertTriangle },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.key
                  ? 'bg-accent text-accent-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content based on active tab */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="w-6 h-6 text-muted-foreground animate-spin" />
          </div>
        ) : activeTab === 'active' ? (
          activeAlerts.length === 0 ? (
            <div className="text-center py-12 animate-fade-up">
              <div className="w-20 h-20 rounded-full bg-success/10 mx-auto flex items-center justify-center mb-4">
                <ShieldCheck className="w-10 h-10 text-success" />
              </div>
              <h2 className="text-xl font-extrabold text-foreground mb-2">لا توجد تنبيهات حالياً</h2>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                الوضع آمن في منطقتك — سنُعلمك فور صدور أي تنبيه جديد
              </p>
              <div className="mt-1 text-[10px] text-muted-foreground/60">
                يتم التحديث تلقائياً كل 15 ثانية
              </div>
              <button
                onClick={fetchAlerts}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                تحديث الآن
              </button>
            </div>
          ) : (
            <section className="animate-fade-up space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Bell className="w-4 h-4 text-destructive beacon-pulse" />
                  تنبيهات نشطة
                </h2>
                <button onClick={fetchAlerts} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              {activeAlerts.map((alert, i) => (
                <AlertCard key={alert.id} alert={alert} className={`animate-fade-up stagger-${Math.min(i + 1, 5)}`} />
              ))}
            </section>
          )
        ) : activeTab === 'all' ? (
          <section className="animate-fade-up space-y-3">
            <h2 className="text-base font-bold text-foreground">سجل التنبيهات</h2>
            {recentAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">لا توجد تنبيهات مسجلة بعد</p>
            ) : (
              recentAlerts.map((alert, i) => (
                <AlertCard key={alert.id} alert={alert} className={`animate-fade-up stagger-${Math.min(i + 1, 5)}`} />
              ))
            )}
          </section>
        ) : (
          /* Categories view */
          <section className="animate-fade-up space-y-4">
            <h2 className="text-base font-bold text-foreground">التنبيهات حسب النوع</h2>
            {Object.keys(alertsByCategory).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">لا توجد تنبيهات مسجلة بعد</p>
            ) : (
              Object.entries(alertsByCategory).map(([cat, catAlerts]) => {
                const catInfo = CATEGORIES[cat as keyof typeof CATEGORIES];
                const Icon = catInfo?.icon || AlertTriangle;
                const label = catInfo?.label || cat;
                return (
                  <div key={cat} className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/30">
                      <Icon className="w-4 h-4 text-accent" />
                      <span className="text-sm font-bold text-foreground">{label}</span>
                      <span className="mr-auto text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{catAlerts.length}</span>
                    </div>
                    <div className="p-3 space-y-2">
                      {catAlerts.slice(0, 3).map(alert => (
                        <AlertCard key={alert.id} alert={alert} />
                      ))}
                      {catAlerts.length > 3 && (
                        <p className="text-[11px] text-muted-foreground text-center py-1">
                          +{catAlerts.length - 3} تنبيهات أخرى
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </section>
        )}

        {/* Admin link */}
        {user?.is_admin && (
          <Link
            to="/admin"
            className="flex items-center justify-center gap-2 bg-card border border-accent/30 text-accent rounded-xl px-4 py-3 text-sm font-bold hover:bg-accent/5 transition-colors animate-fade-up"
          >
            <Settings className="w-4 h-4" />
            لوحة الإدارة
          </Link>
        )}

        {/* Manual install link (for iOS) */}
        {!showInstallBanner && !window.matchMedia('(display-mode: standalone)').matches && (
          <Link
            to="/install"
            className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground hover:text-accent transition-colors py-2"
          >
            <Download className="w-3 h-3" />
            تثبيت التطبيق على الهاتف
          </Link>
        )}
      </main>

      <footer className="border-t border-border py-4 mt-4">
        <div className="container max-w-lg mx-auto px-4 text-center">
          <p className="text-[10px] text-muted-foreground">
            منارة الأنبار العاجلة © {new Date().getFullYear()} — نظام الإنذار المبكر لمحافظة الأنبار
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
