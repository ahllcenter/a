import { useState } from 'react';
import { Phone, User, MapPin, Shield, Loader2, Lock, LogIn, UserPlus, Zap } from 'lucide-react';
import { registerUser, verifyOTP, loginUser } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const CITIES = [
  'الرمادي', 'الفلوجة', 'هيت', 'حديثة', 'عنة', 'القائم',
  'الحبانية', 'الكرمة', 'الرطبة', 'راوة', 'عامرية الفلوجة',
  'الصقلاوية', 'الخالدية', 'البغدادي', 'كبيسة'
];

/** Convert local 07xxxxxxxxx to international 964xxxxxxxxxx */
function toInternational(local: string): string {
  const digits = local.replace(/\D/g, '');
  if (digits.startsWith('07') && digits.length === 11) {
    return '964' + digits.slice(1);
  }
  if (digits.startsWith('964')) return digits;
  return '964' + digits;
}

type Mode = 'login' | 'register' | 'otp';

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>('register');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fullPhone = toInternational('07' + phone);

  // Login: send OTP to existing user (passwordless)
  const handleLogin = async () => {
    if (phone.length !== 9) return setError('يرجى إدخال 9 أرقام بعد 07');

    setLoading(true);
    setError('');
    try {
      await loginUser({ phone: fullPhone });
      setMode('otp');
    } catch (err: any) {
      setError(err.response?.data?.error || 'حدث خطأ في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  // Register: create new user + send OTP (passwordless)
  const handleRegister = async () => {
    if (!name.trim()) return setError('يرجى إدخال الاسم');
    if (phone.length !== 9) return setError('يرجى إدخال 9 أرقام بعد 07');
    if (!city) return setError('يرجى اختيار المدينة');

    setLoading(true);
    setError('');
    try {
      await registerUser({ name: name.trim(), phone: fullPhone, city });
      setMode('otp');
    } catch (err: any) {
      setError(err.response?.data?.error || 'حدث خطأ في التسجيل');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP → get long-lived token → permanent session
  const handleVerify = async () => {
    if (!otpCode || otpCode.length < 4) return setError('يرجى إدخال رمز التحقق');
    setLoading(true);
    setError('');
    try {
      const res = await verifyOTP({ phone: fullPhone, code: otpCode });
      login(res.data.token, res.data.user);
      navigate('/home', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.error || 'رمز التحقق غير صحيح');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setError('');
    setOtpCode('');
  };

  // Shared phone input component
  const PhoneInput = () => (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
        <Phone className="w-3.5 h-3.5 inline ml-1" />
        رقم الهاتف
      </label>
      <div className="flex rounded-xl border border-input bg-card overflow-hidden focus-within:ring-2 focus-within:ring-accent/50" dir="ltr">
        <span className="flex items-center justify-center px-3 bg-muted border-r border-input text-sm font-bold text-muted-foreground select-none min-w-[48px]">
          07
        </span>
        <input
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '').slice(0, 9);
            setPhone(val);
          }}
          placeholder="8x xxx xxxx"
          className="flex-1 px-3 py-3 bg-transparent text-foreground text-sm placeholder:text-muted-foreground focus:outline-none text-left tracking-wide"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6 text-center shadow-lg">
        <div className="w-14 h-14 rounded-2xl bg-accent mx-auto flex items-center justify-center mb-3">
          <Shield className="w-7 h-7 text-accent-foreground" />
        </div>
        <h1 className="text-xl font-extrabold">منارة الأنبار العاجلة</h1>
        <p className="text-xs opacity-70 mt-1">نظام الإنذار المبكر لمحافظة الأنبار</p>
      </header>

      <main className="flex-1 container max-w-md mx-auto px-4 py-6">

        {/* ===== REGISTER MODE (default) ===== */}
        {mode === 'register' && (
          <div className="space-y-5 animate-fade-up">
            <div className="text-center mb-2">
              <h2 className="text-lg font-bold text-foreground">إنشاء حساب جديد</h2>
              <p className="text-sm text-muted-foreground mt-1">سجّل لتلقي تنبيهات فورية في منطقتك</p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                <User className="w-3.5 h-3.5 inline ml-1" />
                الاسم الكامل
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أدخل اسمك الكامل"
                className="w-full px-4 py-3 rounded-xl border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>

            {/* Phone */}
            <PhoneInput />
            <p className="text-[10px] text-muted-foreground -mt-3">سيتم إرسال رمز التحقق عبر واتساب</p>

            {/* City */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                <MapPin className="w-3.5 h-3.5 inline ml-1" />
                المدينة
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 appearance-none"
              >
                <option value="">اختر مدينتك...</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full bg-accent text-accent-foreground py-3.5 rounded-xl text-sm font-bold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {loading ? 'جاري التسجيل...' : 'دخول سريع'}
            </button>

            <div className="text-center pt-2">
              <p className="text-sm text-muted-foreground">لديك حساب بالفعل؟</p>
              <button
                onClick={() => switchMode('login')}
                className="text-sm text-accent font-bold hover:underline mt-1 inline-flex items-center gap-1"
              >
                <LogIn className="w-3.5 h-3.5" />
                تسجيل الدخول
              </button>
            </div>
          </div>
        )}

        {/* ===== LOGIN MODE (existing users — OTP based) ===== */}
        {mode === 'login' && (
          <div className="space-y-5 animate-fade-up">
            <div className="text-center mb-2">
              <h2 className="text-lg font-bold text-foreground">تسجيل الدخول</h2>
              <p className="text-sm text-muted-foreground mt-1">أدخل رقم هاتفك وسنرسل لك رمز تحقق</p>
            </div>

            <PhoneInput />

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-accent text-accent-foreground py-3.5 rounded-xl text-sm font-bold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              {loading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
            </button>

            <div className="text-center pt-2">
              <p className="text-sm text-muted-foreground">ليس لديك حساب؟</p>
              <button
                onClick={() => switchMode('register')}
                className="text-sm text-accent font-bold hover:underline mt-1 inline-flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                إنشاء حساب جديد
              </button>
            </div>
          </div>
        )}

        {/* ===== OTP VERIFICATION MODE ===== */}
        {mode === 'otp' && (
          <div className="space-y-5 animate-fade-up">
            <div className="text-center mb-4">
              <div className="w-16 h-16 rounded-full bg-accent/10 mx-auto flex items-center justify-center mb-3">
                <Phone className="w-8 h-8 text-accent" />
              </div>
              <h2 className="text-lg font-bold text-foreground">رمز التحقق</h2>
              <p className="text-sm text-muted-foreground mt-1">
                تم إرسال رمز التحقق إلى
                <br />
                <span dir="ltr" className="text-foreground font-bold">07{phone}</span>
                <br />
                عبر واتساب
              </p>
            </div>

            <div>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="أدخل رمز التحقق"
                dir="ltr"
                maxLength={6}
                className="w-full px-4 py-4 rounded-xl border border-input bg-card text-foreground text-2xl text-center font-bold tracking-[0.5em] placeholder:text-muted-foreground placeholder:text-base placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              onClick={handleVerify}
              disabled={loading}
              className="w-full bg-accent text-accent-foreground py-3.5 rounded-xl text-sm font-bold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'جاري التحقق...' : 'تأكيد'}
            </button>

            <button
              onClick={() => switchMode('register')}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              العودة للتسجيل
            </button>
          </div>
        )}
      </main>

      {/* رابط تسجيل دخول الإدارة */}
      <footer className="text-center py-4 px-4">
        <Link
          to="/admin/login"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors"
        >
          <Lock className="w-3 h-3" />
          دخول لوحة الإدارة
        </Link>
      </footer>
    </div>
  );
};

export default Register;
