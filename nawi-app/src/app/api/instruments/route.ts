import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    const maxCapacity = parseFloat(data.maxCapacity);
    const minCapacity = parseFloat(data.minCapacity);
    const e = parseFloat(data.verificationScaleInt_e);
    const d = parseFloat(data.actualScaleInt_d);

    const instrument = await prisma.instrument.create({
      data: {
        manufacturer: data.manufacturer,
        model: data.model,
        serialNumber: data.serialNumber,
        accuracyClass: data.accuracyClass,
        maxCapacity: maxCapacity,
        minCapacity: minCapacity,
        verificationScaleInt_e: e,
        actualScaleInt_d: d,
      },
    });

    return NextResponse.json(instrument);
  } catch (error) {
    console.error("Error creating instrument:", error);
    return NextResponse.json({ error: "Failed to create instrument" }, { status: 500 });
  }
}
