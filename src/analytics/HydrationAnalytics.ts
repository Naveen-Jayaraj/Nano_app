export const calculateHydrationTarget = (baseTargetMl: number, temperature: number, steps: number, stepTarget: number) => {
  let finalTarget = baseTargetMl;

  // Weather adjustment: +10% if > 30°C
  if (temperature > 30) {
    finalTarget *= 1.1;
  }

  // Activity adjustment: +15% if steps > target
  if (steps > stepTarget) {
    finalTarget *= 1.15;
  }

  return Math.round(finalTarget);
};

export const getDehydrationRisk = (lastLogTime: number, currentIntakeMl: number, targetMl: number) => {
  const hoursSinceLastLog = (Date.now() - lastLogTime) / (1000 * 60 * 60);
  
  if (hoursSinceLastLog > 4 && currentIntakeMl < targetMl * 0.5) {
    return 'High';
  }
  if (hoursSinceLastLog > 3 || currentIntakeMl < targetMl * 0.7) {
    return 'Moderate';
  }
  return 'Low';
};
