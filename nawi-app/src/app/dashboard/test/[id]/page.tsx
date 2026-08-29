"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { ThermometerSun } from "lucide-react";
import { useSession } from "next-auth/react";

export default function SetupTestEnvironmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [envData, setEnvData] = useState({
    temperature: "",
    humidity: "",
    pressure: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEnvData({ ...envData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instrumentId: id,
          testerId: session.user.id,
          ...envData
        }),
      });
      if (response.ok) {
        const data = await response.json();
        router.push(`/dashboard/test/run/${data.id}`); // Proceed to run tests
      } else {
        alert("Failed to create test report");
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center space-x-3 mb-6 border-b pb-4">
        <ThermometerSun className="h-6 w-6 text-orange-500" />
        <h1 className="text-xl font-bold text-gray-900">Laboratory Environment Setup</h1>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Record the environmental conditions before starting the OIML R-76 tests.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Temperature (°C)</label>
          <input
            required
            type="number"
            step="0.1"
            name="temperature"
            value={envData.temperature}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Relative Humidity (%)</label>
          <input
            required
            type="number"
            step="1"
            name="humidity"
            value={envData.humidity}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Atmospheric Pressure (hPa)</label>
          <input
            required
            type="number"
            step="0.1"
            name="pressure"
            value={envData.pressure}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            {loading ? "Starting..." : "Start Testing Sequence"}
          </button>
        </div>
      </form>
    </div>
  );
}
