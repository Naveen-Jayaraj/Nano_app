export interface SleepData {
  duration: number; // minutes
  startTime: number; // timestamp
  wakeTime: number; // timestamp
  disturbances: number;
}

export const calculateSleepQuality = (data: SleepData, targetMinutes: number) => {
  let score = 100;

  // Duration impact
  const durationDiff = Math.abs(data.duration - targetMinutes);
  if (durationDiff > 60) score -= 20;
  if (durationDiff > 120) score -= 40;

  // Disturbances impact
  score -= data.disturbances * 5;

  // Late sleep impact
  const startHour = new Date(data.startTime).getHours();
  if (startHour >= 23 || startHour < 4) score -= 10;

  return Math.max(0, score);
};

export const detectSleepDebt = (history: number[], targetMinutes: number) => {
  const average = history.reduce((a, b) => a + b, 0) / history.length;
  return targetMinutes - average;
};
