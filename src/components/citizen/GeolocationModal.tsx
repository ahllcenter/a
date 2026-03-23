import { useState } from 'react';
import { MapPin, Loader2, X } from 'lucide-react';

interface GeolocationModalProps {
  onClose: () => void;
}

const STORAGE_KEY = 'geolocation_prompted';

export function hasBeenPrompted(): boolean {
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

export function markPrompted(): void {
  localStorage.setItem(STORAGE_KEY, 'true');
}

const GeolocationModal = ({ onClose }: GeolocationModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleEnable = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      () => {
        markPrompted();
        setLoading(false);
        onClose();
      },
      () => {
        markPrompted();
        setLoading(false);
        onClose();
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSkip = () => {
    markPrompted();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" dir="rtl">
      <div className="bg-card rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-5 animate-fade-up relative">
        <button
          onClick={handleSkip}
          className="absolute left-3 top-3 text-muted-foreground hover:text-foreground"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-accent/10 mx-auto flex items-center justify-center">
            <MapPin className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-lg font-extrabold text-foreground">تفعيل التنبيهات الذكية لمنطقتك</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            للحصول على تنبيهات الطوارئ المتعلقة بمنطقتك فقط، نحتاج الوصول لموقعك الجغرافي.
            <br />
            لن يتم مشاركة موقعك مع أي جهة خارجية.
          </p>
        </div>

        <button
          onClick={handleEnable}
          disabled={loading}
          className="w-full bg-accent text-accent-foreground py-3.5 rounded-xl text-sm font-bold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              جاري تحديد الموقع...
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4" />
              حسناً، فعّل التنبيهات
            </>
          )}
        </button>

        <button
          onClick={handleSkip}
          className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
        >
          ليس الآن
        </button>
      </div>
    </div>
  );
};

export default GeolocationModal;
