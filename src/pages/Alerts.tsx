import { useState, useEffect, useCallback } from 'react';
import { Bell, RefreshCw, ShieldCheck, Filter } from 'lucide-react';
import AppHeader from "@/components/citizen/AppHeader";
import AlertCard from "@/components/citizen/AlertCard";
import { getAlerts } from '@/lib/api';
import { CATEGORIES, SEVERITY_LABELS } from '@/lib/alert-data';
import type { Alert, AlertCategory, AlertSeverity } from '@/lib/alert-data';

const Alerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const fetch_ = useCallback(async () => {
    try {
      const res = await getAlerts();
      setAlerts(res.data.alerts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch_();
    const id = setInterval(fetch_, 15_000);
    return () => clearInterval(id);
  }, [fetch_]);

  const filtered = alerts.filter(a => {
    if (filterCategory !== 'all' && a.category !== filterCategory) return false;
    if (filterSeverity !== 'all' && a.severity !== filterSeverity) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <AppHeader />
      <main className="container max-w-lg mx-auto px-4 py-5 space-y-4">
        <div className="flex items-center justify-between animate-fade-up">
          <h2 className="text-lg font-extrabold text-foreground flex items-center gap-2">
            <Bell className="w-5 h-5 text-destructive beacon-pulse" />
            التنبيهات النشطة
          </h2>
          <button onClick={fetch_} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-xl p-3 space-y-2 animate-fade-up stagger-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-bold">تصفية</span>
          </div>
          <div className="flex gap-2">
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              <option value="all">كل الأنواع</option>
              {Object.entries(CATEGORIES).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <select
              value={filterSeverity}
              onChange={e => setFilterSeverity(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              <option value="all">كل المستويات</option>
              {Object.entries(SEVERITY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="w-6 h-6 text-muted-foreground animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 animate-fade-up">
            <ShieldCheck className="w-12 h-12 text-success mx-auto mb-3" />
            <p className="text-sm font-bold text-foreground">لا توجد تنبيهات نشطة</p>
            <p className="text-xs text-muted-foreground mt-1">سيتم إعلامك فور صدور أي تنبيه جديد</p>
          </div>
        ) : (
          <div className="space-y-3 animate-fade-up stagger-2">
            <p className="text-[11px] text-muted-foreground">{filtered.length} تنبيه</p>
            {filtered.map((alert, i) => (
              <AlertCard key={alert.id} alert={alert} className={`animate-fade-up stagger-${Math.min(i + 1, 5)}`} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Alerts;
