import { AlertTriangle } from "lucide-react";
import { MOCK_ALERTS } from "@/lib/alert-data";

const ActiveAlertsBanner = () => {
  const activeCount = MOCK_ALERTS.filter((a) => a.isActive).length;

  if (activeCount === 0) return null;

  return (
    <div className="bg-severity-high/10 border border-severity-high/30 rounded-lg p-3 flex items-center gap-3 animate-fade-up">
      <div className="w-9 h-9 rounded-full bg-severity-high/20 flex items-center justify-center shrink-0 beacon-pulse">
        <AlertTriangle className="w-5 h-5 text-severity-high" />
      </div>
      <div>
        <p className="text-sm font-bold text-foreground">
          {activeCount} تنبيه نشط حالياً
        </p>
        <p className="text-xs text-muted-foreground">
          يرجى مراجعة التنبيهات واتخاذ الاحتياطات اللازمة
        </p>
      </div>
    </div>
  );
};

export default ActiveAlertsBanner;
