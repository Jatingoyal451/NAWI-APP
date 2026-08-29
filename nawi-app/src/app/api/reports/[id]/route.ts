import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fallbackStore } from "@/lib/store";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    try {
      const report = await prisma.testReport.findUnique({
        where: { id: id },
        include: {
          instrument: true,
          tester: { select: { name: true, email: true } },
          testResults: true,
        },
      });

      if (report) return NextResponse.json(report);
    } catch (dbErr) {
      console.warn("Database not available, finding report in fallback store");
    }

    const memReport = fallbackStore.reports.find((r: any) => r.id === id);
    if (memReport) {
      return NextResponse.json(memReport);
    }

    // Default mock report for direct links
    const defaultInst = fallbackStore.instruments[0] || {
      id: "inst-1",
      manufacturer: "Avery Weigh-Tronix",
      model: "ZK830-15K",
      serialNumber: "AW-2024-9842",
      accuracyClass: "III",
      maxCapacity: 15,
      minCapacity: 0.1,
      verificationScaleInt_e: 0.005,
      actualScaleInt_d: 0.001,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json({
      id: id,
      instrumentId: defaultInst.id,
      instrument: defaultInst,
      testerId: "1",
      tester: { name: "Admin User", email: "admin@nawi.com" },
      temperature: 22.5,
      humidity: 50,
      pressure: 1013.2,
      status: "DRAFT",
      qrCodeHash: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      testResults: [],
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 });
  }
}
