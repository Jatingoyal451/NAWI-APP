import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    const temperature = parseFloat(data.temperature);
    const humidity = parseFloat(data.humidity);
    const pressure = parseFloat(data.pressure);

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
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 });
  }
}
