import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.testResult.deleteMany();
  await prisma.testReport.deleteMany();
  await prisma.instrument.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const admin = await prisma.user.create({
    data: { id: "1", name: "Admin User", email: "admin@nawi.com", role: "ADMIN" },
  });
  const tech = await prisma.user.create({
    data: { id: "2", name: "Lab Technician", email: "tech@nawi.com", role: "TECHNICIAN" },
  });

  // Create instruments
  const instruments = await Promise.all([
    prisma.instrument.create({
      data: {
        manufacturer: "Mettler Toledo",
        model: "ME4002TE/00",
        serialNumber: "MT-2024-001",
        accuracyClass: "II",
        maxCapacity: 4000,
        minCapacity: 1,
        verificationScaleInt_e: 0.01,
        actualScaleInt_d: 0.01,
      },
    }),
    prisma.instrument.create({
      data: {
        manufacturer: "Sartorius AG",
        model: "BL6200S",
        serialNumber: "SA-2024-002",
        accuracyClass: "III",
        maxCapacity: 6200,
        minCapacity: 2,
        verificationScaleInt_e: 0.1,
        actualScaleInt_d: 0.1,
      },
    }),
    prisma.instrument.create({
      data: {
        manufacturer: "Kern & Sohn",
        model: "EHA 200K50A",
        serialNumber: "KS-2024-003",
        accuracyClass: "III",
        maxCapacity: 200000,
        minCapacity: 100,
        verificationScaleInt_e: 50,
        actualScaleInt_d: 50,
      },
    }),
    prisma.instrument.create({
      data: {
        manufacturer: "Ohaus Corporation",
        model: "FD15H",
        serialNumber: "OC-2024-004",
        accuracyClass: "IIII",
        maxCapacity: 15000,
        minCapacity: 500,
        verificationScaleInt_e: 5,
        actualScaleInt_d: 5,
      },
    }),
  ]);

  // Create test reports with results
  const statuses = ["COMPLETED", "COMPLETED", "COMPLETED", "FAILED", "DRAFT"];

  for (let i = 0; i < instruments.length; i++) {
    const status = statuses[i % statuses.length];
    const hash = Buffer.from(`report-hash-${i}-${Date.now()}`).toString("hex");
    
    const report = await prisma.testReport.create({
      data: {
        instrumentId: instruments[i].id,
        testerId: i % 2 === 0 ? admin.id : tech.id,
        temperature: 22.5 + (i * 0.3),
        humidity: 55 + i,
        pressure: 1013.25,
        status: status,
        qrCodeHash: status === "DRAFT" ? null : hash,
      },
    });

    if (status !== "DRAFT") {
      const e = instruments[i].verificationScaleInt_e;
      const max = instruments[i].maxCapacity;

      const weighingRows = [
        { load: max * 0.1, indication: max * 0.1 + e * (status === "FAILED" ? 2 : 0.3), error: e * (status === "FAILED" ? 2 : 0.3), mpe: e * 0.5, passed: status !== "FAILED" },
        { load: max * 0.5, indication: max * 0.5 + e * 0.5, error: e * 0.5, mpe: e, passed: true },
        { load: max, indication: max + e * 0.8, error: e * 0.8, mpe: e * 1.5, passed: true },
      ];

      await prisma.testResult.create({
        data: {
          reportId: report.id,
          testType: "WEIGHING",
          data: JSON.stringify(weighingRows),
          passed: status === "COMPLETED",
        },
      });

      const eccentricityRows = [
        { position: "Center", load: max * 0.2, indication: max * 0.2 + e * 0.2, error: e * 0.2, mpe: e * 0.5, passed: true },
        { position: "Front Left", load: max * 0.2, indication: max * 0.2 + e * 0.3, error: e * 0.3, mpe: e * 0.5, passed: true },
        { position: "Back Right", load: max * 0.2, indication: max * 0.2 + e * 0.4, error: e * 0.4, mpe: e * 0.5, passed: true },
      ];

      await prisma.testResult.create({
        data: {
          reportId: report.id,
          testType: "ECCENTRICITY",
          data: JSON.stringify(eccentricityRows),
          passed: true,
        },
      });

      await prisma.testResult.create({
        data: {
          reportId: report.id,
          testType: "REPEATABILITY",
          data: JSON.stringify([
            { trial: 1, load: max * 0.5, indication: max * 0.5 + e * 0.1, error: e * 0.1, mpe: e, passed: true },
            { trial: 2, load: max * 0.5, indication: max * 0.5 + e * 0.2, error: e * 0.2, mpe: e, passed: true },
            { trial: 3, load: max * 0.5, indication: max * 0.5 + e * 0.15, error: e * 0.15, mpe: e, passed: true },
          ]),
          passed: true,
        },
      });
    }
  }

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
