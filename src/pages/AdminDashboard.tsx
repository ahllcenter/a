import { useState } from "react";
import {
  Bell, Users, Send, BarChart3, ChevronLeft,
  Plus, MapPin
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  CATEGORIES, SEVERITY_LABELS,
  AlertCategory, AlertSeverity, MOCK_ALERTS
} from "@/lib/alert-data";
import AlertCard from "@/components/citizen/AlertCard";

const STATS = [
  { label: "المستخدمون المسجلون", value: "12,847", icon: Users },
  { label: "التنبيهات المرسلة", value: "347", icon: Send },
  { label: "التنبيهات النشطة", value: "3", icon: Bell },
];

const AdminDashboard = () => {
  const [selectedCategory, setSelectedCategory] = useState<AlertCategory>("flood");
  const [selectedSeverity, setSelectedSeverity] = useState<AlertSeverity>("high");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const categoryEntries = Object.entries(CATEGORIES) as [AlertCategory, (typeof CATEGORIES)[AlertCategory]][];
  const severityEntries = Object.entries(SEVERITY_LABELS) as [AlertSeverity, string][];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Admin header */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-accent-foreground" />
            </div>
            <div className="leading-tight">
              <h1 className="text-sm font-bold">لوحة الإدارة</h1>
              <p className="text-[10px] opacity-70">منارة الأنبار العاجلة</p>
            </div>
          </div>
          <Link
            to="/"
            className="flex items-center gap-1 text-xs opacity-80 hover:opacity-100"
          >
            العودة للتطبيق
            <ChevronLeft className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 animate-fade-up">
          {STATS.map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-4 text-center">
              <Icon className="w-5 h-5 text-accent mx-auto mb-2" />
              <p className="text-lg font-extrabold text-foreground tabular-nums">{value}</p>
              <p className="text-[11px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Create alert form */}
        <section className="bg-card border border-border rounded-xl p-5 animate-fade-up stagger-1">
          <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-accent" />
            إرسال تنبيه جديد
          </h2>

          <div className="space-y-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2">
                نوع التنبيه
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {categoryEntries.map(([key, { label, icon: Icon }]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border text-[11px] font-medium transition-all active:scale-95 ${
                      selectedCategory === key
                        ? "border-accent bg-accent/10 text-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-accent/50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Severity */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2">
                مستوى الخطورة
              </label>
              <div className="flex gap-2 flex-wrap">
                {severityEntries.map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedSeverity(key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all active:scale-95 severity-${key} ${
                      selectedSeverity === key ? "ring-2 ring-offset-1 ring-current" : "opacity-60"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title & Description */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                عنوان التنبيه
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="أدخل عنوان التنبيه..."
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                تفاصيل التنبيه
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="أدخل تفاصيل التنبيه والإرشادات للمواطنين..."
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
              />
            </div>

            {/* Target area placeholder */}
            <div className="border border-dashed border-border rounded-xl p-6 text-center bg-muted/30">
              <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium text-muted-foreground">منطقة الاستهداف</p>
              <p className="text-xs text-muted-foreground mt-1">
                سيتم ربط خريطة تفاعلية لرسم مناطق الاستهداف (Geofencing)
              </p>
            </div>

            <button className="w-full bg-destructive text-destructive-foreground py-3 rounded-lg text-sm font-bold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              <Send className="w-4 h-4" />
              إرسال التنبيه فوراً
            </button>
          </div>
        </section>

        {/* Recent alerts */}
        <section className="animate-fade-up stagger-2">
          <h2 className="text-base font-bold text-foreground mb-3">آخر التنبيهات المرسلة</h2>
          <div className="space-y-3">
            {MOCK_ALERTS.slice(0, 3).map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
