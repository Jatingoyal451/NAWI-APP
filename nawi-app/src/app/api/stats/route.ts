import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fallbackStore } from "@/lib/store";

export async function GET() {
  try {
    try {
      const [total, passed, failed, draft] = await Promise.all([
        prisma.testReport.count(),
        prisma.testReport.count({ where: { status: "COMPLETED" } }),
        prisma.testReport.count({ where: { status: "FAILED" } }),
        prisma.testReport.count({ where: { status: "DRAFT" } }),
      ]);

      const recent = await prisma.testReport.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { instrument: { select: { manufacturer: true, model: true } } },
      });

      return NextResponse.json({ total, passed, failed, draft, recent });
    } catch (dbErr) {
      console.warn("DB not available, using in-memory stats");
      const reports = fallbackStore.reports;
      const total = reports.length;
      const passed = reports.filter((r: any) => r.status === "COMPLETED").length;
      const failed = reports.filter((r: any) => r.status === "FAILED").length;
      const draft = reports.filter((r: any) => r.status === "DRAFT").length;
      const recent = reports.slice(-5).reverse().map((r: any) => ({
        id: r.id,
        status: r.status,
        createdAt: r.createdAt.toISOString(),
        instrument: {
          manufacturer: r.instrument?.manufacturer || "Avery",
          model: r.instrument?.model || "ZK830",
        },
      }));
      return NextResponse.json({ total, passed, failed, draft, recent });
    }
  } catch (error) {
    return NextResponse.json({ total: 0, passed: 0, failed: 0, draft: 0, recent: [] });
  }
}
