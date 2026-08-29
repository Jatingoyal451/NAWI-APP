import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fallbackStore, InMemoryTestResult } from "@/lib/store";
import crypto from "crypto";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();

    const testTypes = ["weighingData", "eccentricityData", "repeatabilityData", "tareData"] as const;
    const testTypeMap: Record<string, string> = {
      weighingData: "WEIGHING",
      eccentricityData: "ECCENTRICITY",
      repeatabilityData: "REPEATABILITY",
      tareData: "TARE",
    };

    const hash = crypto.createHash("sha256").update(id + Date.now().toString()).digest("hex");
    const testResultsToSave: InMemoryTestResult[] = [];

    for (const key of testTypes) {
      const rows = data[key];
      if (rows && rows.length > 0) {
        const passed = rows.every((r: any) => r.passed === true);
        const newResult: InMemoryTestResult = {
          id: "res-" + Math.random().toString(36).slice(2, 9),
          reportId: id,
          testType: testTypeMap[key],
          data: JSON.stringify(rows),
          passed,
          createdAt: new Date(),
        };
        testResultsToSave.push(newResult);

        try {
          await prisma.testResult.create({
            data: {
              reportId: id,
              testType: testTypeMap[key],
              data: JSON.stringify(rows),
              passed,
            },
          });
        } catch (dbErr) {
          // ignore db error, will save to in-memory store
        }
      }
    }

    try {
      const report = await prisma.testReport.update({
        where: { id },
        data: { status: data.status, qrCodeHash: hash },
      });
      return NextResponse.json(report);
    } catch (dbErr) {
      console.warn("Database not available, updating in-memory report:", dbErr);
      let memReport = fallbackStore.reports.find((r: any) => r.id === id);
      if (!memReport) {
        memReport = {
          id,
          instrumentId: "inst-1",
          instrument: fallbackStore.instruments[0] || {
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
          },
          testerId: "1",
          tester: { id: "1", name: "Admin User", email: "admin@nawi.com" },
          temperature: 22.5,
          humidity: 50,
          pressure: 1013.2,
          status: data.status,
          qrCodeHash: hash,
          createdAt: new Date(),
          updatedAt: new Date(),
          testResults: testResultsToSave,
        };
        fallbackStore.reports.push(memReport);
      } else {
        memReport.status = data.status;
        memReport.qrCodeHash = hash;
        memReport.testResults = testResultsToSave;
      }
      return NextResponse.json(memReport);
    }
  } catch (error) {
    console.error("Complete error", error);
    return NextResponse.json({ error: "Failed to complete report" }, { status: 500 });
  }
}
