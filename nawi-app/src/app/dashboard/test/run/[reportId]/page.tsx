"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { calculateMPE, checkCompliance } from "@/lib/oiml-mpe";
import { Mic, CheckCircle2, XCircle, Plus, FlaskConical } from "lucide-react";
import { useSession } from "next-auth/react";

type WeighingRow = { load: string; indication: string; error: number | null; mpe: number | null; passed: boolean | null };
type EccentricityRow = { position: string; load: string; indication: string; error: number | null; mpe: number | null; passed: boolean | null };
type RepeatRow = { trial: number; load: string; indication: string; error: number | null; mpe: number | null; passed: boolean | null };
type TareRow = { tare: string; load: string; indication: string; error: number | null; mpe: number | null; passed: boolean | null };

export default function RunTestPage({ params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [instrument, setInstrument] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [activeTab, setActiveTab] = useState<"weighing" | "eccentricity" | "repeatability" | "tare">("weighing");

  const [weighingData, setWeighingData] = useState<WeighingRow[]>([
    { load: "", indication: "", error: null, mpe: null, passed: null },
    { load: "", indication: "", error: null, mpe: null, passed: null },
    { load: "", indication: "", error: null, mpe: null, passed: null },
  ]);

  const [eccentricityData, setEccentricityData] = useState<EccentricityRow[]>([
    { position: "Center", load: "", indication: "", error: null, mpe: null, passed: null },
    { position: "Front Left", load: "", indication: "", error: null, mpe: null, passed: null },
    { position: "Back Left", load: "", indication: "", error: null, mpe: null, passed: null },
    { position: "Back Right", load: "", indication: "", error: null, mpe: null, passed: null },
    { position: "Front Right", load: "", indication: "", error: null, mpe: null, passed: null },
  ]);

  const [repeatabilityData, setRepeatabilityData] = useState<RepeatRow[]>([
    { trial: 1, load: "", indication: "", error: null, mpe: null, passed: null },
    { trial: 2, load: "", indication: "", error: null, mpe: null, passed: null },
    { trial: 3, load: "", indication: "", error: null, mpe: null, passed: null },
    { trial: 4, load: "", indication: "", error: null, mpe: null, passed: null },
    { trial: 5, load: "", indication: "", error: null, mpe: null, passed: null },
  ]);

  const [tareData, setTareData] = useState<TareRow[]>([
    { tare: "", load: "", indication: "", error: null, mpe: null, passed: null },
    { tare: "", load: "", indication: "", error: null, mpe: null, passed: null },
  ]);

  useEffect(() => {
    fetch(`/api/reports/${reportId}`)
      .then(res => res.json())
      .then(data => { setInstrument(data.instrument); setLoading(false); });
  }, [reportId]);

  const calcAndSet = <T extends { load: string; indication: string; error: number | null; mpe: number | null; passed: boolean | null }>(
    rows: T[], index: number, updated: T, setter: (r: T[]) => void
  ) => {
    const newData = [...rows];
    newData[index] = updated;
    if (updated.load !== "" && updated.indication !== "") {
      const loadVal = parseFloat(updated.load);
      const indVal = parseFloat(updated.indication);
      const error = indVal - loadVal;
      const mpe = calculateMPE(loadVal, instrument.verificationScaleInt_e, instrument.accuracyClass);
      newData[index] = { ...newData[index], error, mpe, passed: checkCompliance(error, mpe) };
    }
    setter(newData);
  };

  const handleWeighingChange = (index: number, field: string, value: string) => {
    calcAndSet(weighingData, index, { ...weighingData[index], [field]: value }, setWeighingData as any);
  };

  const handleEccentricityChange = (index: number, field: string, value: string) => {
    calcAndSet(eccentricityData, index, { ...eccentricityData[index], [field]: value }, setEccentricityData as any);
  };

  const handleRepeatChange = (index: number, field: string, value: string) => {
    calcAndSet(repeatabilityData, index, { ...repeatabilityData[index], [field]: value }, setRepeatabilityData as any);
  };

  const handleTareChange = (index: number, field: string, value: string) => {
    const updated = { ...tareData[index], [field]: value };
    const newData = [...tareData];
    newData[index] = updated;
    if (updated.tare !== "" && updated.load !== "" && updated.indication !== "") {
      const tare = parseFloat(updated.tare);
      const load = parseFloat(updated.load);
      const ind = parseFloat(updated.indication);
      const error = ind - load;
      const mpe = calculateMPE(load + tare, instrument.verificationScaleInt_e, instrument.accuracyClass);
      newData[index] = { ...newData[index], error, mpe, passed: checkCompliance(error, mpe) };
    }
    setTareData(newData);
  };

  const startVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice input is only supported in Chrome. Please use Chrome browser.");
      return;
    }
    setIsListening(true);
    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      alert(`🎤 Voice Detected: "${transcript}"\n\nIn a production build, this would parse values like "Load 5 kg, reading 5.001" and auto-fill the active row.`);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const PassFail = ({ passed }: { passed: boolean | null }) => {
    if (passed === true) return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    if (passed === false) return <XCircle className="h-5 w-5 text-red-500" />;
    return <span className="text-gray-300">—</span>;
  };

  const tableHead = (
    <thead className="bg-gray-50">
      <tr>
        {activeTab === "eccentricity" && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>}
        {activeTab === "repeatability" && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trial</th>}
        {activeTab === "tare" && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tare Load</th>}
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied Load</th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Indication</th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Error</th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MPE</th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
      </tr>
    </thead>
  );

  const InputCell = ({ value, onChange, placeholder = "" }: { value: string; onChange: (v: string) => void; placeholder?: string }) => (
    <input
      type="number"
      step="any"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="block w-28 rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );

  const submitTestResults = async () => {
    const allResults = [
      ...weighingData.filter(d => d.load !== "").map(d => ({ ...d, passed: d.passed ?? false })),
      ...eccentricityData.filter(d => d.load !== "").map(d => ({ ...d, passed: d.passed ?? false })),
      ...repeatabilityData.filter(d => d.load !== "").map(d => ({ ...d, passed: d.passed ?? false })),
      ...tareData.filter(d => d.load !== "").map(d => ({ ...d, passed: d.passed ?? false })),
    ];
    const overallPassed = allResults.every(d => d.passed);

    await fetch(`/api/reports/${reportId}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: overallPassed ? "COMPLETED" : "FAILED",
        weighingData: weighingData.filter(d => d.load !== ""),
        eccentricityData: eccentricityData.filter(d => d.load !== ""),
        repeatabilityData: repeatabilityData.filter(d => d.load !== ""),
        tareData: tareData.filter(d => d.load !== ""),
      }),
    });
    router.push(`/dashboard/reports/${reportId}`);
  };

  if (loading) return <div className="flex h-64 items-center justify-center text-gray-500">Loading instrument details...</div>;

  const tabs = [
    { id: "weighing", label: "Weighing Performance" },
    { id: "eccentricity", label: "Eccentricity" },
    { id: "repeatability", label: "Repeatability" },
    { id: "tare", label: "Tare" },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Execute OIML R-76 Tests</h1>
          <p className="text-sm text-gray-500 mt-1">
            <strong>{instrument.manufacturer}</strong> — {instrument.model} &nbsp;|&nbsp; Class <strong>{instrument.accuracyClass}</strong> &nbsp;|&nbsp;
            Max: {instrument.maxCapacity} &nbsp;|&nbsp; e = {instrument.verificationScaleInt_e} &nbsp;|&nbsp; d = {instrument.actualScaleInt_d}
          </p>
        </div>
        <button
          onClick={startVoiceInput}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors ${isListening ? "bg-red-50 border-red-300 text-red-600 animate-pulse" : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"}`}
        >
          <Mic className="h-4 w-4" />
          {isListening ? "Listening…" : "Voice Entry"}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 border-b-2 text-sm font-medium transition-colors ${activeTab === tab.id ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-blue-600" />
          <h2 className="text-base font-semibold text-gray-800">
            {tabs.find(t => t.id === activeTab)?.label} Test
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            {tableHead}
            <tbody className="divide-y divide-gray-100">
              {/* WEIGHING */}
              {activeTab === "weighing" && weighingData.map((row, i) => (
                <tr key={i} className={row.passed === false ? "bg-red-50" : row.passed === true ? "bg-green-50/40" : ""}>
                  <td className="px-4 py-2"><InputCell value={row.load} onChange={v => handleWeighingChange(i, "load", v)} placeholder="e.g. 100" /></td>
                  <td className="px-4 py-2"><InputCell value={row.indication} onChange={v => handleWeighingChange(i, "indication", v)} placeholder="e.g. 100.05" /></td>
                  <td className="px-4 py-2 text-sm text-gray-700 font-mono">{row.error !== null ? row.error.toFixed(4) : "—"}</td>
                  <td className="px-4 py-2 text-sm text-gray-500 font-mono">{row.mpe !== null ? `±${row.mpe.toFixed(4)}` : "—"}</td>
                  <td className="px-4 py-2"><PassFail passed={row.passed} /></td>
                </tr>
              ))}

              {/* ECCENTRICITY */}
              {activeTab === "eccentricity" && eccentricityData.map((row, i) => (
                <tr key={i} className={row.passed === false ? "bg-red-50" : row.passed === true ? "bg-green-50/40" : ""}>
                  <td className="px-4 py-2 text-sm font-medium text-gray-700">{row.position}</td>
                  <td className="px-4 py-2"><InputCell value={row.load} onChange={v => handleEccentricityChange(i, "load", v)} /></td>
                  <td className="px-4 py-2"><InputCell value={row.indication} onChange={v => handleEccentricityChange(i, "indication", v)} /></td>
                  <td className="px-4 py-2 text-sm text-gray-700 font-mono">{row.error !== null ? row.error.toFixed(4) : "—"}</td>
                  <td className="px-4 py-2 text-sm text-gray-500 font-mono">{row.mpe !== null ? `±${row.mpe.toFixed(4)}` : "—"}</td>
                  <td className="px-4 py-2"><PassFail passed={row.passed} /></td>
                </tr>
              ))}

              {/* REPEATABILITY */}
              {activeTab === "repeatability" && repeatabilityData.map((row, i) => (
                <tr key={i} className={row.passed === false ? "bg-red-50" : row.passed === true ? "bg-green-50/40" : ""}>
                  <td className="px-4 py-2 text-sm font-medium text-gray-700">#{row.trial}</td>
                  <td className="px-4 py-2"><InputCell value={row.load} onChange={v => handleRepeatChange(i, "load", v)} /></td>
                  <td className="px-4 py-2"><InputCell value={row.indication} onChange={v => handleRepeatChange(i, "indication", v)} /></td>
                  <td className="px-4 py-2 text-sm text-gray-700 font-mono">{row.error !== null ? row.error.toFixed(4) : "—"}</td>
                  <td className="px-4 py-2 text-sm text-gray-500 font-mono">{row.mpe !== null ? `±${row.mpe.toFixed(4)}` : "—"}</td>
                  <td className="px-4 py-2"><PassFail passed={row.passed} /></td>
                </tr>
              ))}

              {/* TARE */}
              {activeTab === "tare" && tareData.map((row, i) => (
                <tr key={i} className={row.passed === false ? "bg-red-50" : row.passed === true ? "bg-green-50/40" : ""}>
                  <td className="px-4 py-2"><InputCell value={row.tare} onChange={v => handleTareChange(i, "tare", v)} /></td>
                  <td className="px-4 py-2"><InputCell value={row.load} onChange={v => handleTareChange(i, "load", v)} /></td>
                  <td className="px-4 py-2"><InputCell value={row.indication} onChange={v => handleTareChange(i, "indication", v)} /></td>
                  <td className="px-4 py-2 text-sm text-gray-700 font-mono">{row.error !== null ? row.error.toFixed(4) : "—"}</td>
                  <td className="px-4 py-2 text-sm text-gray-500 font-mono">{row.mpe !== null ? `±${row.mpe.toFixed(4)}` : "—"}</td>
                  <td className="px-4 py-2"><PassFail passed={row.passed} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {activeTab === "weighing" && (
          <div className="p-4 border-t">
            <button
              onClick={() => setWeighingData([...weighingData, { load: "", indication: "", error: null, mpe: null, passed: null }])}
              className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1"
            >
              <Plus className="h-4 w-4" /> Add Load Point
            </button>
          </div>
        )}
        {activeTab === "tare" && (
          <div className="p-4 border-t">
            <button
              onClick={() => setTareData([...tareData, { tare: "", load: "", indication: "", error: null, mpe: null, passed: null }])}
              className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1"
            >
              <Plus className="h-4 w-4" /> Add Tare Row
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-4">
        <p className="text-sm text-gray-500">
          Complete all test tabs, then finalize the report.
        </p>
        <button
          onClick={submitTestResults}
          className="rounded-md bg-green-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-green-500"
        >
          Finalize Report &amp; Generate PDF →
        </button>
      </div>
    </div>
  );
}
