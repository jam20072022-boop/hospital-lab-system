import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';

interface Props {
  className?: string;
  lang?: 'ar' | 'en';
}

export const PWAInstallButton: React.FC<Props> = ({ className = '', lang = 'ar' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If running in standalone installed app, don't show
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white shadow-md hover:from-teal-700 hover:to-emerald-700 active:scale-95 transition-all ${className}`}
        title={lang === 'ar' ? 'تثبيت التطبيق على جهازك' : 'Install App'}
      >
        <Download className="w-4 h-4 animate-bounce" />
        <span>{lang === 'ar' ? 'تثبيت التطبيق (PWA)' : 'Install App'}</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 rounded-xl border border-teal-500/30 bg-teal-50 dark:bg-teal-950/40 px-3 py-1.5 text-xs font-semibold text-teal-800 dark:text-teal-200 hover:bg-teal-100 transition ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5 text-teal-600" />
          <span>{lang === 'ar' ? 'تثبيت على آيفون' : 'Install on iOS'}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold">
                    M
                  </div>
                  <h3 className="font-bold text-base">
                    {lang === 'ar' ? 'تثبيت MediLab على الآيفون' : 'Install on iPhone / iPad'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 flex items-center justify-center text-xs font-bold mt-0.5 shrink-0">
                    1
                  </span>
                  <p>
                    {lang === 'ar'
                      ? 'اضغط على زر المشاركة (Share) في شريط سفلي متصفح Safari.'
                      : 'Tap the Share button in Safari.'}
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 flex items-center justify-center text-xs font-bold mt-0.5 shrink-0">
                    2
                  </span>
                  <p>
                    {lang === 'ar'
                      ? 'مرر للأسفل واختر "إضافة إلى الشاشة الرئيسية" (Add to Home Screen).'
                      : 'Scroll down and tap "Add to Home Screen".'}
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 flex items-center justify-center text-xs font-bold mt-0.5 shrink-0">
                    3
                  </span>
                  <p>
                    {lang === 'ar'
                      ? 'اضغط على "إضافة" (Add) في الزاوية العلوية ليظهر كتطبيق مثبت مع إشعارات فورية.'
                      : 'Tap "Add" in the top corner to install with push support.'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition"
              >
                {lang === 'ar' ? 'فهمت، حسناً' : 'Got it'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Ambient Fallback install button for testing
  return (
    <button
      onClick={() => {
        alert(
          lang === 'ar'
            ? 'تطبيق MediLab Pro مجهز للعمل كـ PWA. يمكنك تثبيته عبر قائمة المتصفح أو أيقونة التثبيت في شريط العنوان.'
            : 'MediLab Pro is PWA-ready. You can install it from your browser menu or address bar.'
        );
      }}
      className={`flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition ${className}`}
      title={lang === 'ar' ? 'تطبيق ويب تقدمي PWA' : 'PWA Ready'}
    >
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
      <span>{lang === 'ar' ? 'تطبيق PWA' : 'PWA Ready'}</span>
    </button>
  );
};
