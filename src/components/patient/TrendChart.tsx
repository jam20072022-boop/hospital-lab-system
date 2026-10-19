import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
  Dot,
} from 'recharts';
import { PATIENT_HISTORY } from '../../data/mockData';
import { TrendingDown, TrendingUp, Info, Calendar } from 'lucide-react';

interface Props {
  patientId: string;
  lang?: 'ar' | 'en';
}

interface MetricConfig {
  code: string;
  nameAr: string;
  nameEn: string;
  unit: string;
  minNormal: number;
  maxNormal: number;
  goodDirection: 'lower' | 'higher';
}

const METRICS: MetricConfig[] = [
  {
    code: 'HbA1c',
    nameAr: 'السكر التراكمي (HbA1c)',
    nameEn: 'Glycated Hemoglobin',
    unit: '%',
    minNormal: 4.0,
    maxNormal: 5.6,
    goodDirection: 'lower',
  },
  {
    code: 'FBS',
    nameAr: 'السكر الصائم (FBS)',
    nameEn: 'Fasting Blood Sugar',
    unit: 'mg/dL',
    minNormal: 70,
    maxNormal: 99,
    goodDirection: 'lower',
  },
  {
    code: 'LDL',
    nameAr: 'الكوليسترول الضار (LDL)',
    nameEn: 'LDL Bad Cholesterol',
    unit: 'mg/dL',
    minNormal: 50,
    maxNormal: 100,
    goodDirection: 'lower',
  },
  {
    code: 'HGB',
    nameAr: 'الهيموجلوبين (HGB)',
    nameEn: 'Hemoglobin',
    unit: 'g/dL',
    minNormal: 13.5,
    maxNormal: 17.5,
    goodDirection: 'higher',
  },
  {
    code: 'CREAT',
    nameAr: 'الكرياتينين (وظائف الكلى)',
    nameEn: 'Serum Creatinine',
    unit: 'mg/dL',
    minNormal: 0.7,
    maxNormal: 1.3,
    goodDirection: 'lower',
  },
];

export const TrendChart: React.FC<Props> = ({ patientId, lang = 'ar' }) => {
  const [selectedMetricCode, setSelectedMetricCode] = useState<string>('HbA1c');

  const history = PATIENT_HISTORY[patientId] || [];
  const selectedConfig = METRICS.find((m) => m.code === selectedMetricCode) || METRICS[0];

  const chartData = history
    .filter((h) => h.parameterCode === selectedMetricCode)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((item) => ({
      date: item.date,
      value: item.value,
      displayDate: item.date.substring(5), // MM-DD
    }));

  const latestVal = chartData.length > 0 ? chartData[chartData.length - 1].value : null;
  const firstVal = chartData.length > 1 ? chartData[0].value : null;
  const changeDiff = latestVal !== null && firstVal !== null ? Number((latestVal - firstVal).toFixed(2)) : 0;
  const isImproving =
    selectedConfig.goodDirection === 'lower' ? changeDiff < 0 : changeDiff > 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
      {/* Metric Selector Pills */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{lang === 'ar' ? 'السجل الطبي التراكمي وتتبع المؤشرات' : 'Longitudinal Medical Trends'}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {lang === 'ar'
              ? 'مقارنة قراءات الفحص عبر الشهور لمراقبة التحسن الصحي'
              : 'Compare clinical values over time to track health progress'}
          </p>
        </div>

        {/* Selector pills */}
        <div className="flex flex-wrap gap-1.5">
          {METRICS.map((metric) => {
            const hasData = history.some((h) => h.parameterCode === metric.code);
            return (
              <button
                key={metric.code}
                onClick={() => setSelectedMetricCode(metric.code)}
                disabled={!hasData}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedMetricCode === metric.code
                    ? 'bg-teal-600 text-white shadow-sm'
                    : hasData
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    : 'opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-800 text-slate-400'
                }`}
              >
                {metric.code}
              </button>
            );
          })}
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="py-12 text-center text-sm text-slate-400">
          {lang === 'ar' ? 'لا توجد قراءات سابقة مسجلة لهذا المؤشر بعد.' : 'No historical records found for this parameter.'}
        </div>
      ) : (
        <>
          {/* Summary Metric Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                {lang === 'ar' ? 'آخر قراءة مسجلة' : 'Latest Value'}
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-black text-slate-900 dark:text-white font-mono-numbers">
                  {latestVal}
                </span>
                <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                  {selectedConfig.unit}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                {lang === 'ar' ? 'المعدل الطبيعي الآمن' : 'Reference Interval'}
              </span>
              <div className="text-sm font-bold text-slate-700 dark:text-slate-300 font-mono-numbers mt-1.5">
                {selectedConfig.minNormal} - {selectedConfig.maxNormal} {selectedConfig.unit}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                {lang === 'ar' ? 'التغير التراكمي' : 'Overall Shift'}
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                {isImproving ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span className="font-mono-numbers">{changeDiff}</span> ({lang === 'ar' ? 'تحسن ممتاز' : 'Improving'})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-lg">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span className="font-mono-numbers">{changeDiff > 0 ? `+${changeDiff}` : changeDiff}</span>
                  </span>
                )}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                {lang === 'ar' ? 'الفترة الزمنية' : 'Timespan'}
              </span>
              <div className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{chartData.length} {lang === 'ar' ? 'فحوصات مجدولة' : 'Readings'}</span>
              </div>
            </div>
          </div>

          {/* Recharts Canvas */}
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b822" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={{ stroke: '#94a3b844' }}
                  tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
                />
                <YAxis
                  domain={['dataMin - 1', 'dataMax + 1']}
                  tickLine={false}
                  axisLine={{ stroke: '#94a3b844' }}
                  tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const inRange =
                        data.value >= selectedConfig.minNormal && data.value <= selectedConfig.maxNormal;
                      return (
                        <div className="bg-slate-900 text-white px-3.5 py-2.5 rounded-2xl shadow-xl text-xs space-y-1 border border-slate-700">
                          <div className="font-mono text-slate-300">{data.date}</div>
                          <div className="font-extrabold text-sm text-teal-400 font-mono-numbers">
                            {data.value} {selectedConfig.unit}
                          </div>
                          <div className="flex items-center gap-1 text-[11px]">
                            <span
                              className={`w-2 h-2 rounded-full ${inRange ? 'bg-emerald-400' : 'bg-amber-400'}`}
                            />
                            <span>{inRange ? 'ضمن النطاق الطبيعي' : 'خارج النطاق المرجعي'}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {/* Normal safe zone band */}
                <ReferenceArea
                  y1={selectedConfig.minNormal}
                  y2={selectedConfig.maxNormal}
                  fill="#10b981"
                  fillOpacity={0.08}
                  stroke="#10b98133"
                  strokeDasharray="2 2"
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#0d9488"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#0d9488', stroke: '#ffffff', strokeWidth: 2 }}
                  activeDot={{ r: 8, fill: '#14b8a6', stroke: '#ffffff', strokeWidth: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 px-3 py-2 rounded-xl">
            <Info className="w-4 h-4 text-teal-600 shrink-0" />
            <span>
              {lang === 'ar'
                ? `المنطقة المظللة بالأخضر تمثل النطاق المرجعي الطبيعي المعتمد من الجمعية الأمريكية للطب الإكلينيكي (${selectedConfig.minNormal} - ${selectedConfig.maxNormal} ${selectedConfig.unit}).`
                : `Shaded area denotes the reference clinical interval (${selectedConfig.minNormal} - ${selectedConfig.maxNormal} ${selectedConfig.unit}).`}
            </span>
          </div>
        </>
      )}
    </div>
  );
};
