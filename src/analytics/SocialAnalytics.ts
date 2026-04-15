export interface SocialSignals {
  consecutiveHomeDays: number;
  missedCalls: number;
  communicationActivityScore: number; // 0-10 based on notifications/app usage
}

export const detectSocialWithdrawalRisk = (signals: SocialSignals) => {
  const { consecutiveHomeDays, missedCalls, communicationActivityScore } = signals;

  if (consecutiveHomeDays >= 4 && missedCalls > 5 && communicationActivityScore < 3) {
    return 'Severe Withdrawal';
  }
  if (consecutiveHomeDays >= 3 && communicationActivityScore < 5) {
    return 'Moderate Withdrawal';
  }
  if (consecutiveHomeDays >= 2) {
    return 'Mild Isolation';
  }
  return 'Healthy';
};

export const getSocialIntervention = (riskLevel: string) => {
  switch (riskLevel) {
    case 'Severe Withdrawal': return 'Call a close friend or family member today. Consider a short walk outside.';
    case 'Moderate Withdrawal': return 'Respond to at least 3 messages and try to go outside for 15 minutes.';
    case 'Mild Isolation': return 'It looks like you have been home for a while. How about a quick visit to a local shop?';
    default: return 'You are doing great! Keep staying connected.';
  }
};
