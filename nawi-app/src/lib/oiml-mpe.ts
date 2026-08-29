export function calculateMPE(
  load: number,
  e: number,
  accuracyClass: string
): number {
  const m = load / e;
  let mpeMultiplier = 0.5;

  switch (accuracyClass) {
    case "I":
      if (m >= 0 && m <= 50000) mpeMultiplier = 0.5;
      else if (m > 50000 && m <= 200000) mpeMultiplier = 1.0;
      else if (m > 200000) mpeMultiplier = 1.5;
      break;
    case "II":
      if (m >= 0 && m <= 5000) mpeMultiplier = 0.5;
      else if (m > 5000 && m <= 20000) mpeMultiplier = 1.0;
      else if (m > 20000 && m <= 100000) mpeMultiplier = 1.5;
      break;
    case "III":
      if (m >= 0 && m <= 500) mpeMultiplier = 0.5;
      else if (m > 500 && m <= 2000) mpeMultiplier = 1.0;
      else if (m > 2000 && m <= 10000) mpeMultiplier = 1.5;
      break;
    case "IIII":
      if (m >= 0 && m <= 50) mpeMultiplier = 0.5;
      else if (m > 50 && m <= 200) mpeMultiplier = 1.0;
      else if (m > 200 && m <= 1000) mpeMultiplier = 1.5;
      break;
    default:
      mpeMultiplier = 1.5; // fallback
  }

  return mpeMultiplier * e;
}

export function checkCompliance(error: number, mpe: number): boolean {
  return Math.abs(error) <= mpe;
}
