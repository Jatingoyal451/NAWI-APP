"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Scale } from "lucide-react";

export default function NewInstrumentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    manufacturer: "",
    model: "",
    serialNumber: "",
    accuracyClass: "III",
    maxCapacity: "",
    minCapacity: "",
    verificationScaleInt_e: "",
    actualScaleInt_d: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/instruments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const data = await response.json();
        router.push(`/dashboard/test/${data.id}`); // Proceed to test environment setup
      } else {
        alert("Failed to create instrument");
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center space-x-3 mb-6 border-b pb-4">
        <Scale className="h-6 w-6 text-blue-600" />
        <h1 className="text-xl font-bold text-gray-900">Register New NAWI for Testing</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Manufacturer</label>
            <input
              required
              type="text"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Model Name/Number</label>
            <input
              required
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Serial Number</label>
            <input
              required
              type="text"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Accuracy Class</label>
            <select
              name="accuracyClass"
              value={formData.accuracyClass}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="I">Class I (Special)</option>
              <option value="II">Class II (High)</option>
              <option value="III">Class III (Medium)</option>
              <option value="IIII">Class IIII (Ordinary)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Max Capacity (Max)</label>
            <input
              required
              type="number"
              step="any"
              name="maxCapacity"
              value={formData.maxCapacity}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Min Capacity (Min)</label>
            <input
              required
              type="number"
              step="any"
              name="minCapacity"
              value={formData.minCapacity}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Verification Scale Interval (e)</label>
            <input
              required
              type="number"
              step="any"
              name="verificationScaleInt_e"
              value={formData.verificationScaleInt_e}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Actual Scale Interval (d)</label>
            <input
              required
              type="number"
              step="any"
              name="actualScaleInt_d"
              value={formData.actualScaleInt_d}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            {loading ? "Saving..." : "Save & Proceed to Testing"}
          </button>
        </div>
      </form>
    </div>
  );
}
