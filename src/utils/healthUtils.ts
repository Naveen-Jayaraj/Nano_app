export const calculateBMI = (weightKg: number, heightCm: number) => {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
};

export const getBMICategory = (bmi: number) => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

export const deriveBaselines = (age: number, weight: number, bmi: number) => {
  // Step target: base 6000, adjusted for age and BMI
  let stepTarget = 8000;
  if (age > 60) stepTarget -= 2000;
  if (bmi > 30) stepTarget -= 1000;

  // Sleep target: age-based
  let sleepTarget = 480; // 8 hours in minutes
  if (age < 18) sleepTarget = 540; // 9 hours
  if (age > 65) sleepTarget = 420; // 7 hours

  // Water target: weight * 0.033 L/day
  const waterTargetMl = weight * 33;

  return {
    stepTarget,
    sleepTarget,
    waterTargetMl,
    activityIntensity: bmi > 30 ? 'Moderate' : 'High',
  };
};
