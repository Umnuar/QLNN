import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppProvider } from "../../AppContext";
import { authApi } from "../../api/authApi";
import { LoginView } from "../../components/auth/LoginView";
import { secureStorage } from "../../utils/secureStorage";

// Mock API & Storage
vi.mock("../../api/authApi", () => ({
	authApi: {
		login: vi.fn(),
	},
}));

vi.mock("../../utils/secureStorage", () => ({
	secureStorage: {
		setItem: vi.fn(),
		getItem: vi.fn(),
		removeItem: vi.fn(),
		clear: vi.fn(),
	},
}));

describe("LoginView (Phần 2.1)", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("1. Đăng nhập thành công", async () => {
		(authApi.login as any).mockResolvedValue({
			accessToken: "token-123",
			refreshToken: "refresh-456",
			user: { id: "1", username: "admin", role: "admin" },
		});

		render(
			<AppProvider>
				<LoginView />
			</AppProvider>,
		);

		const usernameInput = screen.getByPlaceholderText("Nhập tài khoản");
		const passwordInput = screen.getByPlaceholderText("Nhập mật khẩu");
		const submitBtn = screen.getByRole("button", { name: /ĐĂNG NHẬP/i });

		fireEvent.change(usernameInput, { target: { value: "admin" } });
		fireEvent.change(passwordInput, { target: { value: "123456" } });

		// Form submission
		fireEvent.submit(submitBtn);

		await waitFor(() => {
			expect(authApi.login).toHaveBeenCalledWith({
				username: "admin",
				password: "123456",
			});
			expect(secureStorage.setItem).toHaveBeenCalledWith(
				"accessToken",
				"token-123",
			);
			expect(secureStorage.setItem).toHaveBeenCalledWith(
				"user",
				JSON.stringify({ id: "1", username: "admin", role: "admin" }),
			);
		});
	});

	it("2. Đăng nhập thất bại hiện lỗi", async () => {
		(authApi.login as any).mockRejectedValue({
			response: { data: { error: "Sai tài khoản hoặc mật khẩu" } },
		});

		render(
			<AppProvider>
				<LoginView />
			</AppProvider>,
		);

		const usernameInput = screen.getByPlaceholderText("Nhập tài khoản");
		const passwordInput = screen.getByPlaceholderText("Nhập mật khẩu");
		const submitBtn = screen.getByRole("button", { name: /ĐĂNG NHẬP/i });

		fireEvent.change(usernameInput, { target: { value: "wrong_user" } });
		fireEvent.change(passwordInput, { target: { value: "wrong_pass" } });

		fireEvent.submit(submitBtn);

		await waitFor(() => {
			expect(
				screen.getByText("Sai tài khoản hoặc mật khẩu"),
			).toBeInTheDocument();
		});
	});
});
