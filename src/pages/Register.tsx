import { useState } from 'react';
import { Phone, User, MapPin, Shield, Loader2, CheckCircle2, Lock, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { registerUser, verifyOTP, loginUser } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import LocationMap from '@/components/citizen/LocationMap';

const CITIES = [
  'الرمادي', 'الفلوجة', 'هيت', 'حديثة', 'عنة', 'القائم',
  'الحبانية', 'الكرمة', 'الرطبة', 'راوة', 'عامرية الفلوجة',
  'الصقلاوية', 'الخالدية', 'البغدادي', 'كبيسة'
];

type Mode = 'login' | 'register' | 'otp';

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('964');
  const [city, setCity] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const enableLocation = () => {
    setLocationLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setLocationEnabled(true);
        setLocationLoading(false);
      },
      (err) => {
        setError('تعذر الوصول للموقع الجغرافي. يرجى السماح بالوصول من إعدادات المتصفح.');
        setLocationLoading(false);
        console.error('Geolocation error:', err);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const handleLogin = async () => {
    if (!phone || phone.length < 13) return setError('يرجى إدخال رقم هاتف صحيح (964XXXXXXXXXX)');
    if (!password) return setError('يرجى إدخال كلمة المرور');

    setLoading(true);
    setError('');
    try {
      const res = await loginUser({ phone, password });
      login(res.data.token, res.data.user);
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.error || 'حدث خطأ في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name.trim()) return setError('يرجى إدخال الاسم');
    if (!phone || phone.length < 13) return setError('يرجى إدخال رقم هاتف صحيح (964XXXXXXXXXX)');
    if (!city) return setError('يرجى اختيار المدينة');
    if (!password || password.length < 6) return setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
    if (!locationEnabled) return setError('يرجى تفعيل الموقع الجغرافي');

    setLoading(true);
    setError('');
    try {
      await registerUser({ name: name.trim(), phone, city, password, lat: lat!, lng: lng! });
      setMode('otp');
    } catch (err: any) {
      setError(err.response?.data?.error || 'حدث خطأ في التسجيل');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!otpCode || otpCode.length < 4) return setError('يرجى إدخال رمز التحقق');
    setLoading(true);
    setError('');
    try {
      const res = await verifyOTP({ phone, code: otpCode });
      login(res.data.token, res.data.user);
      navigate('/', { replace: true });
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

        {/* ===== LOGIN MODE ===== */}
        {mode === 'login' && (
          <div className="space-y-5 animate-fade-up">
            <div className="text-center mb-2">
              <h2 className="text-lg font-bold text-foreground">تسجيل الدخول</h2>
              <p className="text-sm text-muted-foreground mt-1">أدخل رقم هاتفك وكلمة المرور</p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                <Phone className="w-3.5 h-3.5 inline ml-1" />
                رقم الهاتف
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.startsWith('964')) setPhone(val.slice(0, 13));
                  else setPhone('964');
                }}
                placeholder="9647XXXXXXXXX"
                dir="ltr"
                className="w-full px-4 py-3 rounded-xl border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 text-left"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                <Lock className="w-3.5 h-3.5 inline ml-1" />
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  className="w-full px-4 py-3 rounded-xl border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 pl-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-accent text-accent-foreground py-3.5 rounded-xl text-sm font-bold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              {loading ? 'جاري الدخول...' : 'دخول'}
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

        {/* ===== REGISTER MODE ===== */}
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
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                <Phone className="w-3.5 h-3.5 inline ml-1" />
                رقم الهاتف
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.startsWith('964')) setPhone(val.slice(0, 13));
                  else setPhone('964');
                }}
                placeholder="9647XXXXXXXXX"
                dir="ltr"
                className="w-full px-4 py-3 rounded-xl border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 text-left"
              />
              <p className="text-[10px] text-muted-foreground mt-1">سيتم إرسال رمز التحقق عبر واتساب مرة واحدة فقط</p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                <Lock className="w-3.5 h-3.5 inline ml-1" />
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="6 أحرف على الأقل"
                  className="w-full px-4 py-3 rounded-xl border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 pl-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">ستستخدم كلمة المرور لتسجيل الدخول لاحقاً</p>
            </div>

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

            {/* Location */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                <MapPin className="w-3.5 h-3.5 inline ml-1" />
                الموقع الجغرافي
              </label>
              {!locationEnabled ? (
                <button
                  onClick={enableLocation}
                  disabled={locationLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-accent/50 bg-accent/5 text-accent text-sm font-bold hover:bg-accent/10 transition-all disabled:opacity-50"
                >
                  {locationLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> جاري تحديد الموقع...</>
                  ) : (
                    <><MapPin className="w-4 h-4" /> تفعيل الموقع الجغرافي</>
                  )}
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-success/10 border border-success/30 text-success text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    تم تحديد الموقع بنجاح
                  </div>
                  {lat && lng && (
                    <div className="h-48 rounded-xl overflow-hidden border border-border">
                      <LocationMap lat={lat} lng={lng} interactive={false} />
                    </div>
                  )}
                </div>
              )}
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full bg-accent text-accent-foreground py-3.5 rounded-xl text-sm font-bold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {loading ? 'جاري التسجيل...' : 'تسجيل'}
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
                <span dir="ltr" className="text-foreground font-bold">{phone}</span>
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
