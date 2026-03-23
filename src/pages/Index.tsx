import AppHeader from "@/components/citizen/AppHeader";
import ActiveAlertsBanner from "@/components/citizen/ActiveAlertsBanner";
import AlertCard from "@/components/citizen/AlertCard";
import CategoryGrid from "@/components/citizen/CategoryGrid";
import { MOCK_ALERTS } from "@/lib/alert-data";
import { Bell, ChevronLeft, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const activeAlerts = MOCK_ALERTS.filter((a) => a.isActive);
  const recentAlerts = MOCK_ALERTS.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container max-w-lg mx-auto px-4 py-5 space-y-6">
        {/* Hero section */}
        <section className="text-center py-4 animate-fade-up">
          <div className="w-16 h-16 rounded-2xl bg-primary mx-auto flex items-center justify-center mb-3 shadow-lg">
            <Bell className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-xl font-extrabold text-foreground text-balance leading-snug">
            نظام الإنذار المبكر
            <br />
            <span className="text-accent">لمحافظة الأنبار</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto text-pretty">
            تلقَّ تنبيهات فورية عن حالات الطوارئ في منطقتك مباشرة على هاتفك
          </p>
        </section>

        <ActiveAlertsBanner />

        {/* Recent alerts */}
        <section className="animate-fade-up stagger-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-foreground">آخر التنبيهات</h2>
            <Link
              to="/alerts"
              className="flex items-center gap-1 text-xs font-medium text-accent hover:underline"
            >
              عرض الكل
              <ChevronLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentAlerts.map((alert, i) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                className={`animate-fade-up stagger-${i + 1}`}
              />
            ))}
          </div>
        </section>

        <CategoryGrid />

        {/* Emergency Numbers CTA */}
        <section className="bg-red-600 rounded-xl p-5 text-white text-center animate-fade-up stagger-3">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Phone className="w-5 h-5" />
            <h3 className="text-sm font-bold">أرقام الطوارئ</h3>
          </div>
          <p className="text-xs opacity-90 mb-3">
            جميع أرقام الطوارئ والخدمات في محافظة الأنبار — اتصل بنقرة واحدة
          </p>
          <Link
            to="/emergency"
            className="inline-flex items-center gap-2 bg-white text-red-600 px-5 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 active:scale-95 transition-all"
          >
            عرض الأرقام
          </Link>
        </section>

        {/* Install CTA */}
        <section className="bg-primary rounded-xl p-5 text-primary-foreground text-center animate-fade-up stagger-4">
          <h3 className="text-sm font-bold mb-1">ثبّت التطبيق على هاتفك</h3>
          <p className="text-xs opacity-80 mb-3">
            احصل على إشعارات فورية حتى عند إغلاق المتصفح
          </p>
          <Link
            to="/install"
            className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-5 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 active:scale-95 transition-all"
          >
            تثبيت التطبيق
          </Link>
        </section>
      </main>

      <footer className="border-t border-border py-4 mt-8">
        <div className="container max-w-lg mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">
            منارة الأنبار العاجلة © {new Date().getFullYear()} — محافظة الأنبار
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
