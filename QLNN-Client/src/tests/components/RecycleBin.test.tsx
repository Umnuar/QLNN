import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppProvider } from "../../AppContext";
import { householdApi } from "../../api/householdApi";
import { RecycleBinPage } from "../../pages/RecycleBinPage";

// Mock API
vi.mock("../../api/householdApi", () => ({
	householdApi: {
		getDeleted: vi.fn(),
		restore: vi.fn(),
		hardDelete: vi.fn(),
	},
}));

const mockData = {
	data: [
		{
			id: "1",
			full_name: "Nguyễn Văn A",
			village_name: "Thôn 1",
		},
	],
	pagination: { page: 1, limit: 50, total: 1, totalPages: 1 },
};

// Mock window functions
const originalConfirm = window.confirm;
const originalAlert = window.alert;

describe("RecycleBinPage (Phần 2.3)", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		(householdApi.getDeleted as any).mockResolvedValue(mockData);
		(householdApi.restore as any).mockResolvedValue({});
		(householdApi.hardDelete as any).mockResolvedValue({});

		window.confirm = vi.fn(() => true);
		window.alert = vi.fn();
	});

	afterEach(() => {
		window.confirm = originalConfirm;
		window.alert = originalAlert;
	});

	it("1. Render danh sách đã xóa và Khôi phục", async () => {
		render(
			<AppProvider>
				<RecycleBinPage />
			</AppProvider>,
		);

		await waitFor(() => {
			expect(screen.getByText("Nguyễn Văn A")).toBeInTheDocument();
		});

		// Chọn hộ
		const checkboxes = screen.getAllByRole("checkbox");
		// checkbox đầu tiên có thể là select all, checkbox 2 là hộ
		fireEvent.click(checkboxes[1]);

		const restoreBtn = await screen.findByRole("button", {
			name: /Khôi phục \(1\)/i,
		});
		expect(restoreBtn).toBeInTheDocument();

		fireEvent.click(restoreBtn);

		await waitFor(() => {
			expect(householdApi.restore).toHaveBeenCalledWith(["1"]);
		});
	});

	it("2. Xoá vĩnh viễn (admin)", async () => {
		// Để có quyền admin, ta cần mock giá trị user của AppContext
		// Tuy nhiên theo mặc định trong test chưa có user admin,
		// ta có thể bypass bằng cách mock context hoặc sử dụng trick render với user giả nếu context cho phép
		// Ở đây ta gọi trực tiếp nút Xóa ở dòng của Table
		render(
			<AppProvider>
				<RecycleBinPage />
			</AppProvider>,
		);

		await waitFor(() => {
			expect(screen.getByText("Nguyễn Văn A")).toBeInTheDocument();
		});

		const deleteBtn = screen.getByRole("button", { name: /Xóa hộ/i });
		fireEvent.click(deleteBtn);

		await waitFor(() => {
			expect(window.confirm).toHaveBeenCalled();
			expect(householdApi.hardDelete).toHaveBeenCalledWith(["1"]);
		});
	});
});
