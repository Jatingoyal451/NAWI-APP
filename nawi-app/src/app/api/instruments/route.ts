import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fallbackStore, InMemoryInstrument } from "@/lib/store";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    const maxCapacity = parseFloat(data.maxCapacity) || 0;
    const minCapacity = parseFloat(data.minCapacity) || 0;
    const e = parseFloat(data.verificationScaleInt_e) || 0;
    const d = parseFloat(data.actualScaleInt_d) || 0;

    try {
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
    } catch (dbErr) {
      console.warn("Database not available, using in-memory store for instrument:", dbErr);
      const newInst: InMemoryInstrument = {
        id: "inst-" + Date.now(),
        manufacturer: data.manufacturer,
        model: data.model,
        serialNumber: data.serialNumber,
        accuracyClass: data.accuracyClass,
        maxCapacity: maxCapacity,
        minCapacity: minCapacity,
        verificationScaleInt_e: e,
        actualScaleInt_d: d,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      fallbackStore.instruments.push(newInst);
      return NextResponse.json(newInst);
    }
  } catch (error) {
    console.error("Error creating instrument:", error);
    return NextResponse.json({ error: "Failed to create instrument" }, { status: 500 });
  }
}
