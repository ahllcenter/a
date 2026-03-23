import { useState, useEffect, useCallback } from 'react';
import { Archive as ArchiveIcon, RefreshCw } from 'lucide-react';
import AppHeader from "@/components/citizen/AppHeader";
import AlertCard from "@/components/citizen/AlertCard";
import { getAllAlerts } from '@/lib/api';
import type { Alert } from '@/lib/alert-data';

const Archive = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArchive = useCallback(async () => {
    try {
      const res = await getAllAlerts();
      const all = res.data.alerts || [];
      // Show inactive alerts as archive
      setAlerts(all.filter((a: Alert) => a.is_active === 0 || a.is_active === false));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchArchive(); }, [fetchArchive]);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <AppHeader />
      <main className="container max-w-lg mx-auto px-4 py-5 space-y-4">
        <div className="flex items-center justify-between animate-fade-up">
          <h2 className="text-lg font-extrabold text-foreground flex items-center gap-2">
            <ArchiveIcon className="w-5 h-5 text-muted-foreground" />
            أرشيف التنبيهات
          </h2>
          <button onClick={fetchArchive} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="w-6 h-6 text-muted-foreground animate-spin" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-16 animate-fade-up">
            <ArchiveIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-muted-foreground text-sm">لا توجد تنبيهات مؤرشفة</p>
          </div>
        ) : (
          <div className="space-y-3 animate-fade-up stagger-1">
            <p className="text-[11px] text-muted-foreground">{alerts.length} تنبيه مؤرشف</p>
            {alerts.map((alert, i) => (
              <AlertCard key={alert.id} alert={alert} className={`animate-fade-up stagger-${Math.min(i+1, 5)} opacity-70`} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Archive;
