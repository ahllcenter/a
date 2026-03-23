import { useState, useEffect } from 'react';
import {
  MessageSquare, AlertTriangle, Send, Loader2, CheckCircle2,
  Clock, ChevronDown, ChevronUp, MapPin, RefreshCw
} from 'lucide-react';
import AppHeader from '@/components/citizen/AppHeader';
import { submitInquiry, getMyInquiries, submitReport, getMyReports, getMyMessages } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const REPORT_TYPES = [
  { key: 'security', label: 'تهديد أمني', icon: '🔴' },
  { key: 'infrastructure', label: 'ضرر بالبنية التحتية', icon: '🏗️' },
  { key: 'flood', label: 'فيضان / سيول', icon: '🌊' },
  { key: 'fire', label: 'حريق', icon: '🔥' },
  { key: 'medical', label: 'حالة طبية طارئة', icon: '🏥' },
  { key: 'road', label: 'إغلاق طريق', icon: '🚧' },
  { key: 'other', label: 'أخرى', icon: '📋' },
];

const ContactReports = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'inquiry' | 'report' | 'messages' | 'history'>('inquiry');

  // Inquiry form
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [inquiryResult, setInquiryResult] = useState<{ ok: boolean; msg: string } | null>(null);

  // Report form
  const [reportType, setReportType] = useState('security');
  const [reportTitle, setReportTitle] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  const [reportLocation, setReportLocation] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportResult, setReportResult] = useState<{ ok: boolean; msg: string } | null>(null);

  // History
  const [myInquiries, setMyInquiries] = useState<any[]>([]);
  const [myReports, setMyReports] = useState<any[]>([]);
  const [myMessages, setMyMessages] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const [inqRes, repRes, msgRes] = await Promise.all([
        getMyInquiries(), getMyReports(), getMyMessages()
      ]);
      setMyInquiries(inqRes.data.inquiries || []);
      setMyReports(repRes.data.reports || []);
      setMyMessages(msgRes.data.messages || []);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleInquiry = async () => {
    if (!subject.trim() || !message.trim()) {
      setInquiryResult({ ok: false, msg: 'يرجى ملء جميع الحقول' });
      return;
    }
    setInquiryLoading(true);
    setInquiryResult(null);
    try {
      await submitInquiry({ subject: subject.trim(), message: message.trim() });
      setInquiryResult({ ok: true, msg: 'تم إرسال استفسارك بنجاح! ستتلقى الرد قريباً' });
      setSubject('');
      setMessage('');
      fetchHistory();
    } catch (err: any) {
      setInquiryResult({ ok: false, msg: err.response?.data?.error || 'فشل إرسال الاستفسار' });
    } finally {
      setInquiryLoading(false);
    }
  };

  const handleReport = async () => {
    if (!reportTitle.trim() || !reportDesc.trim()) {
      setReportResult({ ok: false, msg: 'يرجى ملء العنوان والوصف' });
      return;
    }
    setReportLoading(true);
    setReportResult(null);
    try {
      await submitReport({
        report_type: reportType,
        title: reportTitle.trim(),
        description: reportDesc.trim(),
        location_label: reportLocation.trim() || undefined,
      });
      setReportResult({ ok: true, msg: 'تم إرسال البلاغ! سيتم مراجعته من قبل الإدارة' });
      setReportTitle('');
      setReportDesc('');
      setReportLocation('');
      fetchHistory();
    } catch (err: any) {
      setReportResult({ ok: false, msg: err.response?.data?.error || 'فشل إرسال البلاغ' });
    } finally {
      setReportLoading(false);
    }
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      replied: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      reviewed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      resolved: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      dismissed: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20',
    };
    const labels: Record<string, string> = {
      pending: 'قيد المراجعة',
      replied: 'تم الرد',
      reviewed: 'تمت المراجعة',
      resolved: 'تم الحل',
      dismissed: 'مرفوض',
    };
    return (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20" dir="rtl">
      <AppHeader />
      <main className="container max-w-lg mx-auto px-4 py-5 space-y-4">
        <h2 className="text-lg font-extrabold text-foreground flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-accent" />
          تواصل معنا
        </h2>

        {/* Tabs */}
        <div className="flex gap-1 bg-card border border-border rounded-xl p-1.5">
          {[
            { key: 'inquiry' as const, label: 'استفسار', icon: MessageSquare },
            { key: 'report' as const, label: 'بلاغ', icon: AlertTriangle },
            { key: 'messages' as const, label: `الرسائل (${myMessages.length})`, icon: Send },
            { key: 'history' as const, label: 'سجلّي', icon: Clock },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-[11px] font-bold transition-all ${
                activeTab === tab.key
                  ? 'bg-accent text-accent-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ===== INQUIRY TAB ===== */}
        {activeTab === 'inquiry' && (
          <div className="bg-card border border-border rounded-xl p-5 space-y-4 animate-fade-up">
            <div>
              <h3 className="text-sm font-bold text-foreground mb-1">إرسال استفسار</h3>
              <p className="text-[11px] text-muted-foreground">أرسل سؤالك أو ملاحظتك وسيرد فريق الإدارة في أقرب وقت</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">الموضوع</label>
              <input
                type="text" value={subject} onChange={e => setSubject(e.target.value)}
                placeholder="مثال: استفسار عن خدمات المياه"
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">الرسالة</label>
              <textarea
                value={message} onChange={e => setMessage(e.target.value)} rows={4}
                placeholder="اكتب استفسارك هنا بالتفصيل..."
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
              />
            </div>

            {inquiryResult && (
              <p className={`text-sm px-3 py-2 rounded-lg ${inquiryResult.ok ? 'text-success bg-success/10' : 'text-destructive bg-destructive/10'}`}>
                {inquiryResult.msg}
              </p>
            )}

            <button
              onClick={handleInquiry} disabled={inquiryLoading}
              className="w-full bg-accent text-accent-foreground py-3 rounded-lg text-sm font-bold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {inquiryLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {inquiryLoading ? 'جاري الإرسال...' : 'إرسال الاستفسار'}
            </button>
          </div>
        )}

        {/* ===== REPORT TAB ===== */}
        {activeTab === 'report' && (
          <div className="bg-card border border-border rounded-xl p-5 space-y-4 animate-fade-up">
            <div>
              <h3 className="text-sm font-bold text-foreground mb-1">الإبلاغ عن حادثة</h3>
              <p className="text-[11px] text-muted-foreground">بلّغ عن أي حادثة تستوجب التنبيه لتتم مراجعتها وإرسال تنبيه للمنطقة</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2">نوع البلاغ</label>
              <div className="grid grid-cols-2 gap-2">
                {REPORT_TYPES.map(rt => (
                  <button
                    key={rt.key}
                    onClick={() => setReportType(rt.key)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all ${
                      reportType === rt.key
                        ? 'border-accent bg-accent/10 text-foreground'
                        : 'border-border text-muted-foreground hover:border-accent/50'
                    }`}
                  >
                    <span>{rt.icon}</span>
                    {rt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">عنوان البلاغ</label>
              <input
                type="text" value={reportTitle} onChange={e => setReportTitle(e.target.value)}
                placeholder="مثال: انقطاع مياه في حي المعلمين"
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">تفاصيل البلاغ</label>
              <textarea
                value={reportDesc} onChange={e => setReportDesc(e.target.value)} rows={4}
                placeholder="اشرح الحادثة بالتفصيل..."
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                <MapPin className="w-3 h-3 inline ml-1" />
                الموقع (اختياري)
              </label>
              <input
                type="text" value={reportLocation} onChange={e => setReportLocation(e.target.value)}
                placeholder="مثال: الرمادي - حي الملعب"
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>

            {reportResult && (
              <p className={`text-sm px-3 py-2 rounded-lg ${reportResult.ok ? 'text-success bg-success/10' : 'text-destructive bg-destructive/10'}`}>
                {reportResult.msg}
              </p>
            )}

            <button
              onClick={handleReport} disabled={reportLoading}
              className="w-full bg-destructive text-destructive-foreground py-3 rounded-lg text-sm font-bold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {reportLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
              {reportLoading ? 'جاري الإرسال...' : 'إرسال البلاغ'}
            </button>
          </div>
        )}

        {/* ===== MESSAGES TAB ===== */}
        {activeTab === 'messages' && (
          <div className="space-y-3 animate-fade-up">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">رسائل من الإدارة</h3>
              <button onClick={fetchHistory} className="p-1.5 text-muted-foreground hover:text-foreground">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            {myMessages.length === 0 ? (
              <div className="text-center py-12">
                <Send className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">لا توجد رسائل حالياً</p>
              </div>
            ) : (
              myMessages.map(msg => (
                <div key={msg.id} className="bg-card border border-border rounded-xl p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="text-sm font-bold text-foreground">{msg.title}</h4>
                    <span className="text-[10px] text-muted-foreground shrink-0 mr-2">
                      {new Date(msg.created_at).toLocaleDateString('ar-IQ')}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{msg.content}</p>
                  {msg.target_type === 'city' && (
                    <span className="inline-flex text-[10px] text-accent bg-accent/10 px-2 py-0.5 rounded-full">{msg.target_city}</span>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ===== HISTORY TAB ===== */}
        {activeTab === 'history' && (
          <div className="space-y-4 animate-fade-up">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">سجل الاستفسارات والبلاغات</h3>
              <button onClick={fetchHistory} disabled={historyLoading} className="p-1.5 text-muted-foreground hover:text-foreground">
                <RefreshCw className={`w-4 h-4 ${historyLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Inquiries */}
            {myInquiries.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  استفساراتي ({myInquiries.length})
                </h4>
                <div className="space-y-2">
                  {myInquiries.map(inq => (
                    <div key={inq.id} className="bg-card border border-border rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedItem(expandedItem === `inq-${inq.id}` ? null : `inq-${inq.id}`)}
                        className="w-full flex items-center justify-between px-4 py-3 text-right"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">{inq.subject}</p>
                          <p className="text-[10px] text-muted-foreground">{new Date(inq.created_at).toLocaleDateString('ar-IQ')}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 mr-2">
                          {statusBadge(inq.status)}
                          {expandedItem === `inq-${inq.id}` ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                        </div>
                      </button>
                      {expandedItem === `inq-${inq.id}` && (
                        <div className="px-4 pb-4 pt-1 border-t border-border space-y-2">
                          <p className="text-xs text-foreground leading-relaxed">{inq.message}</p>
                          {inq.admin_reply && (
                            <div className="bg-accent/5 border border-accent/20 rounded-lg p-3 mt-2">
                              <p className="text-[10px] text-accent font-bold mb-1">رد الإدارة:</p>
                              <p className="text-xs text-foreground leading-relaxed">{inq.admin_reply}</p>
                              {inq.replied_at && (
                                <p className="text-[10px] text-muted-foreground mt-1">{new Date(inq.replied_at).toLocaleString('ar-IQ')}</p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reports */}
            {myReports.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  بلاغاتي ({myReports.length})
                </h4>
                <div className="space-y-2">
                  {myReports.map(rep => (
                    <div key={rep.id} className="bg-card border border-border rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedItem(expandedItem === `rep-${rep.id}` ? null : `rep-${rep.id}`)}
                        className="w-full flex items-center justify-between px-4 py-3 text-right"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">{rep.title}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {REPORT_TYPES.find(r => r.key === rep.report_type)?.label || rep.report_type}
                            {' • '}
                            {new Date(rep.created_at).toLocaleDateString('ar-IQ')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 mr-2">
                          {statusBadge(rep.status)}
                          {expandedItem === `rep-${rep.id}` ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                        </div>
                      </button>
                      {expandedItem === `rep-${rep.id}` && (
                        <div className="px-4 pb-4 pt-1 border-t border-border space-y-2">
                          <p className="text-xs text-foreground leading-relaxed">{rep.description}</p>
                          {rep.location_label && (
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {rep.location_label}
                            </p>
                          )}
                          {rep.admin_notes && (
                            <div className="bg-accent/5 border border-accent/20 rounded-lg p-3 mt-2">
                              <p className="text-[10px] text-accent font-bold mb-1">ملاحظات الإدارة:</p>
                              <p className="text-xs text-foreground leading-relaxed">{rep.admin_notes}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {myInquiries.length === 0 && myReports.length === 0 && (
              <div className="text-center py-12">
                <Clock className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">لا توجد استفسارات أو بلاغات سابقة</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ContactReports;
