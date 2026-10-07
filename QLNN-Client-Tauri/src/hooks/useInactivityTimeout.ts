import { useCallback, useEffect, useRef } from "react";

const TIMEOUT_MS = 30 * 60 * 1000; // 30 phút

export function useInactivityTimeout(
	onTimeout: () => void,
	isEnabled: boolean = true,
) {
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const onTimeoutRef = useRef(onTimeout);
	const lastActivityRef = useRef(0);

	useEffect(() => {
		onTimeoutRef.current = onTimeout;
	}, [onTimeout]);

	const resetTimer = useCallback(() => {
		if (timerRef.current) {
			clearTimeout(timerRef.current);
		}
		if (isEnabled) {
			timerRef.current = setTimeout(() => {
				console.warn(
					"[Session] Hết thời gian chờ phiên 30 phút không hoạt động -> Tự động đăng xuất.",
				);
				onTimeoutRef.current();
			}, TIMEOUT_MS);
		}
	}, [isEnabled]);

	useEffect(() => {
		if (!isEnabled) return;

		const events = [
			"mousedown",
			"mousemove",
			"keydown",
			"scroll",
			"touchstart",
			"click",
		];
		const handleActivity = () => {
			const now = Date.now();
			if (now - lastActivityRef.current > 2000) {
				lastActivityRef.current = now;
				resetTimer();
			}
		};

		for (const evt of events) {
			window.addEventListener(evt, handleActivity);
		}
		resetTimer();

		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
			for (const evt of events) {
				window.removeEventListener(evt, handleActivity);
			}
		};
	}, [isEnabled, resetTimer]);
}
