import React, { useState } from 'react';
import { AppState, store } from '../../services/store';
import { SMSLog, AuditLog } from '../../types/database';
import {
  ShieldCheck,
  MessageSquare,
  Lock,
  Clock,
  Send,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck,
  RotateCcw,
} from 'lucide-react';

interface Props {
  state: AppState;
}

export const AuditAndSmsModal: React.FC<Props> = ({ state }) => {
  const [activeSubTab, setActiveSubTab] = useState<'sms' | 'audit' | 'compliance'>('sms');
  const [testPhone, setTestPhone] = useState('+966501234567');
  const [testMessage, setTestMessage] = useState('مختبرات MediLab: تنبيه تجريبي لرسائل الـ SMS الآلية.');

  const handleSendTestSMS = (e: React.FormEvent) => {
    e.preventDefault();
    store.sendSMS('pat-101', testPhone, testMessage, 'appointment_reminder');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-lg shadow-teal-600/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {state.language === 'ar' ? 'سجل رسائل SMS والامتثال الطبي والأمان (HIPAA)' : 'Security, Audit Trail & SMS Logs'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200">
                AES-256 Enforced
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {state.language === 'ar'
                ? 'توثيق غير قابل للتعديل لجميع العمليات المعملية، وسجل الرسائل النصية القصيرة، والتحقق الأمني'
                : 'Tamper-evident audit ledger and automated SMS delivery logs'}
            </p>
          </div>
        </div>

        {/* Sub-tab pills */}
        <div className="flex items-center rounded-2xl bg-slate-100 dark:bg-slate-800 p-1.5 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveSubTab('sms')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeSubTab === 'sms'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{state.language === 'ar' ? 'سجل الـ SMS' : 'SMS Logs'}</span>
            <span className="font-mono text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.2 rounded-md">
              {state.smsLogs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('audit')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeSubTab === 'audit'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{state.language === 'ar' ? 'سجل الأمان الطبي (Audit)' : 'Audit Trail'}</span>
            <span className="font-mono text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.2 rounded-md">
              {state.auditLogs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('compliance')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeSubTab === 'compliance'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>{state.language === 'ar' ? 'معايير الامتثال' : 'Compliance'}</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: SMS LOGS & SIMULATION */}
      {activeSubTab === 'sms' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          {/* SMS Logs Table (8 cols) */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {state.language === 'ar' ? 'الرسائل النصية المرسلة للمرضى (Twilio / Unifonic Gateway)' : 'Outgoing SMS Message Gateway'}
              </h2>
            </div>

            <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
              {state.smsLogs.map((sms) => (
                <div
                  key={sms.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2 hover:border-teal-500/40 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                        {sms.patientName}
                      </span>
                      <span className="text-[11px] font-mono-numbers text-slate-500">{sms.phone}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {sms.status === 'delivered' ? 'تم التسليم ✓' : sms.status}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{sms.sentAt}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 font-sans leading-relaxed">
                    "{sms.messageText}"
                  </p>

                  {sms.verificationPin && (
                    <div className="flex items-center gap-2 text-[11px] text-teal-700 dark:text-teal-300">
                      <Lock className="w-3.5 h-3.5" />
                      <span>رمز التحقق لفتح التقرير المشفر (PIN):</span>
                      <span className="font-mono-numbers font-black px-2 py-0.5 bg-teal-100 dark:bg-teal-950 rounded-md">
                        {sms.verificationPin}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Realistic Smartphone SMS Preview & Test Sender (4 cols) */}
          <div className="lg:col-span-4 bg-slate-950 text-white rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center gap-2 pb-4 border-b border-slate-800 text-teal-400 font-bold text-sm">
                <Smartphone className="w-5 h-5" />
                <span>{state.language === 'ar' ? 'محاكاة شاشة هاتف المريض' : 'Patient Mobile Preview'}</span>
              </div>

              {/* iPhone screen mockup */}
              <div className="mt-4 bg-slate-900 rounded-3xl p-4 border-4 border-slate-800 shadow-2xl space-y-3">
                <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto" />
                <div className="text-center text-[10px] text-slate-400">
                  اليوم • رسالة نصية قصيرة (SMS)
                </div>

                {state.smsLogs.slice(0, 2).map((sms) => (
                  <div
                    key={sms.id}
                    className="p-3 rounded-2xl bg-teal-900/60 text-white text-xs leading-relaxed border border-teal-700/40"
                  >
                    <div className="font-bold text-[10px] text-teal-300 mb-1">MediLab-KSA</div>
                    {sms.messageText}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Test SMS Sender */}
            <form onSubmit={handleSendTestSMS} className="space-y-3 pt-3 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-300 block">
                {state.language === 'ar' ? 'اختبار إرسال رسالة SMS فورية:' : 'Test SMS Gateway:'}
              </span>
              <input
                type="text"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="+966500000000"
                className="w-full text-xs p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono-numbers"
              />
              <textarea
                rows={2}
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{state.language === 'ar' ? 'إرسال الرسالة الآن' : 'Dispatch SMS'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: AUDIT TRAIL */}
      {activeSubTab === 'audit' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {state.language === 'ar' ? 'سجل التدقيق الأمني والامتثال (Medical Audit Trail)' : 'Security Audit Trail'}
              </h2>
              <p className="text-xs text-slate-500">
                {state.language === 'ar'
                  ? 'تسجيل غير قابل للحذف لجميع عمليات استعراض وتعديل واعتماد السجلات الطبية'
                  : 'Immutable record of clinical actions, approvals, and queries'}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold">
                  <th className="py-2.5 px-3 text-start">الوقت الزمني</th>
                  <th className="py-2.5 px-3 text-start">المستخدم والدور</th>
                  <th className="py-2.5 px-3 text-start">الإجراء المتخذ</th>
                  <th className="py-2.5 px-3 text-start">التفاصيل المعملية</th>
                  <th className="py-2.5 px-3 text-start">عنوان الـ IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {state.auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 dark:text-white">{log.userName}</div>
                      <span className="text-[10px] text-teal-600 font-semibold">{log.userRole}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 font-mono text-slate-700 dark:text-slate-300">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300">{log.details}</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-400">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: COMPLIANCE STATUS */}
      {activeSubTab === 'compliance' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
          {/* Card 1 */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-600 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {state.language === 'ar' ? 'تشفير كامل أثناء النقل والتخزين' : 'End-to-End Encryption'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {state.language === 'ar'
                ? 'تشفير TLS 1.3 لجميع الاتصالات بين الأجهزة والخادم، مع تشفير AES-256 للبيانات الحساسة وأرقام الهويات الوطنية في قاعدة البيانات.'
                : 'TLS 1.3 transit encryption and AES-256 encryption at rest for patient identifiers.'}
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{state.language === 'ar' ? 'مفعل ومتطابق مع الأنظمة' : 'Enforced'}</span>
            </span>
          </div>

          {/* Card 2 */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-600 flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {state.language === 'ar' ? 'التحكم بالوصول القائم على الأدوار (RBAC)' : 'Role-Based Access Control'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {state.language === 'ar'
                ? 'فصل الصلاحيات بدقة: الفني يدخل القياسات، الاستشاري فقط هو المخول بالاعتماد والتوقيع، والمريض يطلع على فحوصاته الخاصة برقم سري.'
                : 'Strict segregation of duties between lab techs, phlebotomists, and certifying doctors.'}
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{state.language === 'ar' ? 'مطبق ومعتمد' : 'Compliant'}</span>
            </span>
          </div>

          {/* Card 3 */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {state.language === 'ar' ? 'الاعتماد الدولي ISO 15189' : 'ISO 15189 Accreditation'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {state.language === 'ar'
                ? 'تطبيق آليات ضبط الجودة المعملية (IQC/EQA) مع التحقق المقارن الآلي (Delta Check) لمنع الأخطاء التحليلية وتجاوزات النطاق.'
                : 'Standardized reference intervals and delta checking protocols compliant with ISO 15189.'}
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{state.language === 'ar' ? 'معتمد وفق المواصفات' : 'Accredited'}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
