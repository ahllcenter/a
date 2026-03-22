import AppHeader from "@/components/citizen/AppHeader";
import { Download, Share, PlusSquare, MoreVertical } from "lucide-react";

const Install = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container max-w-lg mx-auto px-4 py-8">
        <div className="text-center mb-8 animate-fade-up">
          <div className="w-16 h-16 rounded-2xl bg-accent mx-auto flex items-center justify-center mb-4 shadow-md">
            <Download className="w-8 h-8 text-accent-foreground" />
          </div>
          <h2 className="text-xl font-extrabold text-foreground mb-2 text-balance">
            ثبّت منارة الأنبار
          </h2>
          <p className="text-sm text-muted-foreground text-pretty">
            ثبّت التطبيق على شاشة هاتفك الرئيسية لتلقي الإشعارات بشكل فوري
          </p>
        </div>

        <div className="space-y-4">
          {/* iOS */}
          <div className="bg-card border border-border rounded-xl p-5 animate-fade-up stagger-1">
            <h3 className="text-sm font-bold text-foreground mb-3">آيفون (Safari)</h3>
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
          <div className="bg-card border border-border rounded-xl p-5 animate-fade-up stagger-2">
            <h3 className="text-sm font-bold text-foreground mb-3">أندرويد (Chrome)</h3>
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
