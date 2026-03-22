import { MapPin, Clock } from "lucide-react";
import { Alert, CATEGORIES, SEVERITY_LABELS } from "@/lib/alert-data";

interface AlertCardProps {
  alert: Alert;
  className?: string;
}

const AlertCard = ({ alert, className = "" }: AlertCardProps) => {
  const category = CATEGORIES[alert.category];
  const Icon = category.icon;
  const timeAgo = getTimeAgo(alert.timestamp);

  return (
    <article
      className={`alert-card border-r-4 bg-card ${className} severity-${alert.severity}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center severity-${alert.severity}`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold severity-${alert.severity}`}
            >
              {SEVERITY_LABELS[alert.severity]}
            </span>
            {alert.isActive && (
              <span className="inline-flex items-center gap-1 text-[11px] text-success font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                نشط
              </span>
            )}
          </div>
          <h3 className="text-sm font-bold text-card-foreground leading-relaxed mb-1.5 text-balance">
            {alert.title}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 text-pretty">
            {alert.description}
          </p>
          <div className="flex items-center gap-4 mt-2.5 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {alert.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};

function getTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  return `منذ ${days} يوم`;
}

export default AlertCard;
