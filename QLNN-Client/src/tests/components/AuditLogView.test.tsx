import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppProvider } from "../../AppContext";
import { auditApi } from "../../api/auditApi";
import { AuditLogView } from "../../components/audit/AuditLogView";

// Mock API
vi.mock("../../api/auditApi", () => ({
	auditApi: {
		getLogs: vi.fn(),
	},
}));

vi.mock("../../api/authApi", () => ({
	authApi: {
		getUsers: vi.fn().mockResolvedValue([]),
		getMe: vi.fn().mockResolvedValue({
			id: "admin-id",
			username: "admin",
			role: "admin",
		}),
	},
}));

vi.mock("../../api/villageApi", () => ({
	villageApi: {
		getAll: vi.fn().mockResolvedValue([
			{ id: "1", name: "Thôn 1" },
			{ id: "2", name: "Thôn 2" },
			{ id: "3", name: "Thôn 3" },
			{ id: "4", name: "Thôn 4" },
			{ id: "5", name: "Thôn 5" },
			{ id: "6", name: "Kon Đao Yôp" },
			{ id: "7", name: "Kon Hnông Bách" },
		]),
	},
}));

const mockLogs = {
	data: [
		{
			id: "1",
			action: "UPDATE",
			username: "admin",
			created_at: new Date().toISOString(),
			details: { "Cà phê (Hộ gia đình) (ha)": { old: 0, new: 100 } },
		},
		{
			id: "2",
			action: "RESTORE",
			username: "admin",
			created_at: new Date().toISOString(),
			details: { message: "Khôi phục 1 hộ dân", names: ["Nguyễn Văn A"] },
		},
	],
	pagination: { total: 2 },
};

describe("AuditLogView UI (Phần 2.4)", () => {
	it("1. Render giao diện Timeline thành công", async () => {
		(auditApi.getLogs as any).mockResolvedValueOnce(mockLogs);

		render(
			<AppProvider>
				<AuditLogView showFilters={true} />
			</AppProvider>,
		);

		// Kiểm tra API được gọi
		expect(auditApi.getLogs).toHaveBeenCalled();

		// Đợi render
		await waitFor(() => {
			expect(screen.getByText("Khôi phục 1 hộ dân")).toBeInTheDocument();
			expect(
				screen.getByText("Cà phê (Hộ gia đình) (ha):"),
			).toBeInTheDocument();
		});
	});

	it('2. Filter theo Action "RESTORE"', async () => {
		(auditApi.getLogs as any).mockResolvedValue(mockLogs);

		render(
			<AppProvider>
				<AuditLogView />
			</AppProvider>,
		);

		await waitFor(() => {
			expect(screen.getByText("Khôi phục 1 hộ dân")).toBeInTheDocument();
		});

		const restorePill = screen.getByRole("button", { name: "Khôi Phục" });
		fireEvent.click(restorePill);

		// Cà phê (UPDATE) sẽ bị ẩn đi
		expect(
			screen.queryByText("Cà phê (Hộ gia đình) (ha):"),
		).not.toBeInTheDocument();
		// Nhưng Khôi phục vẫn còn
		expect(screen.getByText("Khôi phục 1 hộ dân")).toBeInTheDocument();
	});

	it("3. Render và tương tác dropdown chọn thôn (chuẩn QLHK)", async () => {
		(auditApi.getLogs as any).mockResolvedValue(mockLogs);
		localStorage.setItem("accessToken", "mock-token");
		localStorage.setItem(
			"user",
			JSON.stringify({ id: "admin-id", username: "admin", role: "admin" }),
		);

		try {
			render(
				<AppProvider>
					<AuditLogView showFilters={true} />
				</AppProvider>,
			);

			await waitFor(() => {
				expect(screen.getByText("Khôi phục 1 hộ dân")).toBeInTheDocument();
			});

			// Dropdown Địa bàn thôn hiển thị với nhãn
			const villageDropdown = await screen.findByRole("button", {
				name: /Địa bàn thôn/i,
			});
			expect(villageDropdown).toBeInTheDocument();

			// Click mở dropdown
			fireEvent.click(villageDropdown);

			// Ô tìm kiếm xuất hiện trong dropdown
			const searchInput = await screen.findByPlaceholderText("Tìm kiếm...");
			expect(searchInput).toBeInTheDocument();

			// Tùy chọn Toàn xã (Tất cả thôn) hiển thị
			expect(
				screen.getAllByText("Toàn xã (Tất cả thôn)").length,
			).toBeGreaterThanOrEqual(1);
		} finally {
			localStorage.clear();
		}
	});
});
