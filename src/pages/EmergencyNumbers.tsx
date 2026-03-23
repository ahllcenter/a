import { Phone, PhoneCall, Zap, Building2, Droplets, Flame, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import AppHeader from "@/components/citizen/AppHeader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface PhoneEntry {
  label: string;
  numbers: string[];
}

interface EmergencySection {
  id: string;
  title: string;
  icon: React.ElementType;
  iconColor: string;
  borderColor: string;
  entries: PhoneEntry[];
}

const EMERGENCY_SECTIONS: EmergencySection[] = [
  {
    id: "general",
    title: "طوارئ وخدمات عامة",
    icon: Flame,
    iconColor: "text-red-500",
    borderColor: "border-red-500/30",
    entries: [
      { label: "الدفاع المدني والداخلية", numbers: ["911"] },
      { label: "بلدية الرمادي — الرقم الساخن", numbers: ["07833311136"] },
      { label: "مديرية مياه الأنبار", numbers: ["07866505266"] },
    ],
  },
  {
    id: "electricity-central",
    title: "شكاوى كهرباء مركز الأنبار",
    icon: Zap,
    iconColor: "text-amber-500",
    borderColor: "border-amber-500/30",
    entries: [
      { label: "الخط الساخن المجاني", numbers: ["159"] },
      { label: "شكاوى مقر الفرع", numbers: ["07833491694", "07833491695"] },
      { label: "شكاوى الرمادي المركز", numbers: ["07809257407"] },
      { label: "شكاوى غرب الرمادي", numbers: ["07864995608"] },
      { label: "شكاوى هيت", numbers: ["07809256020"] },
      { label: "شكاوى الخالدية", numbers: ["07833490610"] },
    ],
  },
  {
    id: "electricity-east",
    title: "شكاوى كهرباء شرق الأنبار",
    icon: Building2,
    iconColor: "text-blue-500",
    borderColor: "border-blue-500/30",
    entries: [
      { label: "شكاوى مقر الفرع", numbers: ["07835980720", "07779490030", "07509800886"] },
      { label: "شكاوى القطاع الشمالي", numbers: ["07835980690"] },
      { label: "شكاوى القطاع الجنوبي", numbers: ["07835980691"] },
      { label: "شكاوى قطاع الصقلاوية", numbers: ["07835980693"] },
      { label: "شكاوى قطاع الكرمة", numbers: ["07835980694"] },
      { label: "شكاوى قطاع العامرية", numbers: ["07835980692"] },
    ],
  },
];

const EmergencyNumbers = () => {
  return (
    <div className="min-h-screen bg-background pb-20" dir="rtl">
      <AppHeader />

      <main className="container max-w-lg mx-auto px-4 py-5 space-y-5">
        {/* Header */}
        <section className="text-center space-y-3 animate-fade-up">
          <div className="w-16 h-16 rounded-2xl bg-destructive/90 mx-auto flex items-center justify-center shadow-lg">
            <PhoneCall className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-extrabold text-foreground">أرقام الطوارئ</h1>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
            أرقام هواتف الطوارئ والخدمات في محافظة الأنبار — اضغط على أي رقم للاتصال مباشرة
          </p>
        </section>

        {/* 911 Emergency Banner */}
        <a
          href="tel:911"
          className="block bg-red-600 hover:bg-red-700 active:scale-[0.98] transition-all rounded-2xl p-5 text-center shadow-lg animate-fade-up stagger-1"
        >
          <div className="flex items-center justify-center gap-3">
            <Phone className="w-8 h-8 text-white animate-pulse" />
            <div>
              <div className="text-3xl font-black text-white tracking-wider">911</div>
              <div className="text-xs text-red-100 font-medium mt-0.5">الدفاع المدني والداخلية — اتصل الآن</div>
            </div>
            <Phone className="w-8 h-8 text-white animate-pulse" />
          </div>
        </a>

        {/* Accordion Sections */}
        <Accordion type="multiple" defaultValue={["general"]} className="space-y-3">
          {EMERGENCY_SECTIONS.map((section, sIdx) => (
            <AccordionItem
              key={section.id}
              value={section.id}
              className={`bg-card border-2 ${section.borderColor} rounded-2xl overflow-hidden animate-fade-up stagger-${sIdx + 2}`}
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl bg-muted flex items-center justify-center`}>
                    <section.icon className={`w-5 h-5 ${section.iconColor}`} />
                  </div>
                  <span className="text-sm font-bold text-foreground">{section.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-2">
                  {section.entries.map((entry) => (
                    <div
                      key={entry.label}
                      className="bg-muted/50 rounded-xl p-3 space-y-1.5"
                    >
                      <div className="text-xs font-semibold text-muted-foreground">{entry.label}</div>
                      <div className="flex flex-wrap gap-2">
                        {entry.numbers.map((num) => (
                          <a
                            key={num}
                            href={`tel:${num}`}
                            className="inline-flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 active:scale-95 text-primary font-bold text-sm px-3 py-2 rounded-lg transition-all"
                            dir="ltr"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            {num}
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Back button */}
        <div className="flex justify-center pt-2 animate-fade-up stagger-5">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 active:scale-95 transition-all"
          >
            الرئيسية
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  );
};

export default EmergencyNumbers;
