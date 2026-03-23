import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Bell, Users, Send, BarChart3, ChevronLeft, LogOut,
  Plus, MapPin, Globe, Building2, Megaphone, Trash2, Loader2,
  LayoutDashboard, List, UserCog, Info, BookOpen, MessageSquare,
  AlertTriangle, Mail, Eye, CheckCircle2, XCircle, Reply,
  Map, Activity, Clock, TrendingUp, UserPlus, Shield
} from "lucide-react";
import {
  CATEGORIES, SEVERITY_LABELS,
  AlertCategory, AlertSeverity
} from "@/lib/alert-data";
import {
  adminVerify, getAdminStats, getAdminUsers,
  adminGetAllAlerts, adminCreateAlert, adminDeleteAlert,
  adminGetInquiries, adminReplyInquiry,
  adminGetReports, adminUpdateReportStatus,
  adminSendMessage, adminGetMessages,
  adminDeleteUser, adminCreateUser,
  adminGetAdmins, adminCreateAdmin, adminDeleteAdmin
} from "@/lib/api";
import AlertCard from "@/components/citizen/AlertCard";
import LocationMap from "@/components/citizen/LocationMap";

type AlertType = 'geo' | 'city' | 'broadcast';
type Section = 'stats' | 'create' | 'alerts' | 'users' | 'inquiries' | 'reports' | 'messages' | 'admin-mgmt';

const CITIES = [
  'الرمادي', 'الفلوجة', 'هيت', 'حديثة', 'عنة', 'القائم',
  'الحبانية', 'الكرمة', 'الرطبة', 'راوة', 'عامرية الفلوجة',
  'الصقلاوية', 'الخالدية', 'البغدادي', 'كبيسة'
];

