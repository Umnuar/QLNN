export const activeUsers = new Map<string, number>();

export const trackActivity = (userId: string) => {
  activeUsers.set(userId, Date.now());
};

export const isUserOnline = (userId: string): boolean => {
  const lastActive = activeUsers.get(userId);
  if (!lastActive) return false;
  // Threshold: 5 minutes
  return Date.now() - lastActive < 5 * 60 * 1000;
};
