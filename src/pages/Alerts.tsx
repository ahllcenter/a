import AppHeader from "@/components/citizen/AppHeader";
import AlertCard from "@/components/citizen/AlertCard";
import { MOCK_ALERTS } from "@/lib/alert-data";

const Alerts = () => {
  const activeAlerts = MOCK_ALERTS.filter((a) => a.isActive);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container max-w-lg mx-auto px-4 py-5">
        <h2 className="text-lg font-extrabold text-foreground mb-4 animate-fade-up">
          التنبيهات النشطة ({activeAlerts.length})
        </h2>
        <div className="space-y-3">
          {activeAlerts.length === 0 ? (
            <div className="text-center py-16 animate-fade-up">
              <p className="text-muted-foreground text-sm">لا توجد تنبيهات نشطة حالياً</p>
              <p className="text-xs text-muted-foreground mt-1">سيتم إعلامك فور صدور أي تنبيه جديد</p>
            </div>
          ) : (
            activeAlerts.map((alert, i) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                className={`animate-fade-up stagger-${i + 1}`}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Alerts;
