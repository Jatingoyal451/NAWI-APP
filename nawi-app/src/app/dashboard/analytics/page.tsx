"use client";

import { useEffect, useState } from "react";
import { BarChart3, AlertTriangle, TrendingUp, Activity } from "lucide-react";

type ClassSummary = Record<string, { total: number; failed: number }>;

export default function AnalyticsDashboardPage() {
  const [data, setData] = useState<{ classSummary: ClassSummary; allReports: any[] } | null>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then(r => r.json())
      .then(setData);
  }, []);

  const classEntries = Object.entries(data?.classSummary ?? {});
  const maxTotal = Math.max(...classEntries.map(([, v]) => v.total), 1);

  const totalReports = data?.allReports?.length ?? 0;
  const totalFailed = data?.allReports?.filter(r => r.status === "FAILED").length ?? 0;
  const passRate = totalReports > 0 ? Math.round(((totalReports - totalFailed) / totalReports) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics &amp; Insights</h1>
        <p className="text-gray-500">AI-Powered intelligence for regulatory decision-making.</p>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="rounded-full bg-blue-50 p-3"><Activity className="h-6 w-6 text-blue-600" /></div>
          <div><p className="text-xs text-gray-500 font-medium">Total Tests</p><p className="text-3xl font-bold">{totalReports}</p></div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="rounded-full bg-green-50 p-3"><TrendingUp className="h-6 w-6 text-green-600" /></div>
          <div><p className="text-xs text-gray-500 font-medium">Pass Rate</p><p className="text-3xl font-bold">{passRate}%</p></div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="rounded-full bg-red-50 p-3"><AlertTriangle className="h-6 w-6 text-red-600" /></div>
          <div><p className="text-xs text-gray-500 font-medium">Failed Tests</p><p className="text-3xl font-bold">{totalFailed}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Failure Rate by Accuracy Class */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <h2 className="font-semibold text-gray-800">Tests by Accuracy Class</h2>
          </div>
          <div className="space-y-4">
            {classEntries.length === 0 && <p className="text-sm text-gray-400">No data yet.</p>}
            {classEntries.map(([cls, vals]) => {
              const failRate = vals.total > 0 ? Math.round((vals.failed / vals.total) * 100) : 0;
              return (
                <div key={cls}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">Class {cls}</span>
                    <span className="text-gray-500">{vals.total} tests &middot; {failRate}% fail rate</span>
                  </div>
                  <div className="flex gap-1 h-5 rounded overflow-hidden w-full bg-gray-100">
                    <div
                      className="bg-green-500 transition-all"
                      style={{ width: `${((vals.total - vals.failed) / (maxTotal)) * 100}%` }}
                    />
                    <div
                      className="bg-red-400 transition-all"
                      style={{ width: `${(vals.failed / maxTotal) * 100}%` }}
                    />
                  </div>
                  <div className="flex gap-4 mt-1 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> {vals.total - vals.failed} passed</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> {vals.failed} failed</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Insight Panel */}
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <div className="flex items-center gap-2 font-bold text-amber-800 mb-2">
              <AlertTriangle className="h-5 w-5" />
              AI Predictive Alert
            </div>
            <p className="text-sm text-amber-900">
              {totalFailed > 0
                ? `⚠️ ${totalFailed} instruments have failed type evaluation. This may indicate systemic manufacturing defects. Cross-reference failed serial numbers with latest production batches.`
                : "✅ No anomalies detected. All tested instruments have passed evaluation so far."}
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <div className="flex items-center gap-2 font-bold text-blue-800 mb-2">
              <TrendingUp className="h-5 w-5" />
              OIML Compliance Summary
            </div>
            <p className="text-sm text-blue-900">
              Overall compliance rate stands at <strong>{passRate}%</strong>. {passRate >= 80 ? "This is within acceptable benchmarks for a calibration laboratory." : "This is below the recommended 80% benchmark. Consider reviewing test methodologies and environmental controls."}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">OIML Copilot</p>
            <div className="bg-gray-50 rounded p-3 text-sm text-gray-700 italic">
              "What is the MPE for a Class III scale at 1500e?"
            </div>
            <div className="mt-2 bg-blue-50 rounded p-3 text-sm text-blue-800">
              📘 For Class III, loads from 500e to 2000e → MPE = <strong>1.0e</strong>. So at 1500e, MPE = 1.0 × e.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
