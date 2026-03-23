import { useState } from 'react';
import { Phone, Lock, Eye, EyeOff, Loader2, KeyRound, ArrowRight, CheckCircle2 } from 'lucide-react';
import { sendResetCode, resetPassword } from '@/lib/api';
import { useNavigate, Link } from 'react-router-dom';

type Step = 'phone' | 'code' | 'newPassword' | 'done';

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('964');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendCode = async () => {
    if (!phone || phone.length < 13) return setError('يرجى إدخال رقم هاتف صحيح (964XXXXXXXXXX)');
    setLoading(true);
    setError('');
    try {
      await sendResetCode({ phone });
      setStep('code');
    } catch (err: any) {
      setError(err.response?.data?.error || 'حدث خطأ في إرسال رمز التحقق');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!code || code.length < 4) return setError('يرجى إدخال رمز التحقق');
    if (!newPassword || newPassword.length < 6) return setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
    setLoading(true);
    setError('');
    try {
      await resetPassword({ phone, code, newPassword });
      setStep('done');
    } catch (err: any) {
      setError(err.response?.data?.error || 'حدث خطأ في تغيير كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      <header className="bg-primary text-primary-foreground py-6 text-center shadow-lg">
        <div className="w-14 h-14 rounded-2xl bg-accent mx-auto flex items-center justify-center mb-3">
          <KeyRound className="w-7 h-7 text-accent-foreground" />
        </div>
        <h1 className="text-xl font-extrabold">استعادة كلمة المرور</h1>
        <p className="text-xs opacity-70 mt-1">سنرسل رمز تحقق عبر واتساب</p>
      </header>

      <main className="flex-1 container max-w-md mx-auto px-4 py-6">

        {/* Step 1: Phone */}
        {step === 'phone' && (
          <div className="space-y-5 animate-fade-up">
            <div className="text-center mb-2">
              <h2 className="text-lg font-bold text-foreground">أدخل رقم هاتفك</h2>
              <p className="text-sm text-muted-foreground mt-1">سنرسل رمز تحقق إلى واتساب المرتبط بهذا الرقم</p>
            </div>

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

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              onClick={handleSendCode}
              disabled={loading}
              className="w-full bg-accent text-accent-foreground py-3.5 rounded-xl text-sm font-bold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {loading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
            </button>

            <div className="text-center pt-2">
              <Link to="/register" className="text-sm text-accent font-bold hover:underline">
                العودة لتسجيل الدخول
              </Link>
            </div>
          </div>
        )}

        {/* Step 2: Enter code + new password */}
        {step === 'code' && (
          <div className="space-y-5 animate-fade-up">
            <div className="text-center mb-2">
              <h2 className="text-lg font-bold text-foreground">أدخل رمز التحقق</h2>
              <p className="text-sm text-muted-foreground mt-1">
                تم إرسال رمز التحقق إلى واتساب على الرقم
                <span className="font-bold text-foreground mr-1" dir="ltr">{phone}</span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                <KeyRound className="w-3.5 h-3.5 inline ml-1" />
                رمز التحقق
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="أدخل الرمز المكون من 6 أرقام"
                dir="ltr"
                className="w-full px-4 py-3 rounded-xl border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 text-center text-lg tracking-[0.5em] font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                <Lock className="w-3.5 h-3.5 inline ml-1" />
                كلمة المرور الجديدة
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full bg-accent text-accent-foreground py-3.5 rounded-xl text-sm font-bold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              {loading ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
            </button>

            <div className="text-center pt-2">
              <button
                onClick={() => { setStep('phone'); setError(''); setCode(''); }}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                إعادة إرسال الرمز لرقم آخر
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 'done' && (
          <div className="space-y-5 animate-fade-up text-center py-8">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-lg font-bold text-foreground">تم تغيير كلمة المرور بنجاح!</h2>
            <p className="text-sm text-muted-foreground">يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة</p>
            <button
              onClick={() => navigate('/register', { replace: true })}
              className="w-full bg-accent text-accent-foreground py-3.5 rounded-xl text-sm font-bold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              الذهاب لتسجيل الدخول
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default ForgotPassword;
