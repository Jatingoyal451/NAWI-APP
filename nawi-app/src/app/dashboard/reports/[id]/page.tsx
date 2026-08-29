"use client";

import { useEffect, useState, use } from "react";
import { format } from "date-fns";
import { QRCodeSVG } from "qrcode.react";
import { Printer, CheckCircle, XCircle, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";

type TestResult = { id: string; testType: string; data: string; passed: boolean | null };

function ResultTable({ result }: { result: TestResult }) {
  const [open, setOpen] = useState(true);
  const rows = JSON.parse(result.data);

  const columnsByType: Record<string, string[]> = {
    WEIGHING: ["load", "indication", "error", "mpe", "passed"],
    ECCENTRICITY: ["position", "load", "indication", "error", "mpe", "passed"],
    REPEATABILITY: ["trial", "load", "indication", "error", "mpe", "passed"],
    TARE: ["tare", "load", "indication", "error", "mpe", "passed"],
  };

  const cols = columnsByType[result.testType] ?? Object.keys(rows[0] ?? {});
  const labels: Record<string, string> = {
    load: "Applied Load", indication: "Indication", error: "Error", mpe: "MPE",
    passed: "Result", position: "Position", trial: "Trial #", tare: "Tare",
  };

  return (
    <div className="mb-6">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex justify-between items-center py-2 text-left font-semibold text-gray-800 border-b border-gray-200 hover:text-blue-600"
      >
        <span>{result.testType.charAt(0) + result.testType.slice(1).toLowerCase()} Performance Test</span>
        <span className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${result.passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {result.passed ? "PASSED" : "FAILED"}
          </span>
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>
      {open && (
        <table className="min-w-full mt-2 text-sm border border-gray-200">
          <thead className="bg-gray-50">
            <tr>{cols.map(c => <th key={c} className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase border-b">{labels[c] ?? c}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row: any, i: number) => (
              <tr key={i} className={row.passed === false ? "bg-red-50" : ""}>
                {cols.map(c => (
                  <td key={c} className="px-3 py-2 text-gray-800">
                    {c === "passed"
                      ? (row[c] ? <span className="text-green-600 font-semibold">PASS</span> : <span className="text-red-600 font-semibold">FAIL</span>)
                      : c === "error" || c === "mpe"
                        ? (row[c] != null ? (c === "mpe" ? `±${Number(row[c]).toFixed(4)}` : Number(row[c]).toFixed(4)) : "—")
                        : row[c] ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function ReportViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/reports/${id}`)
      .then(res => res.json())
      .then(setReport);
  }, [id]);

  if (!report) return <div className="flex h-64 items-center justify-center text-gray-500">Loading report…</div>;

  const overallPassed = report.status === "COMPLETED";

  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-20">
      {/* Action Bar */}
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Test Report</h1>
          <p className="text-sm text-gray-500">{report.instrument.manufacturer} — {report.instrument.model}</p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg shadow hover:bg-blue-500 text-sm font-semibold"
        >
          <Printer className="h-4 w-4" /> Print / Export PDF
        </button>
      </div>

      {/* Printable Report */}
      <div id="printable-report" className="bg-white p-10 border border-gray-200 shadow-sm rounded-xl print:shadow-none print:border-none print:rounded-none">

        {/* Government Header */}
        <div className="text-center border-b-2 border-double border-gray-800 pb-6 mb-8">
          <p className="text-xs uppercase tracking-widest text-gray-500">Government of India — Ministry of Consumer Affairs</p>
          <h1 className="text-2xl font-bold mt-1 tracking-tight">TYPE EVALUATION TEST REPORT</h1>
          <p className="text-sm text-gray-600 mt-1">Non-Automatic Weighing Instruments (NAWI) — As per OIML Recommendation R 76</p>
          <p className="text-xs text-gray-400 mt-1">Legal Metrology Act, 2009 &amp; Legal Metrology (General) Rules, 2011</p>
        </div>

        {/* Overall Status */}
        <div className={`flex items-center gap-3 px-5 py-4 rounded-lg mb-8 ${overallPassed ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
          {overallPassed ? <CheckCircle className="h-7 w-7 text-green-600 flex-shrink-0" /> : <XCircle className="h-7 w-7 text-red-600 flex-shrink-0" />}
          <div>
            <p className={`font-bold text-lg ${overallPassed ? "text-green-800" : "text-red-800"}`}>
              OVERALL RESULT: {overallPassed ? "PASSED" : "FAILED"}
            </p>
            <p className="text-sm text-gray-600">Report ID: {report.id} &nbsp;|&nbsp; Generated: {format(new Date(report.createdAt), "PPP 'at' p")}</p>
          </div>
        </div>

        {/* Instrument + Environment */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-3">Instrument Details</h3>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                {[
                  ["Manufacturer", report.instrument.manufacturer],
                  ["Model", report.instrument.model],
                  ["Serial Number", report.instrument.serialNumber],
                  ["Accuracy Class", `Class ${report.instrument.accuracyClass}`],
                  ["Maximum Capacity (Max)", `${report.instrument.maxCapacity}`],
                  ["Minimum Capacity (Min)", `${report.instrument.minCapacity}`],
                  ["Verification Scale Interval (e)", `${report.instrument.verificationScaleInt_e}`],
                  ["Actual Scale Interval (d)", `${report.instrument.actualScaleInt_d}`],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <td className="py-1.5 font-medium text-gray-600 w-52">{k}</td>
                    <td className="py-1.5 text-gray-900">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-3">Test Conditions &amp; Laboratory Info</h3>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                {[
                  ["Temperature", `${report.temperature} °C`],
                  ["Relative Humidity", `${report.humidity} %`],
                  ["Atmospheric Pressure", `${report.pressure} hPa`],
                  ["Testing Officer", `${report.tester.name}`],
                  ["Officer Email", `${report.tester.email}`],
                  ["Test Date", format(new Date(report.createdAt), "PPP")],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <td className="py-1.5 font-medium text-gray-600 w-44">{k}</td>
                    <td className="py-1.5 text-gray-900">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Test Results */}
        <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-4">Test Observations &amp; Results</h3>
        {report.testResults.length === 0 ? (
          <p className="text-gray-400 text-sm italic">No test results recorded yet.</p>
        ) : (
          report.testResults.map((tr: TestResult) => <ResultTable key={tr.id} result={tr} />)
        )}

        {/* QR Verification Footer */}
        {report.qrCodeHash && (
          <div className="mt-10 pt-6 border-t-2 border-dashed border-gray-300 flex items-start gap-6">
            <div className="flex-shrink-0 p-2 border border-gray-200 rounded bg-white">
              <QRCodeSVG
                value={`https://nawi-verifier.india.gov.in/verify/${report.qrCodeHash}`}
                size={88}
                level="H"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-blue-800 font-bold mb-1">
                <ShieldCheck className="h-5 w-5" />
                <span>Cryptographic Authenticity Verification</span>
              </div>
              <p className="text-xs text-gray-600 mb-1 max-w-xl">
                This report has been cryptographically secured. Scan the QR code to verify its authenticity on the National NAWI Digital Registry. Any alteration to this document will invalidate the digital signature.
              </p>
              <p className="text-xs font-mono bg-gray-100 px-2 py-1 rounded break-all text-gray-700">
                SHA-256: {report.qrCodeHash}
              </p>
            </div>
          </div>
        )}

        {/* Signature Block */}
        <div className="mt-12 grid grid-cols-3 gap-8 text-center text-xs text-gray-500">
          <div className="border-t border-gray-300 pt-2">Testing Officer</div>
          <div className="border-t border-gray-300 pt-2">Laboratory In-Charge</div>
          <div className="border-t border-gray-300 pt-2">Authorized Signatory</div>
        </div>
      </div>
    </div>
  );
}
