"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  PlusCircle, FileText, CheckCircle, AlertTriangle, Clock, BarChart3, ArrowRight,
} from "lucide-react";

type Stats = {
  total: number;
  passed: number;
  failed: number;
  draft: number;
  recent: { id: string; status: string; createdAt: string; instrument: { manufacturer: string; model: string } }[];
};

export default function DashboardOverview() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then(r => r.json())
      .then(setStats);
  }, []);

  const passRate = stats && stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0;

  const cards = [
    { label: "Total Reports", value: stats?.total ?? "—", icon: FileText, color: "blue", bg: "bg-blue-50", text: "text-blue-600" },
    { label: "Passed", value: stats?.passed ?? "—", icon: CheckCircle, color: "green", bg: "bg-green-50", text: "text-green-600" },
    { label: "Failed", value: stats?.failed ?? "—", icon: AlertTriangle, color: "red", bg: "bg-red-50", text: "text-red-600" },
    { label: "In Progress", value: stats?.draft ?? "—", icon: Clock, color: "yellow", bg: "bg-yellow-50", text: "text-yellow-600" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {session?.user?.name}</h1>
          <p className="text-gray-500 mt-0.5">OIML R-76 Testing &amp; Certification Portal</p>
        </div>
        <Link
          href="/dashboard/instruments"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-500"
        >
          <PlusCircle className="h-4 w-4" /> Start New Test
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center gap-4">
            <div className={`rounded-full p-3 ${c.bg}`}>
              <c.icon className={`h-6 w-6 ${c.text}`} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">{c.label}</p>
              <p className="text-2xl font-bold text-gray-900">{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pass Rate + Recent */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Pass Rate bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <h2 className="font-semibold text-gray-800">Overall Pass Rate</h2>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold text-gray-900">{passRate}%</span>
            <p className="text-sm text-gray-500 mt-1">{stats?.passed} of {stats?.total} reports passed</p>
          </div>
          <div className="mt-4 w-full rounded-full bg-gray-200 h-3">
            <div
              className="rounded-full h-3 bg-green-500 transition-all"
              style={{ width: `${passRate}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0%</span><span>100%</span>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Recent Reports</h2>
            <Link href="/dashboard/reports" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="divide-y divide-gray-100">
            {(stats?.recent ?? []).map(r => (
              <li key={r.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-900">{r.instrument.manufacturer} — {r.instrument.model}</p>
                  <p className="text-xs text-gray-400">{format(new Date(r.createdAt), "PPp")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    r.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                    r.status === "FAILED" ? "bg-red-100 text-red-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {r.status}
                  </span>
                  <Link href={`/dashboard/reports/${r.id}`} className="text-xs text-blue-600 hover:underline">
                    View
                  </Link>
                </div>
              </li>
            ))}
            {!stats?.recent?.length && (
              <li className="py-10 text-center text-gray-400 text-sm">No reports yet. Start a new test!</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
