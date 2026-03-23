import AppHeader from "@/components/citizen/AppHeader";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, ChevronLeft, Phone, Shield, MapPin, Zap, Radio, Globe, Target, Users, ArrowLeft, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";

const FEATURES = [
  { icon: Bell, title: "تنبيهات فورية", desc: "إشعارات عاجلة لحظية تصل لجميع المواطنين في ثوانٍ", color: "text-amber-400", bg: "bg-amber-500/10" },
  { icon: MapPin, title: "استهداف جغرافي", desc: "تنبيهات مخصصة حسب موقعك أو مدينتك", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { icon: Shield, title: "11 نوع تنبيه", desc: "تغطية شاملة: أمنية، مناخية، خدمية، صحية", color: "text-blue-400", bg: "bg-blue-500/10" },
  { icon: Radio, title: "بث مباشر", desc: "تحديث تلقائي كل 15 ثانية لآخر المستجدات", color: "text-purple-400", bg: "bg-purple-500/10" },
  { icon: Globe, title: "تطبيق ويب تقدمي", desc: "يعمل على جميع الأجهزة بدون تحميل من المتجر", color: "text-cyan-400", bg: "bg-cyan-500/10" },
  { icon: Target, title: "5 مستويات خطورة", desc: "تصنيف واضح حسب درجة الخطورة والأولوية", color: "text-red-400", bg: "bg-red-500/10" },
];

const CITIES = [
  'الرمادي', 'الفلوجة', 'هيت', 'حديثة', 'عنة', 'القائم',
  'الحبانية', 'الكرمة', 'الرطبة', 'راوة', 'عامرية الفلوجة',
  'الصقلاوية', 'الخالدية', 'البغدادي', 'كبيسة'
];

const Index = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <AppHeader />

      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-8">

        {/* Hero */}
        <section className="text-center py-8 space-y-5 animate-fade-up">
          <div className="w-24 h-24 rounded-3xl bg-primary mx-auto flex items-center justify-center shadow-2xl beacon-pulse">
            <Bell className="w-12 h-12 text-accent" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-foreground leading-tight">
              منارة الأنبار العاجلة
            </h1>
            <p className="text-sm text-accent font-bold tracking-wide">Anbar Urgent Beacon</p>
          </div>
          <p className="text-base text-muted-foreground leading-relaxed max-w-md mx-auto">
            منصة إنذار مبكر ذكية لحماية مواطني محافظة الأنبار — تنبيهات فورية عن الطوارئ والكوارث مباشرة على هاتفك
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            {isAuthenticated ? (
              <Link
                to="/home"
                className="inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground px-8 py-3.5 rounded-xl text-sm font-bold hover:opacity-90 active:scale-[0.98] transition-all shadow-lg"
              >
                <LayoutDashboard className="w-4 h-4" />
                لوحة التنبيهات
              </Link>
            ) : (
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground px-8 py-3.5 rounded-xl text-sm font-bold hover:opacity-90 active:scale-[0.98] transition-all shadow-lg"
              >
                <Users className="w-4 h-4" />
                سجّل الآن — مجاناً
              </Link>
            )}
            <Link
              to="/emergency"
              className="inline-flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3.5 rounded-xl text-sm font-bold hover:bg-red-700 active:scale-[0.98] transition-all"
            >
              <Phone className="w-4 h-4" />
              أرقام الطوارئ
            </Link>
          </div>
        </section>

        {/* What is this platform */}
        <section className="bg-card border border-border rounded-2xl p-6 space-y-3 animate-fade-up stagger-1">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent" />
            ما هي منارة الأنبار؟
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            نظام إنذار مبكر شامل مصمم خصيصاً لمحافظة الأنبار. يهدف لحماية المواطنين عبر إيصال
            تنبيهات فورية عن حالات الطوارئ: الغارات الجوية، الفيضانات، انقطاع الخدمات، الأحداث
            الأمنية، والمزيد.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            يعمل كتطبيق ويب تقدمي (PWA) — لا يحتاج تحميل من المتجر. يمكن تثبيته مباشرة
            على شاشة هاتفك ليعمل كتطبيق كامل مع إشعارات فورية.
          </p>
        </section>

        {/* Features */}
        <section className="space-y-4 animate-fade-up stagger-2">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent" />
            مميزات المنصة
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className={`${bg} border border-border rounded-xl p-4 space-y-2`}>
                <div className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${color}`} />
                  <h3 className="text-xs font-bold text-foreground">{title}</h3>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Coverage */}
        <section className="bg-card border border-border rounded-2xl p-6 space-y-3 animate-fade-up stagger-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <MapPin className="w-5 h-5 text-accent" />
            نطاق التغطية — 15 مدينة
          </h2>
          <div className="flex flex-wrap gap-2">
            {CITIES.map(city => (
              <span key={city} className="px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-bold border border-accent/20">
                {city}
              </span>
            ))}
          </div>
        </section>

        {/* Emergency Numbers Quick Access */}
        <a
          href="tel:911"
          className="block bg-red-600 hover:bg-red-700 active:scale-[0.98] transition-all rounded-2xl p-5 text-center shadow-lg animate-fade-up stagger-4"
        >
          <div className="flex items-center justify-center gap-3">
            <Phone className="w-7 h-7 text-white animate-pulse" />
            <div>
              <div className="text-3xl font-black text-white tracking-wider">911</div>
              <div className="text-xs text-red-100 font-medium mt-0.5">الدفاع المدني — اتصل في حالة الطوارئ</div>
            </div>
            <Phone className="w-7 h-7 text-white animate-pulse" />
          </div>
        </a>

        {/* CTA */}
        <section className="bg-primary rounded-2xl p-6 text-primary-foreground text-center space-y-3 animate-fade-up stagger-5">
          <h3 className="text-base font-bold">ابدأ الآن واحمِ عائلتك</h3>
          <p className="text-xs opacity-80 max-w-sm mx-auto">
            سجّل مجاناً لتلقي تنبيهات فورية عن حالات الطوارئ في منطقتك. التسجيل يستغرق أقل من دقيقة.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-1">
            {isAuthenticated ? (
              <Link
                to="/home"
                className="inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded-xl text-sm font-bold hover:opacity-90 active:scale-95 transition-all"
              >
                <LayoutDashboard className="w-4 h-4" />
                لوحة التنبيهات
              </Link>
            ) : (
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded-xl text-sm font-bold hover:opacity-90 active:scale-95 transition-all"
              >
                إنشاء حساب مجاني
              </Link>
            )}
            <Link
              to="/install"
              className="inline-flex items-center justify-center gap-2 bg-primary-foreground/10 text-primary-foreground px-6 py-3 rounded-xl text-sm font-bold hover:bg-primary-foreground/20 transition-all"
            >
              تثبيت التطبيق
            </Link>
          </div>
        </section>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-3 animate-fade-up stagger-5">
          <Link to="/emergency" className="bg-card border border-border rounded-xl p-4 text-center hover:border-red-500/40 transition-colors">
            <Phone className="w-6 h-6 text-red-500 mx-auto mb-2" />
            <span className="text-xs font-bold text-foreground">أرقام الطوارئ</span>
          </Link>
          <Link to="/guide" className="bg-card border border-border rounded-xl p-4 text-center hover:border-accent/40 transition-colors">
            <Shield className="w-6 h-6 text-accent mx-auto mb-2" />
            <span className="text-xs font-bold text-foreground">دليل التنبيهات</span>
          </Link>
          <Link to="/about" className="bg-card border border-border rounded-xl p-4 text-center hover:border-blue-500/40 transition-colors">
            <Globe className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <span className="text-xs font-bold text-foreground">عن المنصة</span>
          </Link>
          <Link to="/install" className="bg-card border border-border rounded-xl p-4 text-center hover:border-emerald-500/40 transition-colors">
            <Target className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <span className="text-xs font-bold text-foreground">تثبيت التطبيق</span>
          </Link>
        </div>
      </main>

      <footer className="border-t border-border py-6 mt-4">
        <div className="container max-w-2xl mx-auto px-4 text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            منارة الأنبار العاجلة © {new Date().getFullYear()} — نظام الإنذار المبكر لمحافظة الأنبار
          </p>
          <p className="text-[10px] text-muted-foreground/60">
            Anbar Urgent Beacon — Early Warning System
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