const SIDEBAR_ITEMS: { key: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'stats', label: 'الإحصائيات', icon: BarChart3 },
  { key: 'create', label: 'إرسال تنبيه', icon: Plus },
  { key: 'alerts', label: 'إدارة التنبيهات', icon: List },
  { key: 'users', label: 'المستخدمون', icon: UserCog },
  { key: 'inquiries', label: 'الاستفسارات', icon: MessageSquare },
  { key: 'reports', label: 'البلاغات', icon: AlertTriangle },
  { key: 'messages', label: 'المراسلات', icon: Mail },
  { key: 'admin-mgmt', label: 'إدارة المدراء', icon: Shield },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [section, setSection] = useState<Section>('stats');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Create alert form
  const [selectedCategory, setSelectedCategory] = useState<AlertCategory>("flood");
  const [selectedSeverity, setSelectedSeverity] = useState<AlertSeverity>("high");
  const [alertType, setAlertType] = useState<AlertType>("broadcast");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetCities, setTargetCities] = useState<string[]>([]);
  const [targetLat, setTargetLat] = useState(33.42);
  const [targetLng, setTargetLng] = useState(43.31);
  const [targetRadius, setTargetRadius] = useState(10);
  const [locationLabel, setLocationLabel] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ ok: boolean; msg: string } | null>(null);

  // Data
  const [stats, setStats] = useState({ totalUsers: 0, totalAlerts: 0, activeAlerts: 0, cityCounts: [] as { city: string; count: number }[] });
  const [alerts, setAlerts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [sentMessages, setSentMessages] = useState<any[]>([]);

  // Reply / message forms
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [msgTargetType, setMsgTargetType] = useState<'all' | 'city' | 'user'>('all');
  const [msgTargetCity, setMsgTargetCity] = useState('');
  const [msgTargetUserId, setMsgTargetUserId] = useState<number | null>(null);
  const [msgTitle, setMsgTitle] = useState('');
  const [msgContent, setMsgContent] = useState('');
  const [msgLoading, setMsgLoading] = useState(false);
  const [msgResult, setMsgResult] = useState<{ ok: boolean; msg: string } | null>(null);

  // Add user form
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserCity, setNewUserCity] = useState('');
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [addUserResult, setAddUserResult] = useState<{ ok: boolean; msg: string } | null>(null);

  // City filter
  const [filterCities, setFilterCities] = useState<string[]>([]);

  // Admin management
  const [admins, setAdmins] = useState<any[]>([]);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [addAdminLoading, setAddAdminLoading] = useState(false);
  const [addAdminResult, setAddAdminResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const categoryEntries = Object.entries(CATEGORIES) as [AlertCategory, (typeof CATEGORIES)[AlertCategory]][];
  const severityEntries = Object.entries(SEVERITY_LABELS) as [AlertSeverity, string][];

  const filteredUsers = filterCities.length > 0
    ? users.filter(u => filterCities.includes(u.city))
    : users;

  // Verify admin token on mount
  useEffect(() => {
    const token = localStorage.getItem('anbar_admin_token');
    if (!token) { navigate('/admin/login', { replace: true }); return; }
    adminVerify().then(() => { setAuthChecked(true); fetchData(); })
      .catch(() => { localStorage.removeItem('anbar_admin_token'); navigate('/admin/login', { replace: true }); });
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [statsRes, alertsRes, usersRes, inqRes, repRes, msgRes, adminsRes] = await Promise.all([
        getAdminStats(), adminGetAllAlerts(), getAdminUsers(),
        adminGetInquiries(), adminGetReports(), adminGetMessages(),
        adminGetAdmins()
      ]);
      setStats(statsRes.data.stats);
      setAlerts(alertsRes.data.alerts || []);
      setUsers(usersRes.data.users || []);
      setInquiries(inqRes.data.inquiries || []);
      setReports(repRes.data.reports || []);
      setSentMessages(msgRes.data.messages || []);
      setAdmins(adminsRes.data.admins || []);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('anbar_admin_token');
    navigate('/admin/login', { replace: true });
  };

  const handleDeleteUser = async (id: number, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف المستخدم "${name}"؟`)) return;
    try {
      await adminDeleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.error || 'فشل حذف المستخدم');
    }
  };

  const handleAddUser = async () => {
    if (!newUserName.trim() || !newUserPhone || !newUserCity) {
      return setAddUserResult({ ok: false, msg: 'يرجى ملء جميع الحقول' });
    }
    if (newUserPhone.length !== 9) {
      return setAddUserResult({ ok: false, msg: 'يرجى إدخال 9 أرقام بعد 07' });
    }
    const fullPhone = '964' + '7' + newUserPhone;
    setAddUserLoading(true);
    setAddUserResult(null);
    try {
      await adminCreateUser({ name: newUserName.trim(), phone: fullPhone, city: newUserCity });
      setAddUserResult({ ok: true, msg: 'تم إضافة المستخدم بنجاح' });
      setNewUserName(''); setNewUserPhone(''); setNewUserCity('');
      setShowAddUser(false);
      fetchData();
    } catch (err: any) {
      setAddUserResult({ ok: false, msg: err.response?.data?.error || 'فشل إضافة المستخدم' });
    } finally {
      setAddUserLoading(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminName.trim() || !newAdminEmail.trim() || !newAdminPassword) {
      return setAddAdminResult({ ok: false, msg: 'يرجى ملء جميع الحقول' });
    }
    setAddAdminLoading(true);
    setAddAdminResult(null);
    try {
      await adminCreateAdmin({ name: newAdminName.trim(), email: newAdminEmail.trim(), password: newAdminPassword });
      setAddAdminResult({ ok: true, msg: 'تم إضافة المدير بنجاح' });
      setNewAdminName(''); setNewAdminEmail(''); setNewAdminPassword('');
      setShowAddAdmin(false);
      fetchData();
    } catch (err: any) {
      setAddAdminResult({ ok: false, msg: err.response?.data?.error || 'فشل إضافة المدير' });
    } finally {
      setAddAdminLoading(false);
    }
  };

  const handleDeleteAdmin = async (id: number, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف المدير "${name}"؟`)) return;
    try {
      await adminDeleteAdmin(id);
      setAdmins(prev => prev.filter(a => a.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.error || 'فشل حذف المدير');
    }
  };

  const toggleFilterCity = (city: string) => {
    setFilterCities(prev => prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]);
  };

  const handleSend = async () => {
    if (!title.trim()) return setSendResult({ ok: false, msg: 'يرجى إدخال عنوان التنبيه' });
    setSending(true);
    setSendResult(null);
    try {
      await adminCreateAlert({
        title: title.trim(),
        description: description.trim(),
        category: selectedCategory,
        severity: selectedSeverity,
        alert_type: alertType,
        target_lat: alertType === 'geo' ? targetLat : undefined,
        target_lng: alertType === 'geo' ? targetLng : undefined,
        target_radius_km: alertType === 'geo' ? targetRadius : undefined,
        target_cities: alertType === 'city' ? targetCities : undefined,
        location_label: locationLabel.trim() || undefined,
      });
      setSendResult({ ok: true, msg: 'تم إرسال التنبيه بنجاح!' });
      setTitle(''); setDescription(''); setLocationLabel(''); setTargetCities([]);
      fetchData();
    } catch (err: any) {
      setSendResult({ ok: false, msg: err.response?.data?.error || 'فشل إرسال التنبيه' });
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: number) => {
    try { await adminDeleteAlert(id); fetchData(); }
    catch (err) { console.error('Failed to delete alert:', err); }
  };

  const toggleCity = (c: string) => {
    setTargetCities(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  const handleReply = async (id: number) => {
    if (!replyText.trim()) return;
    setReplyLoading(true);
    try {
      await adminReplyInquiry(id, replyText.trim());
      setReplyText('');
      setReplyingTo(null);
      fetchData();
    } catch (err) {
      console.error('Reply error:', err);
    } finally {
      setReplyLoading(false);
    }
  };

  const handleReportStatus = async (id: number, status: string, notes?: string) => {
    try {
      await adminUpdateReportStatus(id, status, notes);
      fetchData();
    } catch (err) {
      console.error('Report status error:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!msgTitle.trim() || !msgContent.trim()) {
      setMsgResult({ ok: false, msg: 'العنوان والمحتوى مطلوبان' });
      return;
    }
    setMsgLoading(true);
    setMsgResult(null);
    try {
      await adminSendMessage({
        target_type: msgTargetType,
        target_user_id: msgTargetType === 'user' ? (msgTargetUserId || undefined) : undefined,
        target_city: msgTargetType === 'city' ? msgTargetCity : undefined,
        title: msgTitle.trim(),
        content: msgContent.trim(),
      });
      setMsgResult({ ok: true, msg: 'تم إرسال الرسالة بنجاح' });
      setMsgTitle('');
      setMsgContent('');
      fetchData();
    } catch (err: any) {
      setMsgResult({ ok: false, msg: 'فشل إرسال الرسالة' });
    } finally {
      setMsgLoading(false);
    }
  };

  const pendingInquiries = inquiries.filter(i => i.status === 'pending').length;
  const pendingReports = reports.filter(r => r.status === 'pending').length;

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex" dir="rtl">
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 right-0 z-50 md:z-auto h-screen w-64 bg-card border-l border-border flex flex-col transition-transform md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
        {/* Sidebar header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-foreground">لوحة الإدارة</h1>
              <p className="text-[10px] text-muted-foreground">منارة الأنبار العاجلة</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {SIDEBAR_ITEMS.map(item => {
            const badge = item.key === 'inquiries' ? pendingInquiries
              : item.key === 'reports' ? pendingReports : 0;
            return (
            <button
              key={item.key}
              onClick={() => { setSection(item.key); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                section === item.key
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
              {badge > 0 && (
                <span className="mr-auto bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{badge}</span>
              )}
            </button>
            );
          })}

          <div className="border-t border-border my-3" />
          <Link
            to="/about"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
          >
            <Info className="w-4 h-4" />
            عن منارة الأنبار
          </Link>
          <Link
            to="/guide"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
          >
            <BookOpen className="w-4 h-4" />
            دليل التنبيهات
          </Link>
          <Link
            to="/"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            العودة للتطبيق
          </Link>
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-lg border-b border-border h-14 flex items-center px-4 gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-muted md:hidden">
            <BarChart3 className="w-5 h-5 text-foreground" />
          </button>
          <h2 className="text-sm font-bold text-foreground">
            {SIDEBAR_ITEMS.find(i => i.key === section)?.label}
          </h2>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">

          {/* ========== STATS SECTION ========== */}
          {section === 'stats' && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "المستخدمون", value: stats.totalUsers, icon: Users, color: 'text-blue-400' },
                  { label: "إجمالي التنبيهات", value: stats.totalAlerts, icon: Send, color: 'text-amber-400' },
                  { label: "التنبيهات النشطة", value: stats.activeAlerts, icon: Bell, color: 'text-emerald-400' },
                  { label: "نشط اليوم", value: users.filter(u => u.last_seen && (Date.now() - new Date(u.last_seen).getTime()) < 86400000).length, icon: Activity, color: 'text-purple-400' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                        <Icon className={`w-5 h-5 ${color}`} />
                      </div>
                      <div>
                        <p className="text-2xl font-extrabold text-foreground tabular-nums">{value.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{label}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* User activity stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(() => {
                  const now = Date.now();
                  const activeToday = users.filter(u => u.last_seen && (now - new Date(u.last_seen).getTime()) < 86400000).length;
                  const activeWeek = users.filter(u => u.last_seen && (now - new Date(u.last_seen).getTime()) < 604800000).length;
                  const newThisWeek = users.filter(u => u.created_at && (now - new Date(u.created_at).getTime()) < 604800000).length;
                  return [
                    { label: "نشط آخر 24 ساعة", value: activeToday, total: users.length, color: 'bg-emerald-500' },
                    { label: "نشط آخر 7 أيام", value: activeWeek, total: users.length, color: 'bg-blue-500' },
                    { label: "مسجل هذا الأسبوع", value: newThisWeek, total: users.length, color: 'bg-purple-500' },
                  ].map(({ label, value, total, color }) => (
                    <div key={label} className="bg-card border border-border rounded-xl p-4">
                      <p className="text-xs text-muted-foreground mb-2">{label}</p>
                      <div className="flex items-end gap-2">
                        <span className="text-xl font-extrabold text-foreground">{value}</span>
                        <span className="text-xs text-muted-foreground mb-0.5">/ {total}</span>
                      </div>
                      <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${color}`} style={{ width: `${total > 0 ? (value / total * 100) : 0}%` }} />
                      </div>
                    </div>
                  ));
                })()}
              </div>

              {/* City distribution */}
              {stats.cityCounts.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-5">
                  <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-accent" />
                    توزيع المستخدمين حسب المدينة
                  </h3>
                  <div className="space-y-2">
                    {stats.cityCounts.map(({ city, count }) => {
                      const pct = stats.totalUsers > 0 ? (count / stats.totalUsers * 100) : 0;
                      return (
                        <div key={city} className="flex items-center gap-3">
                          <span className="text-xs text-foreground font-medium w-28 shrink-0 text-right">{city}</span>
                          <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden relative">
                            <div className="h-full bg-accent/60 rounded-full transition-all" style={{ width: `${pct}%` }} />
                            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground">{count}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground w-10 text-left">{pct.toFixed(0)}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Users Map */}
              {users.some(u => u.lat && u.lng) && (
                <div className="bg-card border border-border rounded-xl p-5">
                  <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                    <Map className="w-4 h-4 text-accent" />
                    خريطة المستخدمين المسجلين
                  </h3>
                  <div className="h-80 rounded-xl overflow-hidden border border-border">
                    <LocationMap
                      lat={33.42}
                      lng={43.31}
                      markers={users.filter(u => u.lat && u.lng).map(u => ({ lat: u.lat, lng: u.lng, name: u.name, city: u.city }))}
                      className="w-full h-full"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 text-center">
                    {users.filter(u => u.lat && u.lng).length} مستخدم على الخريطة — اضغط على النقطة لعرض التفاصيل
                  </p>
                </div>
              )}

              {/* Most active users */}
              {users.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-5">
                  <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-accent" />
                    أحدث المستخدمين النشطين
                  </h3>
                  <div className="space-y-2">
                    {[...users]
                      .filter(u => u.last_seen)
                      .sort((a, b) => new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime())
                      .slice(0, 10)
                      .map((u, i) => {
                        const ago = Date.now() - new Date(u.last_seen).getTime();
                        const isOnline = ago < 300000; // 5 min
                        const timeLabel = ago < 60000 ? 'الآن' : ago < 3600000 ? `${Math.floor(ago/60000)} دقيقة` : ago < 86400000 ? `${Math.floor(ago/3600000)} ساعة` : `${Math.floor(ago/86400000)} يوم`;
                        return (
                          <div key={u.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/30 transition-colors">
                            <span className="text-xs text-muted-foreground w-5">{i + 1}</span>
                            <div className={`w-2 h-2 rounded-full shrink-0 ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/30'}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-foreground truncate">{u.name}</p>
                              <p className="text-[10px] text-muted-foreground">{u.city}</p>
                            </div>
                            <div className="text-left shrink-0">
                              <p className={`text-[11px] font-medium ${isOnline ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                                {isOnline ? '● متصل' : `منذ ${timeLabel}`}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    {users.filter(u => u.last_seen).length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-4">لا توجد بيانات نشاط بعد</p>
                    )}
                  </div>
                </div>
              )}

              {/* Quick actions */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button onClick={() => setSection('create')} className="bg-card border border-border rounded-xl p-4 hover:border-accent/50 transition-all text-right">
                  <Plus className="w-5 h-5 text-accent mb-2" />
                  <p className="text-sm font-bold text-foreground">إرسال تنبيه</p>
                  <p className="text-[11px] text-muted-foreground">تنبيه عاجل جديد</p>
                </button>
                <button onClick={() => setSection('inquiries')} className="bg-card border border-border rounded-xl p-4 hover:border-accent/50 transition-all text-right relative">
                  <MessageSquare className="w-5 h-5 text-accent mb-2" />
                  <p className="text-sm font-bold text-foreground">الاستفسارات</p>
                  <p className="text-[11px] text-muted-foreground">{pendingInquiries} بانتظار الرد</p>
                  {pendingInquiries > 0 && <span className="absolute top-3 left-3 w-2.5 h-2.5 rounded-full bg-destructive animate-pulse" />}
                </button>
                <button onClick={() => setSection('reports')} className="bg-card border border-border rounded-xl p-4 hover:border-accent/50 transition-all text-right relative">
                  <AlertTriangle className="w-5 h-5 text-accent mb-2" />
                  <p className="text-sm font-bold text-foreground">البلاغات</p>
                  <p className="text-[11px] text-muted-foreground">{pendingReports} بانتظار المراجعة</p>
                  {pendingReports > 0 && <span className="absolute top-3 left-3 w-2.5 h-2.5 rounded-full bg-destructive animate-pulse" />}
                </button>
                <button onClick={() => setSection('messages')} className="bg-card border border-border rounded-xl p-4 hover:border-accent/50 transition-all text-right">
                  <Mail className="w-5 h-5 text-accent mb-2" />
                  <p className="text-sm font-bold text-foreground">المراسلات</p>
                  <p className="text-[11px] text-muted-foreground">إرسال رسالة</p>
                </button>
              </div>
            </>
          )}

          {/* ========== CREATE ALERT SECTION ========== */}
          {section === 'create' && (
            <section className="bg-card border border-border rounded-xl p-5">
              <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 text-accent" />
                إرسال تنبيه جديد
              </h2>
              <div className="space-y-4">
                {/* Alert Type */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">نوع الاستهداف</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'broadcast' as AlertType, label: 'إرسال للكل', icon: Megaphone, desc: 'جميع المستخدمين' },
                      { key: 'city' as AlertType, label: 'مدينة / منطقة', icon: Building2, desc: 'مدن محددة' },
                      { key: 'geo' as AlertType, label: 'موقع جغرافي', icon: Globe, desc: 'نطاق على الخريطة' },
                    ].map(t => (
                      <button
                        key={t.key}
                        onClick={() => setAlertType(t.key)}
                        className={`flex flex-col items-center gap-1 p-3 rounded-lg border text-xs font-medium transition-all active:scale-95 ${
                          alertType === t.key
                            ? 'border-accent bg-accent/10 text-foreground'
                            : 'border-border bg-card text-muted-foreground hover:border-accent/50'
                        }`}
                      >
                        <t.icon className="w-5 h-5" />
                        <span className="font-bold">{t.label}</span>
                        <span className="text-[10px] opacity-60">{t.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* City target */}
                {alertType === 'city' && (
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2">المدن المستهدفة</label>
                    <div className="flex flex-wrap gap-2">
                      {CITIES.map(c => (
                        <button
                          key={c}
                          onClick={() => toggleCity(c)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all active:scale-95 ${
                            targetCities.includes(c)
                              ? 'border-accent bg-accent/20 text-accent'
                              : 'border-border text-muted-foreground hover:border-accent/50'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Geo target */}
                {alertType === 'geo' && (
                  <div className="space-y-3">
                    <label className="block text-xs font-medium text-muted-foreground">
                      انقر على الخريطة لتحديد مركز التنبيه
                    </label>
                    <div className="h-64 rounded-xl overflow-hidden border border-border">
                      <LocationMap
                        lat={targetLat}
                        lng={targetLng}
                        interactive={true}
                        radiusKm={targetRadius}
                        onLocationSelect={(lat, lng) => { setTargetLat(lat); setTargetLng(lng); }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">
                        نطاق التنبيه: <span className="text-accent font-bold">{targetRadius} كم</span>
                      </label>
                      <input
                        type="range" min={1} max={100} value={targetRadius}
                        onChange={(e) => setTargetRadius(Number(e.target.value))}
                        className="w-full accent-[hsl(var(--accent))]"
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>1 كم</span><span>100 كم</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Category */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">نوع التنبيه</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {categoryEntries.map(([key, { label, icon: Icon }]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedCategory(key)}
                        className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border text-[11px] font-medium transition-all active:scale-95 ${
                          selectedCategory === key
                            ? "border-accent bg-accent/10 text-foreground"
                            : "border-border bg-card text-muted-foreground hover:border-accent/50"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Severity */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">مستوى الخطورة</label>
                  <div className="flex gap-2 flex-wrap">
                    {severityEntries.map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedSeverity(key)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all active:scale-95 severity-${key} ${
                          selectedSeverity === key ? "ring-2 ring-offset-1 ring-offset-background ring-current" : "opacity-60"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">عنوان التنبيه</label>
                  <input
                    type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                    placeholder="أدخل عنوان التنبيه..."
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">تفاصيل التنبيه</label>
                  <textarea
                    value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                    placeholder="أدخل تفاصيل التنبيه والإرشادات للمواطنين..."
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
                  />
                </div>

                {/* Location label */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    <MapPin className="w-3 h-3 inline ml-1" />
                    وصف المنطقة (اختياري)
                  </label>
                  <input
                    type="text" value={locationLabel} onChange={(e) => setLocationLabel(e.target.value)}
                    placeholder="مثال: الرمادي - وسط المدينة"
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>

                {sendResult && (
                  <p className={`text-sm px-3 py-2 rounded-lg ${sendResult.ok ? 'text-success bg-success/10' : 'text-destructive bg-destructive/10'}`}>
                    {sendResult.msg}
                  </p>
                )}

                <button
                  onClick={handleSend} disabled={sending}
                  className="w-full bg-destructive text-destructive-foreground py-3 rounded-lg text-sm font-bold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {sending ? 'جاري الإرسال...' : 'إرسال التنبيه فوراً'}
                </button>
              </div>
            </section>
          )}

          {/* ========== MANAGE ALERTS SECTION ========== */}
          {section === 'alerts' && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-foreground">جميع التنبيهات ({alerts.length})</h2>
                <button onClick={() => setSection('create')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-accent-foreground text-xs font-bold hover:opacity-90 transition-all">
                  <Plus className="w-3.5 h-3.5" />
                  تنبيه جديد
                </button>
              </div>
              {alerts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">لا توجد تنبيهات</p>
              ) : (
                alerts.map((alert) => (
                  <div key={alert.id} className="relative group">
                    <AlertCard alert={alert} />
                    {alert.is_active && (
                      <button
                        onClick={() => handleDelete(alert.id)}
                        className="absolute top-3 left-3 p-1.5 rounded-lg bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20"
                        title="إلغاء التنبيه"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </section>
          )}

          {/* ========== USERS SECTION ========== */}
          {section === 'users' && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-foreground">المستخدمون المسجلون ({users.length})</h2>
                <button
                  onClick={() => { setShowAddUser(!showAddUser); setAddUserResult(null); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-accent-foreground text-xs font-bold hover:opacity-90 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  إضافة مستخدم
                </button>
              </div>

              {/* Add user form */}
              {showAddUser && (
                <div className="bg-card border border-accent/30 rounded-xl p-4 space-y-3">
                  <h3 className="text-sm font-bold text-foreground">إضافة مستخدم جديد</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder="الاسم الكامل"
                      className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />
                    <div className="flex rounded-lg border border-input bg-background overflow-hidden focus-within:ring-2 focus-within:ring-accent/50" dir="ltr">
                      <span className="flex items-center justify-center px-2 bg-muted border-r border-input text-xs font-bold text-muted-foreground select-none">07</span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        value={newUserPhone}
                        onChange={(e) => setNewUserPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                        placeholder="8xxxxxxxx"
                        className="flex-1 px-2 py-2 bg-transparent text-foreground text-sm placeholder:text-muted-foreground focus:outline-none text-left"
                      />
                    </div>
                    <select
                      value={newUserCity}
                      onChange={(e) => setNewUserCity(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                    >
                      <option value="">اختر المدينة...</option>
                      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  {addUserResult && (
                    <p className={`text-xs px-3 py-2 rounded-lg ${addUserResult.ok ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'}`}>
                      {addUserResult.msg}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddUser}
                      disabled={addUserLoading}
                      className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-xs font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {addUserLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                      {addUserLoading ? 'جاري الإضافة...' : 'إضافة'}
                    </button>
                    <button
                      onClick={() => setShowAddUser(false)}
                      className="px-4 py-2 rounded-lg bg-muted text-muted-foreground text-xs font-bold hover:bg-muted/80"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}

              {/* City filter chips */}
              {stats.cityCounts.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="w-4 h-4 text-accent" />
                    <span className="text-xs font-bold text-foreground">تصفية حسب المدينة</span>
                    {filterCities.length > 0 && (
                      <button
                        onClick={() => setFilterCities([])}
                        className="mr-auto text-[10px] text-destructive hover:underline"
                      >
                        مسح الفلتر
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {stats.cityCounts.map(({ city, count }) => (
                      <button
                        key={city}
                        onClick={() => toggleFilterCity(city)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all active:scale-95 ${
                          filterCities.includes(city)
                            ? 'border-accent bg-accent/20 text-accent'
                            : 'border-border bg-card text-muted-foreground hover:border-accent/50'
                        }`}
                      >
                        {city}: {count}
                      </button>
                    ))}
                  </div>
                  {filterCities.length > 0 && (
                    <p className="text-[10px] text-muted-foreground mt-2">
                      عرض {filteredUsers.length} من {users.length} مستخدم
                    </p>
                  )}
                </div>
              )}

              {/* Users map in users section */}
              {filteredUsers.some(u => u.lat && u.lng) && (
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                    <Map className="w-4 h-4 text-accent" />
                    <span className="text-xs font-bold text-foreground">مواقع المستخدمين على الخريطة</span>
                    <span className="mr-auto text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {filteredUsers.filter(u => u.lat && u.lng).length} مستخدم
                    </span>
                  </div>
                  <div className="h-72">
                    <LocationMap
                      key={filterCities.join(',')}
                      lat={33.42}
                      lng={43.31}
                      markers={filteredUsers.filter(u => u.lat && u.lng).map(u => ({ lat: u.lat, lng: u.lng, name: u.name, city: u.city }))}
                      className="w-full h-full"
                    />
                  </div>
                </div>
              )}

              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground">الاسم</th>
                        <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground">الهاتف</th>
                        <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground">المدينة</th>
                        <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground">آخر ظهور</th>
                        <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(u => (
                        <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-2.5 text-foreground font-medium">{u.name}</td>
                          <td className="px-4 py-2.5 text-muted-foreground" dir="ltr">{u.phone}</td>
                          <td className="px-4 py-2.5 text-muted-foreground">{u.city}</td>
                          <td className="px-4 py-2.5 text-muted-foreground text-xs">
                            {u.last_seen ? new Date(u.last_seen).toLocaleString('ar-IQ') : '—'}
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  setSection('messages');
                                  setMsgTargetType('user');
                                  setMsgTargetUserId(u.id);
                                  setMsgTitle(`رسالة إلى ${u.name}`);
                                }}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-accent/10 text-accent text-[11px] font-bold hover:bg-accent/20 transition-colors"
                              >
                                <Mail className="w-3 h-3" />
                                مراسلة
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.id, u.name)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-destructive/10 text-destructive text-[11px] font-bold hover:bg-destructive/20 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                                حذف
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                            {filterCities.length > 0 ? 'لا يوجد مستخدمون في المدن المحددة' : 'لا يوجد مستخدمون مسجلون'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* ========== INQUIRIES SECTION ========== */}
          {section === 'inquiries' && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-accent" />
                  استفسارات المستخدمين ({inquiries.length})
                </h2>
                {pendingInquiries > 0 && (
                  <span className="px-2.5 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-bold">
                    {pendingInquiries} بانتظار الرد
                  </span>
                )}
              </div>

              {inquiries.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">لا توجد استفسارات</p>
              ) : (
                inquiries.map(inq => (
                  <div key={inq.id} className={`bg-card border rounded-xl p-4 space-y-3 ${inq.status === 'pending' ? 'border-amber-500/30' : 'border-border'}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-foreground">{inq.subject}</h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {inq.user_name} • {inq.user_phone} • {inq.user_city}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          inq.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        }`}>
                          {inq.status === 'pending' ? 'بانتظار الرد' : 'تم الرد'}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(inq.created_at).toLocaleDateString('ar-IQ')}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-foreground leading-relaxed bg-muted/30 rounded-lg p-3">{inq.message}</p>

                    {inq.admin_reply && (
                      <div className="bg-accent/5 border border-accent/20 rounded-lg p-3">
                        <p className="text-[10px] text-accent font-bold mb-1">ردك:</p>
                        <p className="text-xs text-foreground">{inq.admin_reply}</p>
                      </div>
                    )}

                    {inq.status === 'pending' && (
                      replyingTo === inq.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={replyText} onChange={e => setReplyText(e.target.value)} rows={3}
                            placeholder="اكتب ردك هنا..."
                            className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleReply(inq.id)} disabled={replyLoading}
                              className="flex-1 bg-accent text-accent-foreground py-2 rounded-lg text-xs font-bold hover:opacity-90 flex items-center justify-center gap-1.5 disabled:opacity-50"
                            >
                              {replyLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                              إرسال الرد
                            </button>
                            <button onClick={() => { setReplyingTo(null); setReplyText(''); }} className="px-4 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground">
                              إلغاء
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setReplyingTo(inq.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-xs font-bold hover:bg-accent/20 transition-colors"
                        >
                          <Reply className="w-3.5 h-3.5" />
                          الرد على الاستفسار
                        </button>
                      )
                    )}
                  </div>
                ))
              )}
            </section>
          )}

          {/* ========== REPORTS SECTION ========== */}
          {section === 'reports' && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  بلاغات المستخدمين ({reports.length})
                </h2>
                {pendingReports > 0 && (
                  <span className="px-2.5 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-bold">
                    {pendingReports} بانتظار المراجعة
                  </span>
                )}
              </div>

              {reports.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">لا توجد بلاغات</p>
              ) : (
                reports.map(rep => (
                  <div key={rep.id} className={`bg-card border rounded-xl p-4 space-y-3 ${rep.status === 'pending' ? 'border-destructive/30' : 'border-border'}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-foreground">{rep.title}</h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {rep.user_name} • {rep.user_city}
                          {rep.location_label && <> • <MapPin className="w-3 h-3 inline" /> {rep.location_label}</>}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          rep.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          : rep.status === 'reviewed' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                          : rep.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
                        }`}>
                          {rep.status === 'pending' ? 'قيد المراجعة' : rep.status === 'reviewed' ? 'تمت المراجعة' : rep.status === 'resolved' ? 'تم الحل' : 'مرفوض'}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(rep.created_at).toLocaleDateString('ar-IQ')}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-foreground leading-relaxed bg-muted/30 rounded-lg p-3">{rep.description}</p>

                    {rep.status === 'pending' && (
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleReportStatus(rep.id, 'reviewed')}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-500 text-xs font-bold hover:bg-blue-500/20"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          تمت المراجعة
                        </button>
                        <button
                          onClick={() => handleReportStatus(rep.id, 'resolved')}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-bold hover:bg-emerald-500/20"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          تم الحل
                        </button>
                        <button
                          onClick={() => handleReportStatus(rep.id, 'dismissed')}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-500/10 text-zinc-500 text-xs font-bold hover:bg-zinc-500/20"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          رفض
                        </button>
                        <button
                          onClick={() => {
                            setSection('create');
                            setTitle(rep.title);
                            setDescription(rep.description);
                            setLocationLabel(rep.location_label || '');
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-bold hover:bg-destructive/20"
                        >
                          <Megaphone className="w-3.5 h-3.5" />
                          تحويل لتنبيه
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </section>
          )}

          {/* ========== MESSAGES SECTION ========== */}
          {section === 'messages' && (
            <section className="space-y-6">
              {/* Send message form */}
              <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4 text-accent" />
                  إرسال رسالة للمستخدمين
                </h2>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">الجهة المستهدفة</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'all' as const, label: 'جميع المستخدمين', icon: Megaphone },
                      { key: 'city' as const, label: 'مدينة محددة', icon: Building2 },
                      { key: 'user' as const, label: 'مستخدم محدد', icon: Users },
                    ].map(t => (
                      <button
                        key={t.key}
                        onClick={() => setMsgTargetType(t.key)}
                        className={`flex flex-col items-center gap-1 p-3 rounded-lg border text-xs font-medium transition-all ${
                          msgTargetType === t.key
                            ? 'border-accent bg-accent/10 text-foreground'
                            : 'border-border text-muted-foreground hover:border-accent/50'
                        }`}
                      >
                        <t.icon className="w-4 h-4" />
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {msgTargetType === 'city' && (
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2">المدينة</label>
                    <div className="flex flex-wrap gap-2">
                      {CITIES.map(c => (
                        <button
                          key={c}
                          onClick={() => setMsgTargetCity(c)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                            msgTargetCity === c
                              ? 'border-accent bg-accent/20 text-accent'
                              : 'border-border text-muted-foreground hover:border-accent/50'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {msgTargetType === 'user' && (
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2">اختر المستخدم</label>
                    <select
                      value={msgTargetUserId || ''}
                      onChange={e => setMsgTargetUserId(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                    >
                      <option value="">اختر مستخدم...</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name} — {u.phone} ({u.city})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">عنوان الرسالة</label>
                  <input
                    type="text" value={msgTitle} onChange={e => setMsgTitle(e.target.value)}
                    placeholder="عنوان الرسالة..."
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">محتوى الرسالة</label>
                  <textarea
                    value={msgContent} onChange={e => setMsgContent(e.target.value)} rows={4}
                    placeholder="اكتب محتوى الرسالة..."
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
                  />
                </div>

                {msgResult && (
                  <p className={`text-sm px-3 py-2 rounded-lg ${msgResult.ok ? 'text-success bg-success/10' : 'text-destructive bg-destructive/10'}`}>
                    {msgResult.msg}
                  </p>
                )}

                <button
                  onClick={handleSendMessage} disabled={msgLoading}
                  className="w-full bg-accent text-accent-foreground py-3 rounded-lg text-sm font-bold hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {msgLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {msgLoading ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                </button>
              </div>

              {/* Sent messages log */}
              {sentMessages.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-foreground">الرسائل المرسلة ({sentMessages.length})</h3>
                  {sentMessages.map(msg => (
                    <div key={msg.id} className="bg-card border border-border rounded-xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-bold text-foreground">{msg.title}</h4>
                        <span className="text-[10px] text-muted-foreground shrink-0 mr-2">
                          {new Date(msg.created_at).toLocaleDateString('ar-IQ')}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{msg.content}</p>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        msg.target_type === 'all' ? 'bg-accent/10 text-accent' :
                        msg.target_type === 'city' ? 'bg-blue-500/10 text-blue-500' :
                        'bg-amber-500/10 text-amber-500'
                      }`}>
                        {msg.target_type === 'all' ? 'للجميع' :
                         msg.target_type === 'city' ? `مدينة: ${msg.target_city}` :
                         `مستخدم #${msg.target_user_id}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ========== ADMIN MANAGEMENT SECTION ========== */}
          {section === 'admin-mgmt' && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Shield className="w-4 h-4 text-accent" />
                  إدارة المدراء ({admins.length})
                </h2>
                <button
                  onClick={() => { setShowAddAdmin(!showAddAdmin); setAddAdminResult(null); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-accent-foreground text-xs font-bold hover:opacity-90 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  إضافة مدير
                </button>
              </div>

              {/* Add admin form */}
              {showAddAdmin && (
                <div className="bg-card border border-accent/30 rounded-xl p-4 space-y-3">
                  <h3 className="text-sm font-bold text-foreground">إضافة مدير جديد</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={newAdminName}
                      onChange={(e) => setNewAdminName(e.target.value)}
                      placeholder="اسم المدير"
                      className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />
                    <input
                      type="email"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      placeholder="البريد الإلكتروني"
                      dir="ltr"
                      className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />
                    <input
                      type="password"
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      placeholder="كلمة المرور (6 أحرف+)"
                      dir="ltr"
                      className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />
                  </div>
                  {addAdminResult && (
                    <p className={`text-xs px-3 py-2 rounded-lg ${addAdminResult.ok ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'}`}>
                      {addAdminResult.msg}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddAdmin}
                      disabled={addAdminLoading}
                      className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-xs font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {addAdminLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5" />}
                      {addAdminLoading ? 'جاري الإضافة...' : 'إضافة مدير'}
                    </button>
                    <button
                      onClick={() => setShowAddAdmin(false)}
                      className="px-4 py-2 rounded-lg bg-muted text-muted-foreground text-xs font-bold hover:bg-muted/80"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}

              {/* Env-based admin info */}
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-foreground">المدير الرئيسي (بيئة النظام)</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  البريد: <span className="text-foreground font-mono" dir="ltr">admin@iraq.com</span> — هذا المدير لا يمكن حذفه أو تعديله
                </p>
              </div>

              {/* Admins table */}
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground">الاسم</th>
                        <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground">البريد</th>
                        <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground">تاريخ الإنشاء</th>
                        <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground">آخر تسجيل دخول</th>
                        <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {admins.map(a => (
                        <tr key={a.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-2.5 text-foreground font-medium">{a.name}</td>
                          <td className="px-4 py-2.5 text-muted-foreground" dir="ltr">{a.phone}</td>
                          <td className="px-4 py-2.5 text-muted-foreground text-xs">
                            {a.created_at ? new Date(a.created_at).toLocaleDateString('ar-IQ') : '—'}
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground text-xs">
                            {a.last_seen ? new Date(a.last_seen).toLocaleString('ar-IQ') : '—'}
                          </td>
                          <td className="px-4 py-2.5">
                            <button
                              onClick={() => handleDeleteAdmin(a.id, a.name)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-destructive/10 text-destructive text-[11px] font-bold hover:bg-destructive/20 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                              حذف
                            </button>
                          </td>
                        </tr>
                      ))}
                      {admins.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">لا يوجد مدراء إضافيون</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
