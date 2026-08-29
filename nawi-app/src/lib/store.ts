// Fallback in-memory storage for demo & deployments without external PostgreSQL
export interface InMemoryInstrument {
  id: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  accuracyClass: string;
  maxCapacity: number;
  minCapacity: number;
  verificationScaleInt_e: number;
  actualScaleInt_d: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface InMemoryTestResult {
  id: string;
  reportId: string;
  testType: string;
  data: string;
  passed: boolean;
  createdAt: Date;
}

export interface InMemoryTestReport {
  id: string;
  instrumentId: string;
  instrument?: InMemoryInstrument;
  testerId: string;
  tester?: { id: string; name: string; email: string };
  temperature: number;
  humidity: number;
  pressure: number;
  status: string;
  qrCodeHash?: string | null;
  createdAt: Date;
  updatedAt: Date;
  testResults: InMemoryTestResult[];
}

const initialInstruments: InMemoryInstrument[] = [
  {
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
];

const globalStore = (globalThis as any).__NAWI_STORE__ || {
  instruments: initialInstruments,
  reports: [] as InMemoryTestReport[],
  results: [] as InMemoryTestResult[],
  users: [
    { id: "1", name: "Admin User", email: "admin@nawi.com", role: "ADMIN" },
    { id: "2", name: "Lab Technician", email: "tech@nawi.com", role: "TECHNICIAN" },
  ],
};
(globalThis as any).__NAWI_STORE__ = globalStore;

export const fallbackStore = globalStore;
