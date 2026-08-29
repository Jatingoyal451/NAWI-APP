import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const report = await prisma.testReport.findUnique({
      where: { id: id },
      include: {
        instrument: true,
        tester: { select: { name: true, email: true } },
        testResults: true,
      }
    });

    if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });

    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 });
  }
}
