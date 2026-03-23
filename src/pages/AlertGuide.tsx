import {
  Plane, Droplets, Zap, Flame, ShoppingCart, CloudRain,
  Bug, PawPrint, ShieldAlert, Construction, Calendar,
  BookOpen, ChevronLeft, Megaphone, Building2, Globe,
  AlertTriangle
} from "lucide-react";
import { Link } from "react-router-dom";
import AppHeader from "@/components/citizen/AppHeader";

const CATEGORY_DETAILS = [
  {
    key: "airstrike",
    icon: Plane,
    label: "غارة جوية وشيكة",
    desc: "تنبيه بغارة جوية قادمة أو عمليات قصف. يتطلب التوجه فوراً إلى أقرب ملجأ أو مكان آمن بعيداً عن النوافذ والمباني العالية.",
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
  },
  {
    key: "water",
    icon: Droplets,
    label: "انقطاع المياه",
    desc: "إشعار بانقطاع مياه الشرب عن مناطق محددة بسبب صيانة أو أعطال. يُنصح بتخزين كمية كافية من المياه قبل موعد الانقطاع.",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
  },
  {
    key: "electricity",
    icon: Zap,
    label: "انقطاع الكهرباء",
    desc: "تنبيه بانقطاع التيار الكهربائي عن أحياء أو مناطق. يتضمن توقيت الانقطاع المتوقع ومعلومات عن فرق الصيانة.",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/20",
  },
  {
    key: "gas",
    icon: Flame,
    label: "انقطاع الغاز",
    desc: "إشعار بانقطاع الغاز الطبيعي أو تأخر توزيع أسطوانات الغاز. يشمل معلومات عن البدائل المتاحة ومواعيد التوزيع.",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    border: "border-orange-400/20",
  },
  {
    key: "supplies",
    icon: ShoppingCart,
    label: "شراء مؤن طوارئ",
    desc: "تنبيه بضرورة تخزين المؤن والمواد الأساسية استعداداً لظروف طارئة قادمة. يتضمن قائمة بالمواد الموصى بتوفيرها.",
    color: "text-green-400",
    bg: "bg-green-400/10",
    border: "border-green-400/20",
  },
  {
    key: "flood",
    icon: CloudRain,
    label: "أمطار غزيرة وفيضانات",
    desc: "تحذير من أمطار غزيرة أو فيضانات متوقعة. يُنصح بالابتعاد عن المناطق المنخفضة والأودية وتجنب القيادة.",
    color: "text-sky-400",
    bg: "bg-sky-400/10",
    border: "border-sky-400/20",
  },
  {
    key: "outbreak",
    icon: Bug,
    label: "تفشي وبائي",
    desc: "تنبيه بانتشار وباء أو مرض معدٍ. يتضمن إرشادات الوقاية وأماكن الفحص والعلاج المتاحة.",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    border: "border-purple-400/20",
  },
  {
    key: "animals",
    icon: PawPrint,
    label: "حيوانات مفترسة",
    desc: "تحذير من رصد حيوانات مفترسة أو خطرة في مناطق سكنية. يتضمن إرشادات السلامة وأرقام الطوارئ.",
    color: "text-amber-600",
    bg: "bg-amber-600/10",
    border: "border-amber-600/20",
  },
  {
    key: "security",
    icon: ShieldAlert,
    label: "حادث أمني",
    desc: "تنبيه بحادث أمني يتطلب الحذر. قد يشمل عمليات أمنية أو حوادث تستوجب تجنب منطقة معينة.",
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/20",
  },
  {
    key: "roads",
    icon: Construction,
    label: "إغلاق طرق",
    desc: "إشعار بإغلاق طرق رئيسية أو فرعية بسبب أعمال صيانة أو حوادث. يتضمن الطرق البديلة المقترحة.",
    color: "text-gray-400",
    bg: "bg-gray-400/10",
    border: "border-gray-400/20",
  },
  {
    key: "holiday",
    icon: Calendar,
    label: "عطلة رسمية",
    desc: "إعلان عن عطل رسمية أو تعليق دوام. يشمل تفاصيل المناسبة ومواعيد استئناف الدوام الرسمي.",
    color: "text-teal-400",
    bg: "bg-teal-400/10",
    border: "border-teal-400/20",
  },
];

const SEVERITY_DETAILS = [
  {
    key: "critical",
    label: "حرج",
    desc: "خطر فوري يهدد الحياة — يتطلب إجراء فوري",
    color: "bg-red-600 text-white",
  },
  {
    key: "high",
    label: "عالي",
    desc: "خطر كبير — تصرف بسرعة واتبع التعليمات",
    color: "bg-orange-500 text-white",
  },
  {
    key: "medium",
    label: "متوسط",
    desc: "تنبيه مهم — كن مستعداً واتخذ الاحتياطات",
    color: "bg-yellow-500 text-black",
  },
  {
    key: "low",
    label: "منخفض",
    desc: "معلومات تحذيرية — ابقَ على اطلاع",
    color: "bg-blue-500 text-white",
  },
  {
    key: "info",
    label: "معلومات",
    desc: "إعلان عام أو معلومة — لا يتطلب إجراء",
    color: "bg-gray-500 text-white",
  },
];

const TARGET_TYPES = [
  {
    icon: Megaphone,
    label: "بث عام (للكل)",
    desc: "يصل التنبيه لجميع المستخدمين المسجلين في المنصة بغض النظر عن موقعهم أو مدينتهم.",
  },
  {
    icon: Building2,
    label: "استهداف مدينة",
    desc: "يصل التنبيه فقط للمستخدمين المسجلين في المدن المحددة. يمكن اختيار مدينة واحدة أو عدة مدن.",
  },
  {
    icon: Globe,
    label: "استهداف جغرافي",
    desc: "يصل التنبيه للمستخدمين ضمن نطاق جغرافي محدد على الخريطة (دائرة بنصف قطر معين بالكيلومتر).",
  },
];

const AlertGuide = () => {
  return (
    <div className="min-h-screen bg-background pb-20" dir="rtl">
      <AppHeader />

      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-8">
        {/* Header */}
        <section className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 mx-auto flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">دليل أنواع التنبيهات</h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            تعرّف على جميع أنواع التنبيهات ومستويات الخطورة وطرق الاستهداف المستخدمة في المنصة
          </p>
        </section>

        {/* Categories */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-accent" />
            أنواع التنبيهات (11 نوع)
          </h2>
          <div className="space-y-3">
            {CATEGORY_DETAILS.map(({ key, icon: Icon, label, desc, color, bg, border }) => (
              <div key={key} className={`${bg} border ${border} rounded-xl p-4 flex gap-4 items-start`}>
                <div className={`w-10 h-10 rounded-xl bg-background/50 flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">{label}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Severity levels */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            مستويات الخطورة (5 مستويات)
          </h2>
          <div className="space-y-2">
            {SEVERITY_DETAILS.map(({ key, label, desc, color }) => (
              <div key={key} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                <span className={`px-3 py-1.5 rounded-full text-xs font-extrabold ${color} min-w-[60px] text-center`}>
                  {label}
                </span>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Target types */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-accent" />
            طرق استهداف التنبيهات
          </h2>
          <div className="grid gap-3">
            {TARGET_TYPES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-card border border-border rounded-xl p-4 flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">{label}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Navigation */}
        <div className="flex gap-3">
          <Link
            to="/about"
            className="flex-1 bg-card border border-border text-foreground py-3 rounded-xl text-sm font-bold text-center hover:border-accent/50 transition-all"
          >
            عن منارة الأنبار
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

export default AlertGuide;
