import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
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
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
