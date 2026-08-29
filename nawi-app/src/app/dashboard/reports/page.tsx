import { prisma } from "@/lib/prisma";
import { fallbackStore } from "@/lib/store";
import Link from "next/link";
import { FileText, Eye } from "lucide-react";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function ReportsListPage() {
  let reports: any[] = [];
  try {
    reports = await prisma.testReport.findMany({
      include: {
        instrument: true,
        tester: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.warn("DB query failed, using fallbackStore reports");
  }

  if (!reports || reports.length === 0) {
    reports = fallbackStore.reports || [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Test Repository</h1>
        <p className="text-gray-500">History of all NAWI model approval tests.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID / Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instrument</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tester</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">#{report.id.slice(-6).toUpperCase()}</div>
                  <div className="text-sm text-gray-500">{format(report.createdAt, "PP")}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{report.instrument.manufacturer}</div>
                  <div className="text-sm text-gray-500">{report.instrument.model}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    report.status === "COMPLETED" ? "bg-green-100 text-green-800" : 
                    report.status === "FAILED" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {report.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {report.tester.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/dashboard/reports/${report.id}`} className="text-blue-600 hover:text-blue-900 flex items-center justify-end space-x-1">
                    <Eye className="h-4 w-4" /> <span>View</span>
                  </Link>
                </td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  No reports found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
