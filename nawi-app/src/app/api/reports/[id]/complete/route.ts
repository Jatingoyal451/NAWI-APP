import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

    for (const key of testTypes) {
      const rows = data[key];
      if (rows && rows.length > 0) {
        const passed = rows.every((r: any) => r.passed === true);
        await prisma.testResult.create({
          data: {
            reportId: id,
            testType: testTypeMap[key],
            data: JSON.stringify(rows),
            passed,
          },
        });
      }
    }

    const hash = crypto.createHash("sha256").update(id + Date.now().toString()).digest("hex");

    const report = await prisma.testReport.update({
      where: { id },
      data: { status: data.status, qrCodeHash: hash },
    });

    return NextResponse.json(report);
  } catch (error) {
    console.error("Complete error", error);
    return NextResponse.json({ error: "Failed to complete report" }, { status: 500 });
  }
}
