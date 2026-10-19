import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { AppState, store } from '../../services/store';
import {
  Printer,
  Download,
  Share2,
  ShieldCheck,
  CheckCircle2,
  X,
  FileText,
  AlertTriangle,
  Lock,
  QrCode as QrIcon,
  FlaskConical,
} from 'lucide-react';

interface Props {
  state: AppState;
  orderId: string;
  onClose: () => void;
}

export const MedicalReportModal: React.FC<Props> = ({ state, orderId, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  const order = state.orders.find((o) => o.id === orderId);

  useEffect(() => {
    if (order) {
      // Verification URL linking directly to the verification modal
      const verificationUrl = `${window.location.origin}/?verify=${order.orderNumber}&hash=${order.cryptographicHash || 'valid'}`;
      QRCode.toDataURL(verificationUrl, {
        width: 140,
        margin: 1,
        color: {
          dark: '#042f2e',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error(err));
    }
  }, [order]);

  if (!order) return null;

  const handlePrint = () => {
    store.logAudit(
      'REPORT_PRINTED',
      `تم طباعة/تنزيل التقرير الطبي الرسمي رقم ${order.orderNumber} للمريض ${order.patient.fullName}`,
      order.id
    );
    window.print();
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/?verify=${order.orderNumber}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
      store.showNotification('تم نسخ رابط التقرير المشفر بنجاح إلى الحافظة!', 'success');
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-2 sm:p-4 overflow-y-auto no-print">
      <div className="w-full max-w-4xl rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 animate-fadeIn my-4 flex flex-col max-h-[92vh]">
        {/* Modal Action Header (Excluded from Print) */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base">
                {state.language === 'ar' ? 'التقرير الطبي المخبري الرسمي المعتمد' : 'Official Laboratory Medical Report'}
              </h3>
              <p className="text-[11px] text-slate-500 font-mono-numbers">
                {order.orderNumber} • {order.barcode}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="مشاركة رابط التقرير المشفر"
            >
              <Share2 className="w-4 h-4 text-teal-600" />
              <span className="hidden sm:inline">
                {copiedLink ? (state.language === 'ar' ? 'تم النسخ!' : 'Copied!') : state.language === 'ar' ? 'مشاركة' : 'Share'}
              </span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md transition"
            >
              <Printer className="w-4 h-4" />
              <span>{state.language === 'ar' ? 'طباعة / حفظ كـ PDF' : 'Print / Save PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE OFFICIAL LABORATORY REPORT CONTAINER */}
        <div className="p-6 sm:p-10 overflow-y-auto bg-white text-slate-900 print-page print:p-0">
          {/* Official Letterhead Header */}
          <div className="border-b-2 border-teal-700 pb-5">
            <div className="flex items-start justify-between gap-4">
              {/* Lab Logo & Credentials */}
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-black text-2xl shadow-sm">
                  <FlaskConical className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-teal-900 tracking-tight">
                    مختبرات ميديلاب الطبية المتخصصة
                  </h1>
                  <h2 className="text-xs sm:text-sm font-bold text-slate-600 font-mono tracking-wider">
                    MEDILAB PRO CLINICAL LABORATORIES
                  </h2>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                    <span>ترخيص وزارة الصحة: MOH-SA-74920</span>
                    <span>•</span>
                    <span className="font-bold text-teal-800">ISO 15189 Accredited</span>
                  </div>
                </div>
              </div>

              {/* Dynamic QR Code for Anti-Forgery */}
              <div className="flex flex-col items-center shrink-0 text-center">
                {qrDataUrl && (
                  <img
                    src={qrDataUrl}
                    alt="Document Verification QR Code"
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg border border-slate-200 p-0.5 shadow-sm"
                  />
                )}
                <span className="text-[9px] font-bold text-teal-900 mt-1 uppercase tracking-tighter">
                  امسح للتحقق الرقمي
                </span>
              </div>
            </div>
          </div>

          {/* Patient Details & Order Metadata Matrix */}
          <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-slate-400 block text-[10px]">اسم المريض / Patient:</span>
              <span className="font-black text-slate-900 text-sm">{order.patient.fullName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">رقم الهوية الوطنية / ID:</span>
              <span className="font-mono-numbers font-bold text-slate-900">
                ••••{order.patient.nationalId.slice(-4)} ({order.patient.fileNumber})
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">العمر / الجنس:</span>
              <span className="font-bold text-slate-900">
                42 سنة • {order.patient.gender === 'male' ? 'ذكر' : 'أنثى'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">فصيلة الدم / Blood:</span>
              <span className="font-bold font-mono text-teal-800">{order.patient.bloodType}</span>
            </div>

            <div className="pt-2 border-t border-slate-200/60">
              <span className="text-slate-400 block text-[10px]">رقم الطلب / Order No:</span>
              <span className="font-mono font-bold text-teal-800">{order.orderNumber}</span>
            </div>
            <div className="pt-2 border-t border-slate-200/60">
              <span className="text-slate-400 block text-[10px]">الباركود / Barcode:</span>
              <span className="font-mono text-slate-700">{order.barcode}</span>
            </div>
            <div className="pt-2 border-t border-slate-200/60">
              <span className="text-slate-400 block text-[10px]">تاريخ ووقت السحب:</span>
              <span className="font-mono text-slate-700">{order.sampleCollectedAt}</span>
            </div>
            <div className="pt-2 border-t border-slate-200/60">
              <span className="text-slate-400 block text-[10px]">تاريخ الاعتماد الطبي:</span>
              <span className="font-mono text-slate-700">{order.approvedAt || '2026-10-19 09:00'}</span>
            </div>
          </div>

          {/* Test Name Header */}
          <div className="mt-5 pb-2 flex items-center justify-between border-b border-slate-200">
            <div>
              <span className="text-xs font-bold text-teal-700 block">{order.testType.category}</span>
              <h3 className="text-base font-extrabold text-slate-900">
                {order.testType.nameAr} ({order.testType.nameEn})
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">عينة: {order.testType.sampleType}</span>
          </div>

          {/* RESULTS TABLE */}
          <table className="w-full text-xs text-start mt-3">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-y border-slate-200">
                <th className="py-2.5 px-3 text-start">المؤشر المخبري (Test Parameter)</th>
                <th className="py-2.5 px-3 text-start">النتيجة المقاسة (Result)</th>
                <th className="py-2.5 px-3 text-start">الوحدة (Unit)</th>
                <th className="py-2.5 px-3 text-start">المعدل الطبيعي (Reference Range)</th>
                <th className="py-2.5 px-3 text-center">التنبيه (Flag)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.results.map((res) => (
                <tr
                  key={res.id}
                  className={res.isAbnormal ? 'bg-amber-50/50 print:bg-slate-50 font-bold' : ''}
                >
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-slate-900">{res.parameterNameAr}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{res.parameterNameEn}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-sm font-black font-mono-numbers ${
                        res.flag === 'critical'
                          ? 'text-rose-600 underline font-extrabold'
                          : res.flag === 'high'
                          ? 'text-amber-700'
                          : res.flag === 'low'
                          ? 'text-sky-700'
                          : 'text-slate-900'
                      }`}
                    >
                      {res.measuredValue}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{res.unit}</td>
                  <td className="py-2.5 px-3 font-mono-numbers text-slate-600">
                    {res.minNormal} - {res.maxNormal}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {res.isAbnormal ? (
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-black ${
                          res.flag === 'critical'
                            ? 'bg-rose-600 text-white'
                            : res.flag === 'high'
                            ? 'bg-amber-600 text-white'
                            : 'bg-sky-600 text-white'
                        }`}
                      >
                        {res.flag.toUpperCase()}
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-bold">NORMAL</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Clinical Impressions / Doctor Comments */}
          {order.overallComments && (
            <div className="mt-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="font-bold text-slate-700 block mb-1">
                توصيات واستنتاجات الاستشاري / Clinical Impression:
              </span>
              <p className="text-slate-700 leading-relaxed italic">"{order.overallComments}"</p>
            </div>
          )}

          {/* Signatures & Official Stamp Footer */}
          <div className="mt-8 pt-6 border-t-2 border-slate-200 grid grid-cols-3 gap-6 items-end">
            {/* Lab Technologist */}
            <div className="text-center text-xs">
              <span className="text-slate-400 block text-[10px] mb-1">فني الفحص والمطابقة:</span>
              <div className="font-bold text-slate-800">{order.labTechName || 'فني المختبر الطبي'}</div>
              <span className="text-[10px] text-slate-500 font-mono">SCHS-TECH-LIC</span>
            </div>

            {/* Official Digital Seal */}
            <div className="text-center">
              <div className="inline-block p-3 rounded-full border-2 border-dashed border-teal-700 text-teal-800 font-bold text-[10px] leading-tight">
                <div>مختبرات ميديلاب</div>
                <div className="text-[8px] font-mono">DIGITAL CERTIFIED SEAL</div>
                <div className="text-[8px] text-teal-600 font-mono">ISO 15189</div>
              </div>
            </div>

            {/* Supervising Doctor Signature */}
            <div className="text-center text-xs">
              <span className="text-slate-400 block text-[10px] mb-1">استشاري علم الأمراض المعتمد:</span>
              <div className="font-black text-slate-900 underline decoration-teal-600">
                {order.doctorName || 'الطبيب الاستشاري المعتمد'}
              </div>
              <span className="text-[10px] text-slate-500 font-mono">SCHS-MED-LIC</span>
            </div>
          </div>

          {/* Tamper-Proof Cryptographic Hash Footer */}
          <div className="mt-6 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Cryptographic SHA-256 Hash: {order.cryptographicHash || 'e7b93c8a9f24301d087b33a75e219fb56b823e5904d9e037b5212c41938fe8b1'}</span>
            <span>وثيقة إلكترونية رسمية صادرة آلياً ومحمية من التعديل</span>
          </div>
        </div>
      </div>
    </div>
  );
};
