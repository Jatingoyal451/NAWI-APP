import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fallbackStore, InMemoryTestReport } from "@/lib/store";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    const temperature = parseFloat(data.temperature) || 20;
    const humidity = parseFloat(data.humidity) || 50;
    const pressure = parseFloat(data.pressure) || 1013.25;

    try {
      const report = await prisma.testReport.create({
        data: {
          instrumentId: data.instrumentId,
          testerId: data.testerId,
          temperature,
          humidity,
          pressure,
          status: "DRAFT",
        },
      });
      return NextResponse.json(report);
    } catch (dbErr) {
      console.warn("Database not available, using in-memory store for report:", dbErr);
      const instrument = fallbackStore.instruments.find((i: any) => i.id === data.instrumentId) || {
        id: data.instrumentId,
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

      const newReport: InMemoryTestReport = {
        id: "rep-" + Date.now(),
        instrumentId: data.instrumentId,
        instrument,
        testerId: data.testerId,
        tester: { id: data.testerId, name: "Admin User", email: "admin@nawi.com" },
        temperature,
        humidity,
        pressure,
        status: "DRAFT",
        qrCodeHash: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        testResults: [],
      };
      fallbackStore.reports.push(newReport);
      return NextResponse.json(newReport);
    }
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 });
  }
}
