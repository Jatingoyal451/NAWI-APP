import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fallbackStore } from "@/lib/store";

export async function GET() {
  try {
    try {
      const byClass = await prisma.instrument.findMany({
        include: {
          testReports: { select: { status: true } },
        },
      });

      const classSummary: Record<string, { total: number; failed: number }> = {};
      byClass.forEach(inst => {
        if (!classSummary[inst.accuracyClass]) classSummary[inst.accuracyClass] = { total: 0, failed: 0 };
        inst.testReports.forEach(r => {
          classSummary[inst.accuracyClass].total++;
          if (r.status === "FAILED") classSummary[inst.accuracyClass].failed++;
        });
      });

      const allReports = await prisma.testReport.findMany({
        select: { createdAt: true, status: true },
        orderBy: { createdAt: "asc" },
      });

      return NextResponse.json({ classSummary, allReports });
    } catch (dbErr) {
      console.warn("DB not available, using in-memory analytics");
      const instruments = fallbackStore.instruments;
      const reports = fallbackStore.reports;
      const classSummary: Record<string, { total: number; failed: number }> = {
        I: { total: 0, failed: 0 },
        II: { total: 0, failed: 0 },
        III: { total: reports.length, failed: reports.filter((r: any) => r.status === "FAILED").length },
        IIII: { total: 0, failed: 0 },
      };

      const allReports = reports.map((r: any) => ({
        createdAt: r.createdAt.toISOString(),
        status: r.status,
      }));

      return NextResponse.json({ classSummary, allReports });
    }
  } catch {
    return NextResponse.json({ classSummary: {}, allReports: [] });
  }
}
