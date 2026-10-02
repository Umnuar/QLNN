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

export const pruneInactiveUsers = () => {
	const now = Date.now();
	for (const [userId, lastActive] of activeUsers.entries()) {
		if (now - lastActive >= 5 * 60 * 1000) {
			activeUsers.delete(userId);
		}
	}
};

if (process.env.NODE_ENV !== "test") {
	const timer = setInterval(pruneInactiveUsers, 60 * 1000);
	timer.unref?.();
}
