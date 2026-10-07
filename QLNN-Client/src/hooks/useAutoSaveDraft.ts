import { useCallback, useEffect, useRef, useState } from "react";
import { clearDraft, getDraft, saveDraft } from "../services/db";

export interface UseAutoSaveDraftReturn<T> {
	lastSaved: number | null;
	isSaving: boolean;
	loadDraft: () => Promise<T | null>;
	discardDraft: () => Promise<void>;
	saveNow: () => Promise<void>;
}

/**
 * Hook tự động lưu nháp dữ liệu biểu mẫu vào IndexedDB store `drafts` mỗi 5 giây.
 * Tuân thủ tiêu chuẩn Hệ sinh thái Đăk Hà (PROJECT_DOCUMENT.md - 2.1.3 & 2.5).
 */
export function useAutoSaveDraft<T>(
	formId: string,
	formData: T,
	isDirty = true,
): UseAutoSaveDraftReturn<T> {
	const [lastSaved, setLastSaved] = useState<number | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	const formDataRef = useRef<T>(formData);
	formDataRef.current = formData;

	const isDirtyRef = useRef<boolean>(isDirty);
	isDirtyRef.current = isDirty;

	const saveNow = useCallback(async () => {
		if (!formId || !isDirtyRef.current) return;
		try {
			setIsSaving(true);
			await saveDraft(formId, formDataRef.current);
			setLastSaved(Date.now());
		} catch (err) {
			console.error(`[useAutoSaveDraft] Lỗi khi lưu nháp form ${formId}:`, err);
		} finally {
			setIsSaving(false);
		}
	}, [formId]);

	// Tự động lưu định kỳ mỗi 5 giây
	useEffect(() => {
		if (!formId || !isDirty) return;

		const interval = setInterval(() => {
			if (isDirtyRef.current) {
				saveNow();
			}
		}, 5000);

		return () => clearInterval(interval);
	}, [formId, isDirty, saveNow]);

	const loadDraft = useCallback(async (): Promise<T | null> => {
		if (!formId) return null;
		try {
			const draft = await getDraft<T>(formId);
			return draft;
		} catch (err) {
			console.error(`[useAutoSaveDraft] Lỗi khi đọc nháp form ${formId}:`, err);
			return null;
		}
	}, [formId]);

	const discardDraft = useCallback(async () => {
		if (!formId) return;
		try {
			await clearDraft(formId);
			setLastSaved(null);
		} catch (err) {
			console.error(`[useAutoSaveDraft] Lỗi khi xóa nháp form ${formId}:`, err);
		}
	}, [formId]);

	return {
		lastSaved,
		isSaving,
		loadDraft,
		discardDraft,
		saveNow,
	};
}
