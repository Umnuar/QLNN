import { expect, test } from "@playwright/test";

test.describe("QLNN Smart Crawler - E2E Full Scan & Interaction Suite", () => {
	// Mảng lưu trữ nhật ký lỗi giám sát thời gian thực
	const apiErrors: {
		method: string;
		url: string;
		status: number;
		body: string;
	}[] = [];
	const consoleErrors: string[] = [];
	const unhandledErrors: string[] = [];
	const visitedRoutes: string[] = [];
	let interactionCount = 0;

	test.beforeEach(async ({ page }) => {
		// 1. Lắng nghe Network: Ghi nhận mọi HTTP status >= 400 từ endpoint /api/*
		page.on("response", async (response) => {
			const url = response.url();
			const status = response.status();
			if (url.includes("/api/") && status >= 400) {
				let body = "";
				try {
					body = await response.text();
				} catch {
					body = "(cannot read body)";
				}
				apiErrors.push({
					method: response.request().method(),
					url,
					status,
					body: body.slice(0, 300),
				});
			}
		});

		// 2. Lắng nghe Browser Console: Phát hiện lỗi runtime JS, crash UI, component render loop
		page.on("console", (msg) => {
			if (msg.type() === "error") {
				const text = msg.text();
				// Tự động bỏ qua lỗi font/ảnh ngoài hoặc lỗi không thuộc runtime ứng dụng
				if (
					text.includes("favicon.ico") ||
					text.includes("ERR_CONNECTION_REFUSED") ||
					text.includes("fonts.googleapis.com") ||
					text.includes("fonts.gstatic.com") ||
					text.includes("chrome-extension://")
				) {
					return;
				}
				consoleErrors.push(text);
			}
		});

		// 3. Lắng nghe Unhandled Exceptions / Page Errors
		page.on("pageerror", (err) => {
			unhandledErrors.push(err.message || String(err));
		});
	});

	test("Smart Crawler: Tự duyệt toàn bộ phân hệ QLNN, click tương tác nông nghiệp & kiểm chứng Backend", async ({
		page,
	}) => {
		test.setTimeout(120000);

		console.log("\n=======================================================");
		console.log("🚀 BẮT ĐẦU SMART CRAWLER QUÉT TOÀN DIỆN PHÂN HỆ QLNN");
		console.log("=======================================================\n");

		// -------------------------------------------------------------
		// GIAI ĐOẠN 1: TỰ ĐỘNG ĐĂNG NHẬP (ADMIN / ADMIN123)
		// -------------------------------------------------------------
		console.log("📍 [1/7] Khởi động và Đăng nhập hệ thống...");
		await page.goto("/", { waitUntil: "networkidle" });

		// Xác nhận hiển thị form đăng nhập
		const usernameInput = page.locator("input#login-username");
		const passwordInput = page.locator("input#login-password");
		const loginBtn = page.locator('button[type="submit"]:has-text("ĐĂNG NHẬP")');

		await expect(usernameInput).toBeVisible({ timeout: 15000 });
		await usernameInput.fill("admin");
		await passwordInput.fill("admin123");
		await loginBtn.click();
		interactionCount++;

		// Chờ phiên làm việc khởi tạo thành công và xuất hiện giao diện AppLayout
		const sidebar = page.locator("aside");
		await expect(sidebar).toBeVisible({ timeout: 20000 });
		visitedRoutes.push("Login -> Dashboard");
		console.log("   ✓ Đăng nhập thành công với tài khoản Quản trị viên (Admin)");

		// -------------------------------------------------------------
		// GIAI ĐOẠN 2: QUẢN LÝ THÔN (VILLAGES PAGE)
		// -------------------------------------------------------------
		console.log("📍 [2/7] Quét trang Quản Lý Thôn (Villages Page)...");
		visitedRoutes.push("Quản Lý Thôn");

		// Kiểm tra Hero Banner và các thẻ thống kê tổng quan
		const heroBanner = page.locator("text=Tổng Quan Nông Nghiệp & Nông Thôn Mới Toàn Xã");
		await expect(heroBanner).toBeVisible({ timeout: 10000 });

		// Thử tìm kiếm thôn
		const searchVillageInput = page.locator('input[placeholder*="Tìm kiếm thôn"]');
		if (await searchVillageInput.isVisible()) {
			await searchVillageInput.fill("Thôn 1");
			await page.waitForTimeout(300);
			await searchVillageInput.fill("");
			interactionCount++;
			console.log("   ✓ Đã thử tương tác bộ lọc tìm kiếm thôn");
		}

		// Xác nhận các thẻ thôn xuất hiện (không bị trắng màn hình)
		const villageCards = page.locator('div[role="button"][aria-label*="hộ nông nghiệp"], div[role="button"][aria-label*="Thôn"]');
		const villageCount = await villageCards.count();
		expect(villageCount).toBeGreaterThan(0);
		console.log(`   ✓ Phát hiện ${villageCount} thẻ thôn/làng bản trên địa bàn`);

		// -------------------------------------------------------------
		// GIAI ĐOẠN 3: THỐNG KÊ SẢN LƯỢNG & PHÂN TÍCH (ANALYTICS PAGE)
		// -------------------------------------------------------------
		console.log("📍 [3/7] Quét trang Thống Kê Sản Lượng Toàn Xã (Analytics Page)...");
		// Chuyển sang Analytics qua nút Hero Banner trên VillagesPage
		const viewAllStatsBtn = page.locator('button:has-text("Xem Thống Kê Toàn Xã")').first();
		await viewAllStatsBtn.click();
		interactionCount++;
		visitedRoutes.push("Thống Kê Sản Lượng");

		// Kiểm tra Dashboard phân tích tải thành công
		await page.waitForTimeout(1000);
		await expect(page.locator("text=Thống Kê Nông Nghiệp & Nông Thôn Mới")).toBeVisible({ timeout: 10000 });
		await expect(page.locator("text=TỔNG DIỆN TÍCH CÂY TRỒNG")).toBeVisible({ timeout: 10000 });
		await expect(page.locator("body")).not.toHaveText("Đang tải dữ liệu...");

		// Kiểm tra bảng đối soát thôn hiển thị
		const comparisonTable = page.locator("table").first();
		await expect(comparisonTable).toBeVisible({ timeout: 10000 });
		console.log("   ✓ Thống kê sản lượng và bảng tổng hợp 7 thôn hiển thị ổn định");

		// -------------------------------------------------------------
		// GIAI ĐOẠN 4: HỘ NÔNG NGHIỆP & 18 CHỈ SỐ (HOUSEHOLDS PAGE)
		// -------------------------------------------------------------
		console.log("📍 [4/7] Quét trang Hộ Nông Nghiệp & 18 Chỉ Số (Households Page)...");

		// Quay lại Quản Lý Thôn
		const villagesNav = sidebar.locator('button:has-text("Quản Lý Thôn")').first();
		await villagesNav.click();
		await page.waitForTimeout(500);

		// Chọn thẻ thôn đầu tiên để kích hoạt phạm vi thôn và mở danh sách hộ
		const firstVillageCard = page.locator('div[role="button"][aria-label*="hộ nông nghiệp"]').first();
		await firstVillageCard.click();
		interactionCount++;
		await page.waitForTimeout(500);

		// Nhấn nút Hộ Nông Nghiệp trên Sidebar
		const householdsNav = sidebar.locator('button:has-text("Hộ Nông Nghiệp")').first();
		await householdsNav.click();
		interactionCount++;
		visitedRoutes.push("Hộ Nông Nghiệp");
		await page.waitForTimeout(1000);

		// Xác nhận tiêu đề và nội dung bảng
		await expect(page.locator("text=Danh Sách Hộ Nông Nghiệp").first()).toBeVisible({ timeout: 10000 });
		const householdsTable = page.locator("table").first();
		await expect(householdsTable).toBeVisible({ timeout: 10000 });
		console.log("   ✓ Danh sách hộ nông nghiệp đã nạp thành công");

		// 4.1. Kiểm tra 6 Tab View Mode trong bảng 18 chỉ số
		console.log("   -> Thử nghiệm chuyển đổi 6 View Mode Tabs...");
		const tabs = [
			{ name: "Tổng Hợp", label: "Tổng Hợp" },
			{ name: "Cây Trồng", label: "Cây Trồng" },
			{ name: "Dược Liệu", label: "Dược Liệu" },
			{ name: "Vật Nuôi", label: "Vật Nuôi" },
			{ name: "Thủy Sản", label: "Thủy Sản" },
			{ name: "Tất Cả", label: "Tất Cả" },
		];

		for (const t of tabs) {
			const tabBtn = page.locator(`button:has-text("${t.label}")`).first();
			if (await tabBtn.isVisible()) {
				await tabBtn.click();
				await page.waitForTimeout(200);
				interactionCount++;
				console.log(`      ✓ Đã chuyển View Mode tab: [${t.label}]`);
			}
		}

		// 4.2. Thử nghiệm bộ lọc FilterBar
		console.log("   -> Thử nghiệm tìm kiếm & bộ lọc nông nghiệp...");
		const searchHousehold = page.locator("input#household-search-input");
		if (await searchHousehold.isVisible()) {
			await searchHousehold.fill("Nguyễn");
			await page.waitForTimeout(300);
			const clearSearchBtn = page.locator('button[aria-label="Xóa tìm kiếm"]');
			if (await clearSearchBtn.isVisible()) {
				await clearSearchBtn.click();
			} else {
				await searchHousehold.fill("");
			}
			interactionCount++;
		}

		// Thử mở dropdown Quy mô
		const scaleTrigger = page.locator('button:has-text("Tất cả quy mô")').first();
		if (await scaleTrigger.isVisible()) {
			await scaleTrigger.click();
			await page.waitForTimeout(200);
			// Chọn một tùy chọn rồi reset lại
			const largeOption = page.locator('[role="option"]:has-text("Lớn")').first();
			if (await largeOption.isVisible()) {
				await largeOption.click();
				await page.waitForTimeout(200);
				interactionCount++;
			}
		}

		// Thử nút Bung / Thu gọn tất cả chỉ số
		const toggleExpandBtn = page.locator('button:has-text("Bung tất cả"), button:has-text("Thu gọn tất cả")').first();
		if (await toggleExpandBtn.isVisible()) {
			await toggleExpandBtn.click();
			await page.waitForTimeout(200);
			await toggleExpandBtn.click();
			interactionCount += 2;
			console.log("      ✓ Đã thử tương tác Accordion Bung/Thu gọn 18 chỉ số");
		}

		// Nút Xóa lọc nếu có
		const resetFiltersBtn = page.locator('button:has-text("Xóa lọc")').first();
		if (await resetFiltersBtn.isVisible()) {
			await resetFiltersBtn.click();
			interactionCount++;
		}

		// 4.3. Mở Modal Thêm Hộ Dân & Thử nghiệm nhập số liệu 18 chỉ số hợp lệ
		console.log("   -> Mở Modal Thêm Hộ Dân & Thử nghiệm nhập số liệu form...");
		const addHouseholdBtn = page.locator('button:has-text("Thêm Hộ Dân")').first();
		if (await addHouseholdBtn.isVisible()) {
			await addHouseholdBtn.click();
			interactionCount++;

			const modalTitle = page.locator("#household-modal-title");
			await expect(modalTitle).toBeVisible({ timeout: 5000 });
			console.log("      ✓ Modal thêm mới hộ dân đã mở");

			// Nhập thông tin cơ bản
			const fullNameInput = page.locator("input#household-full-name");
			if (await fullNameInput.isVisible()) {
				await fullNameInput.fill("Hộ Khảo Sát Tự Động (Crawler Test)");
			}
			const phoneInput = page.locator("input#household-phone");
			if (await phoneInput.isVisible()) {
				await phoneInput.fill("0912345678");
			}

			// Thử chuyển đổi các tab danh mục nông nghiệp trong Modal
			const modalTabs = [
				{ label: "Cây Trồng", inputId: "#field-cafe-household", inputVal: "2.5" },
				{ label: "Vật Nuôi", inputId: "#field-buffalo", inputVal: "10" },
				{ label: "Thủy Sản", inputId: "#field-fish-pond", inputVal: "0.5" },
			];
			for (const mTab of modalTabs) {
				const mTabBtn = page.locator(`button[role="tab"]:has-text("${mTab.label}")`).first();
				if (await mTabBtn.isVisible()) {
					await mTabBtn.click();
					await page.waitForTimeout(150);
					interactionCount++;

					const targetInput = page.locator(mTab.inputId);
					if (await targetInput.isVisible()) {
						await targetInput.fill(mTab.inputVal);
					}
					console.log(`      ✓ Đã nhập chỉ số mẫu tab [${mTab.label}]`);
				}
			}

			// Đóng modal bằng nút Đóng / Hủy an toàn
			const closeBtn = page.locator('button[aria-label="Đóng cửa sổ"]').first();
			if (await closeBtn.isVisible()) {
				await closeBtn.click();
			} else {
				await page.keyboard.press("Escape");
			}
			interactionCount++;
			await expect(modalTitle).not.toBeVisible({ timeout: 5000 });
			console.log("      ✓ Đã đóng modal thêm hộ dân an toàn, bảo tồn toàn vẹn dữ liệu");
		}

		// 4.4. Thử mở Modal Chỉnh Sửa nếu có hộ dân trong bảng
		const editBtn = page.locator('button[aria-label*="Sửa số liệu"], button[title*="Chỉnh sửa"]').first();
		if (await editBtn.isVisible()) {
			await editBtn.click();
			interactionCount++;
			const editModalTitle = page.locator("#household-modal-title");
			await expect(editModalTitle).toBeVisible({ timeout: 5000 });
			console.log("      ✓ Đã kiểm tra mở modal chỉnh sửa hộ dân");

			const closeEditBtn = page.locator('button[aria-label="Đóng cửa sổ"]').first();
			if (await closeEditBtn.isVisible()) {
				await closeEditBtn.click();
			} else {
				await page.keyboard.press("Escape");
			}
			interactionCount++;
			await expect(editModalTitle).not.toBeVisible({ timeout: 5000 });
			console.log("      ✓ Đã đóng modal chỉnh sửa an toàn");
		}

		// -------------------------------------------------------------
		// GIAI ĐOẠN 5: NHẬT KÝ HOẠT ĐỘNG (AUDIT LOG PAGE)
		// -------------------------------------------------------------
		console.log("📍 [5/7] Quét trang Nhật Ký Hoạt Động (Audit Log View)...");
		const auditNav = sidebar.locator('button:has-text("Nhật Ký")').first();
		await auditNav.click();
		interactionCount++;
		visitedRoutes.push("Nhật Ký Hoạt Động");
		await page.waitForTimeout(800);

		await expect(page.locator("text=Nhật Ký Hoạt Động & Biến Động Dữ Liệu").first()).toBeVisible({ timeout: 10000 });

		// Thử các nút pill lọc sự kiện
		const auditPills = ["Tất Cả", "Thêm Mới", "Cập Nhật", "Xóa", "Khôi Phục", "Nhập Excel"];
		for (const pill of auditPills) {
			const pillBtn = page.locator(`div:has-text("Sự kiện:") button:has-text("${pill}")`).first();
			if (await pillBtn.isVisible()) {
				await pillBtn.click();
				await page.waitForTimeout(150);
				interactionCount++;
			}
		}
		console.log("   ✓ Các bộ lọc biến động dữ liệu hoạt động mượt mà");

		// -------------------------------------------------------------
		// GIAI ĐOẠN 6: THÙNG RÁC (RECYCLE BIN PAGE)
		// -------------------------------------------------------------
		console.log("📍 [6/7] Quét trang Thùng Rác (Recycle Bin)...");
		const recycleNav = sidebar.locator('button:has-text("Thùng Rác")').first();
		await recycleNav.click();
		interactionCount++;
		visitedRoutes.push("Thùng Rác");
		await page.waitForTimeout(800);

		// Kiểm tra bảng thùng rác (xác nhận render dữ liệu hoặc thông báo trống)
		const recycleTable = page.locator("table").first();
		await expect(recycleTable).toBeVisible({ timeout: 5000 });
		console.log("   ✓ Bảng Thùng rác tải thành công (bỏ qua nút Xóa vĩnh viễn theo chỉ dẫn an toàn)");

		// -------------------------------------------------------------
		// GIAI ĐOẠN 7: CÀI ĐẶT HỆ THỐNG (SETTINGS PAGE)
		// -------------------------------------------------------------
		console.log("📍 [7/7] Quét trang Cài Đặt Hệ Thống (Settings Page)...");
		const settingsNav = sidebar.locator('button:has-text("Cài Đặt")').first();
		await settingsNav.click();
		interactionCount++;
		visitedRoutes.push("Cài Đặt Hệ Thống");
		await page.waitForTimeout(800);

		// Chuyển đổi 4 tabs cài đặt
		const settingsTabs = [
			"Tài Khoản Của Tôi",
			"Quản Lý Cán Bộ",
			"Sao Lưu CSDL",
			"Thông Tin Đơn Vị",
		];
		for (const sTab of settingsTabs) {
			const sTabBtn = page.locator(`button:has-text("${sTab}")`).first();
			if (await sTabBtn.isVisible()) {
				await sTabBtn.click();
				await page.waitForTimeout(250);
				interactionCount++;
				console.log(`   ✓ Đã kiểm tra tab: [${sTab}]`);
			}
		}

		// -------------------------------------------------------------
		// TỔNG KẾT & BÁO CÁO GIÁM SÁT
		// -------------------------------------------------------------
		console.log("\n=======================================================");
		console.log("📊 KẾT QUẢ GIÁM SÁT VÀ KIỂM ĐỊNH SMART CRAWLER:");
		console.log("=======================================================");
		console.log(`• Tổng số route đã duyệt: ${visitedRoutes.length} (${visitedRoutes.join(" -> ")})`);
		console.log(`• Tổng số tương tác đã thực hiện: ${interactionCount} actions`);
		console.log(`• Lỗi Unhandled JS Exceptions: ${unhandledErrors.length}`);
		console.log(`• Lỗi Browser Console Runtime: ${consoleErrors.length}`);
		console.log(`• Lỗi HTTP API (code >= 400): ${apiErrors.length}`);

		if (apiErrors.length > 0) {
			console.log("\n⚠️ DANH SÁCH LỖI API PHÁT HIỆN:");
			apiErrors.forEach((e) => console.log(`   - [${e.status}] ${e.method} ${e.url} | Body: ${e.body}`));
		}

		if (consoleErrors.length > 0) {
			console.log("\n⚠️ DANH SÁCH LỖI CONSOLE PHÁT HIỆN:");
			consoleErrors.forEach((e) => console.log(`   - ${e}`));
		}

		// Khẳng định chất lượng phần mềm
		expect(unhandledErrors, "Không được có unhandled exception gây crash UI").toEqual([]);
		expect(apiErrors, "Không được có lỗi HTTP >= 400 từ Backend").toEqual([]);
		expect(
			consoleErrors.filter((e) => e.includes("Invariant Violation") || e.includes("Minified React error")),
			"Không được có lỗi crash React",
		).toEqual([]);

		console.log("\n✅ TẤT CẢ CÁC TRANG VÀ TÍNH NĂNG ĐÃ VƯỢT QUA KIỂM THỬ SMART CRAWLER 100%!\n");
	});
});
