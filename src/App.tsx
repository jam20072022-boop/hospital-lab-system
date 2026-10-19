/**
 * MediLab Pro - Comprehensive Medical Laboratory & Queue Management System
 * Cross-Platform Progressive Web App (PWA) with HIPAA & ISO 15189 Standards
 */

import React, { useEffect, useState } from 'react';
import { AppState, store } from './services/store';
import { Header } from './components/common/Header';
import { PatientPortal } from './components/patient/PatientPortal';
import { LabStaffPortal } from './components/lab/LabStaffPortal';
import { DoctorPortal } from './components/doctor/DoctorPortal';
import { PublicQueueDisplay } from './components/queue/PublicQueueDisplay';
import { AuditAndSmsModal } from './components/admin/AuditAndSmsModal';
import { MedicalReportModal } from './components/report/MedicalReportModal';
import { ReportVerificationModal } from './components/report/ReportVerificationModal';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';
import { RotateCcw, ShieldCheck, Heart, Sparkles } from 'lucide-react';

export default function App() {
  const [state, setState] = useState<AppState>(store.getState());

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setState({ ...store.getState() });
    });

    // Check URL parameters for direct verification links (from QR code or SMS)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const verifyOrderNumber = params.get('verify');
      if (verifyOrderNumber) {
        const order = store.getState().orders.find((o) => o.orderNumber === verifyOrderNumber);
        if (order) {
          store.setSelectedOrderForVerification(order.id);
        }
      }
    }

    return () => unsubscribe();
  }, []);

  return (
    <div
      dir={state.language === 'ar' ? 'rtl' : 'ltr'}
      className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors font-sans"
    >
      {/* Top Header */}
      <Header state={state} />

      {/* Main Content Area */}
      <main className="flex-1 py-4 sm:py-6">
        {state.activeTab === 'patient' && <PatientPortal state={state} />}
        {state.activeTab === 'lab_tech' && <LabStaffPortal state={state} />}
        {state.activeTab === 'doctor' && <DoctorPortal state={state} />}
        {state.activeTab === 'queue_display' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <PublicQueueDisplay state={state} />
          </div>
        )}
        {state.activeTab === 'audit_sms' && <AuditAndSmsModal state={state} />}
      </main>

      {/* Official Medical PDF Report Modal */}
      {state.selectedOrderForReport && (
        <MedicalReportModal
          state={state}
          orderId={state.selectedOrderForReport}
          onClose={() => store.setSelectedOrderForReport(null)}
        />
      )}

      {/* QR Document Authenticity Verification Modal */}
      {state.selectedOrderForVerification && (
        <ReportVerificationModal
          state={state}
          orderId={state.selectedOrderForVerification}
          onClose={() => store.setSelectedOrderForVerification(null)}
        />
      )}

      {/* PWA Offline Banner */}
      <OfflineIndicator lang={state.language} />

      {/* System Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 py-6 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800 dark:text-slate-200">
              MediLab Pro LIS
            </span>
            <span>•</span>
            <span>
              {state.language === 'ar'
                ? 'مرخص من وزارة الصحة برقم MOH-SA-74920'
                : 'MOH Licensed MOH-SA-74920'}
            </span>
            <span>•</span>
            <span className="text-teal-600 font-bold">ISO 15189 Accredited</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => store.resetToDefaults()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs transition"
              title="إعادة ضبط السجلات الافتراضية"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{state.language === 'ar' ? 'إعادة ضبط البيانات المعملية' : 'Reset Demo Data'}</span>
            </button>

            <span className="text-slate-400">
              {state.language === 'ar' ? 'جميع الحقوق محفوظة © 2026' : 'All Rights Reserved © 2026'}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
