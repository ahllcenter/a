import { useState, useEffect } from 'react';
import AppHeader from "@/components/citizen/AppHeader";
import { Download, Share, PlusSquare, MoreVertical, Check, Smartphone, Bell, Shield, MapPin, Zap } from "lucide-react";

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
    }
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === 'accepted') setInstalled(true);
    setDeferredPrompt(null);
  };

  const FEATURES = [
    { icon: Bell, label: 'تنبيهات فورية', desc: 'استلم التنبيهات مباشرة على هاتفك' },
    { icon: MapPin, label: 'تتبع الموقع', desc: 'تنبيهات مخصصة لمنطقتك الجغرافية' },
    { icon: Zap, label: 'سرعة عالية', desc: 'أداء سريع يعمل حتى بدون إنترنت' },
    { icon: Shield, label: 'آمن وموثوق', desc: 'نظام إنذار رسمي لمحافظة الأنبار' },
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <AppHeader />
      <main className="container max-w-lg mx-auto px-4 py-8 space-y-6">
        <div className="text-center animate-fade-up">
          <div className="w-20 h-20 rounded-2xl bg-accent mx-auto flex items-center justify-center mb-4 shadow-lg">
            <Smartphone className="w-10 h-10 text-accent-foreground" />
          </div>
          <h2 className="text-xl font-extrabold text-foreground mb-2 text-balance">
            ثبّت منارة الأنبار على هاتفك
          </h2>
          <p className="text-sm text-muted-foreground text-pretty max-w-xs mx-auto">
            احصل على تجربة تطبيق كاملة مع إشعارات فورية وعمل بدون إنترنت
          </p>
        </div>

        {/* Direct install button */}
        {installed ? (
          <div className="flex items-center justify-center gap-2 px-4 py-4 rounded-xl bg-success/10 border border-success/30 text-success font-bold animate-fade-up stagger-1">
            <Check className="w-5 h-5" />
            التطبيق مثبت بالفعل!
          </div>
        ) : deferredPrompt ? (
          <button
            onClick={handleInstall}
            className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-xl bg-accent text-accent-foreground text-base font-bold hover:opacity-90 active:scale-[0.98] transition-all shadow-lg animate-fade-up stagger-1"
          >
            <Download className="w-5 h-5" />
            تثبيت التطبيق الآن
          </button>
        ) : null}

        {/* Features */}
        <div className="grid grid-cols-2 gap-3 animate-fade-up stagger-1">
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-4 text-center">
              <Icon className="w-6 h-6 text-accent mx-auto mb-2" />
              <p className="text-sm font-bold text-foreground">{label}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{desc}</p>
            </div>
          ))}
        </div>

        {/* Manual install instructions */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-muted-foreground text-center">أو ثبّت يدوياً:</h3>

          {/* iOS */}
          <div className="bg-card border border-border rounded-xl p-5 animate-fade-up stagger-2">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">🍎</span>
              آيفون (Safari)
            </h3>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0 text-xs font-bold text-foreground">1</span>
                <span className="flex items-center gap-1.5">
                  اضغط على زر المشاركة
                  <Share className="w-4 h-4 text-accent inline" />
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0 text-xs font-bold text-foreground">2</span>
                <span className="flex items-center gap-1.5">
                  اختر "إضافة إلى الشاشة الرئيسية"
                  <PlusSquare className="w-4 h-4 text-accent inline" />
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0 text-xs font-bold text-foreground">3</span>
                <span>اضغط "إضافة" للتأكيد</span>
              </li>
            </ol>
          </div>

          {/* Android */}
          <div className="bg-card border border-border rounded-xl p-5 animate-fade-up stagger-3">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">🤖</span>
              أندرويد (Chrome)
            </h3>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0 text-xs font-bold text-foreground">1</span>
                <span className="flex items-center gap-1.5">
                  اضغط على القائمة
                  <MoreVertical className="w-4 h-4 text-accent inline" />
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0 text-xs font-bold text-foreground">2</span>
                <span>اختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية"</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0 text-xs font-bold text-foreground">3</span>
                <span>اضغط "تثبيت" للتأكيد</span>
              </li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Install;
