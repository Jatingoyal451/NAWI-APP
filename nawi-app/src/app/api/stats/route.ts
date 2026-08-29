import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
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
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
