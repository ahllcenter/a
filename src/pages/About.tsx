import {
  Bell, Shield, MapPin, Users, Zap, Globe,
  ChevronLeft, Heart, Target, Radio
} from "lucide-react";
import { Link } from "react-router-dom";
import AppHeader from "@/components/citizen/AppHeader";

const FEATURES = [
  {
    icon: Bell,
    title: "تنبيهات فورية",
    desc: "إشعارات عاجلة لحظية تصل لجميع المواطنين في ثوانٍ معدودة",
    color: "text-amber-400",
  },
  {
    icon: MapPin,
    title: "استهداف جغرافي دقيق",
    desc: "إرسال تنبيهات مخصصة حسب الموقع الجغرافي أو المدينة",
    color: "text-emerald-400",
  },
  {
    icon: Shield,
    title: "11 نوع تنبيه",
    desc: "تغطية شاملة للطوارئ: أمنية، مناخية، خدمية، وصحية",
    color: "text-blue-400",
  },
  {
    icon: Radio,
    title: "بث مباشر",
    desc: "تحديث تلقائي كل 15 ثانية لمتابعة آخر المستجدات",
    color: "text-purple-400",
  },
  {
    icon: Globe,
    title: "تطبيق ويب تقدمي",
    desc: "يعمل على جميع الأجهزة بدون تثبيت من المتجر",
    color: "text-cyan-400",
  },
  {
    icon: Target,
    title: "5 مستويات خطورة",
    desc: "تصنيف واضح للتنبيهات حسب درجة الخطورة والأولوية",
    color: "text-red-400",
  },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background pb-20" dir="rtl">
      <AppHeader />

      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-8">
        {/* Hero */}
        <section className="text-center space-y-4">
          <div className="w-20 h-20 rounded-2xl bg-primary mx-auto flex items-center justify-center shadow-lg beacon-pulse">
            <Bell className="w-10 h-10 text-accent" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">منارة الأنبار العاجلة</h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-md mx-auto">
            منصة إنذار مبكر ذكية مصممة خصيصاً لمحافظة الأنبار، تهدف لحماية المواطنين
            من خلال إيصال التنبيهات العاجلة بأسرع وقت ممكن
          </p>
        </section>

        {/* Mission */}
        <section className="bg-card border border-border rounded-2xl p-6 space-y-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Heart className="w-5 h-5 text-destructive" />
            رسالتنا
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            نؤمن بأن كل مواطن في محافظة الأنبار يستحق الحصول على معلومات الطوارئ في الوقت المناسب.
            منارة الأنبار العاجلة هي نظام إنذار مبكر شامل يغطي 15 مدينة في المحافظة، ويوفر
            تنبيهات فورية للكوارث الطبيعية، الأحداث الأمنية، انقطاعات الخدمات الأساسية، والمزيد.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            تم تطوير هذا النظام ليكون سهل الاستخدام ومتاحاً للجميع عبر أي جهاز متصل بالإنترنت،
            دون الحاجة لتحميل تطبيقات من المتاجر. يمكن تثبيته مباشرة على الشاشة الرئيسية
            ليعمل كتطبيق كامل.
          </p>
        </section>

        {/* Features grid */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent" />
            مميزات المنصة
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-card border border-border rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">{title}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Coverage */}
        <section className="bg-card border border-border rounded-2xl p-6 space-y-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-accent" />
            نطاق التغطية
          </h2>
          <p className="text-sm text-muted-foreground">
            تغطي المنصة 15 مدينة ومنطقة في محافظة الأنبار:
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              'الرمادي', 'الفلوجة', 'هيت', 'حديثة', 'عنة', 'القائم',
              'الحبانية', 'الكرمة', 'الرطبة', 'راوة', 'عامرية الفلوجة',
              'الصقلاوية', 'الخالدية', 'البغدادي', 'كبيسة'
            ].map(city => (
              <span key={city} className="px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-bold border border-accent/20">
                {city}
              </span>
            ))}
          </div>
        </section>

        {/* Links */}
        <div className="flex gap-3">
          <Link
            to="/guide"
            className="flex-1 bg-accent text-accent-foreground py-3 rounded-xl text-sm font-bold text-center hover:opacity-90 transition-all"
          >
            دليل أنواع التنبيهات
          </Link>
          <Link
            to="/"
            className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-accent/50 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            الرئيسية
          </Link>
        </div>
      </main>
    </div>
  );
};

export default About;
