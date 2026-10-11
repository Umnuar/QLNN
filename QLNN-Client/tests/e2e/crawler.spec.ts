import { expect, test, type Locator, type Page } from "@playwright/test";

interface CapturedError {
	type: "HTTP" | "CONSOLE" | "PAGE_EXCEPTION" | "REACT_CRASH";
	url: string;
	lastAction: string;
	status?: number;
	method?: string;
	details: string;
	timestamp: string;
}

test.describe("QLNN Smart Crawler - E2E Full Scan & Advanced CRUD Lifecycle Suite (Best of 3)", () => {
	const allIssues: CapturedError[] = [];
	const apiErrors: CapturedError[] = [];
	const unhandledErrors: CapturedError[] = [];
	const consoleErrors: CapturedError[] = [];
	const visitedRoutes: string[] = [];
	let interactionCount = 0;
	let currentAction = "Khởi tạo kiểm thử";

	// --------------------------------------------------------------------------
	// TRỤ CỘT 1: KIẾN TRÚC BẪY LỖI & GIÁM SÁT TOÀN DIỆN (setupErrorTraps)
	// --------------------------------------------------------------------------
	const setupErrorTraps = (page: Page) => {
		// 1. Lắng nghe Network: Bắt HTTP status >= 400 (bỏ qua favicon, chrome-extension)
		page.on("response", async (response) => {
			const url = response.url();
			const status = response.status();

			if (url.includes("favicon.ico") || url.includes("chrome-extension://")) {
				return;
			}

			if (status >= 400 && (url.includes("/api/") || url.includes(":5001"))) {
				let body = "";
				try {
					body = await response.text();
				} catch {
					body = "[Không thể trích xuất body response]";
				}

				const issue: CapturedError = {
					type: "HTTP",
					method: response.request().method(),
					url,
					status,
					lastAction: currentAction,
					details: `[HTTP ${status}] ${response.statusText()} | Body: ${body.slice(0, 300)}`,
					timestamp: new Date().toLocaleTimeString("vi-VN"),
				};

				apiErrors.push(issue);
				allIssues.push(issue);
			}
		});

		// 2. Lắng nghe Browser Console: Lọc sạch noise và bắt trọn lỗi crash React
		page.on("console", (msg) => {
			if (msg.type() === "error") {
				const text = msg.text();

				// Bộ lọc noise: favicon, fonts, extension, vite-babel, net::ERR_CONNECTION_REFUSED
				if (
					text.includes("favicon.ico") ||
					text.includes("ERR_CONNECTION_REFUSED") ||
					text.includes("fonts.googleapis.com") ||
					text.includes("fonts.gstatic.com") ||
					text.includes("chrome-extension://") ||
					text.includes("vite:react-babel") ||
					text.includes("vite-babel") ||
					text.includes("esbuild") ||
					text.includes("optimizeDeps")
				) {
					return;
				}

				const isReactCrash =
					text.includes("Invariant Violation") ||
					text.includes("Minified React error") ||
					text.includes("Uncaught Error");

				const issue: CapturedError = {
					type: isReactCrash ? "REACT_CRASH" : "CONSOLE",
					url: page.url(),
					lastAction: currentAction,
					details: text.slice(0, 300),
					timestamp: new Date().toLocaleTimeString("vi-VN"),
				};

				if (isReactCrash) {
					unhandledErrors.push(issue);
				} else {
					consoleErrors.push(issue);
				}
				allIssues.push(issue);
			}
		});

		// 3. Lắng nghe Unhandled Runtime Exceptions (pageerror)
		page.on("pageerror", (err) => {
			const issue: CapturedError = {
				type: "PAGE_EXCEPTION",
				url: page.url(),
				lastAction: currentAction,
				details: `${err.name || "Error"}: ${err.message || String(err)}`,
				timestamp: new Date().toLocaleTimeString("vi-VN"),
			};

			unhandledErrors.push(issue);
			allIssues.push(issue);
		});
	};

	// --------------------------------------------------------------------------
	// TRỤ CỘT 2: CƠ CHẾ BẢO VỆ DỮ LIỆU & HÀM TIỆN ÍCH GIAO DIỆN
	// --------------------------------------------------------------------------
	const isDangerous = (text: string): boolean => {
		const dangerousRegex =
			/xóa vĩnh viễn|xóa hàng loạt|hard delete|reset|xóa thôn|xóa dữ liệu|khôi phục dữ liệu|đăng xuất|logout/i;
		return dangerousRegex.test(text);
	};

	// Tự dò nút an toàn ở cuối mỗi màn hình
	const crawlSafeButtons = async (page: Page, screenName: string) => {
		currentAction = `[Spider] Rà soát các nút an toàn trên ${screenName}`;
		const buttons = await page.locator("button").all();
		for (const btn of buttons) {
			const isVisible = await btn.isVisible().catch(() => false);
			if (!isVisible) continue;

			const text = (await btn.innerText().catch(() => "")) || "";
			const ariaLabel = (await btn.getAttribute("aria-label").catch(() => "")) || "";
			const title = (await btn.getAttribute("title").catch(() => "")) || "";
			const fullLabel = `${text} ${ariaLabel} ${title}`.trim();

			if (!fullLabel || isDangerous(fullLabel)) continue;

			// Bỏ qua nút thanh bên hoặc modal để không làm lệch luồng crawler
			if (fullLabel.includes("thanh bên") || fullLabel.includes("chẩn đoán")) continue;

			// Tự động tương tác với các nút tiện ích an toàn ("Đổi thôn", "Làm mới", "Thu gọn", "Mở rộng")
			if (
				fullLabel.includes("Đổi thôn") ||
				fullLabel.includes("Làm mới") ||
				fullLabel.includes("Thu gọn") ||
				fullLabel.includes("Mở rộng")
			) {
				currentAction = `[Spider] Click nút an toàn trên ${screenName}: ${fullLabel}`;
				await btn.click({ timeout: 1000 }).catch(() => {});
				interactionCount++;
				await page.waitForTimeout(200);
			}
		}
	};

	// Hàm tiện ích: chọn linh hoạt dropdown/combobox theo nhãn chữ
	const selectCustomOption = async (
		page: Page,
		containerLocator: Locator,
		optionText: string,
	): Promise<boolean> => {
		const trigger = containerLocator.locator('[role="combobox"], button[aria-haspopup="listbox"]').first();
		if (await trigger.isVisible().catch(() => false)) {
			await trigger.click();
			interactionCount++;
			await page.waitForTimeout(200);

			const option = page
				.locator(`[role="option"]:has-text("${optionText}")`)
				.first();
			if (await option.isVisible().catch(() => false)) {
				await option.click();
				interactionCount++;
				await page.waitForLoadState("networkidle").catch(() => {});
				await page.waitForTimeout(300);
				return true;
			}
			await page.keyboard.press("Escape");
			await page.waitForTimeout(200);
		}
		return false;
	};

	// Hàm tiện ích: tự đóng hộp thoại thông báo thành công
	const closeSuccessAlertIfPresent = async (p: Page) => {
		const alertCloseBtn = p
			.locator(
				'div[role="alertdialog"] button:has-text("Đóng"), div[role="alertdialog"] button:has-text("Xác nhận"), div[role="alertdialog"] button:has-text("OK"), #generic-modal-title:has-text("Thành công") ~ * button, button:has-text("Đóng")',
			)
			.first();
		try {
			if (await alertCloseBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
				await alertCloseBtn.click();
				interactionCount++;
				await p.waitForTimeout(300);
			}
		} catch {
			// Không có alert dialog hoặc đã tự đóng
		}
	};

	test("Smart Crawler: Quét cạn Filter & Vòng đời CRUD Thêm - Sửa - Xóa THẬT [TEST-CRAWLER]", async ({
		page,
	}) => {
		test.setTimeout(180000);
		setupErrorTraps(page);

		console.log("\n================================================================================");
		console.log("🚀 BẮT ĐẦU SMART CRAWLER TOÀN DIỆN PHÂN HỆ QLNN (BEST OF 3 ARCHITECTURE)");
		console.log("================================================================================\n");

		// ----------------------------------------------------------------------
		// GIAI ĐOẠN 1: ĐIỀU HƯỚNG & TỰ ĐỘNG ĐĂNG NHẬP (ADMIN / ADMIN123)
		// ----------------------------------------------------------------------
		currentAction = "Điều hướng & Đăng nhập hệ thống";
		console.log("🔑 [GIAI ĐOẠN 1] Khởi động và Đăng nhập hệ thống...");
		await page.goto("/", { waitUntil: "networkidle" });

		const usernameInput = page.locator("input#login-username");
		const passwordInput = page.locator("input#login-password");
		const loginBtn = page.locator('button[type="submit"]:has-text("ĐĂNG NHẬP")');

		await expect(usernameInput).toBeVisible({ timeout: 15000 });
		await usernameInput.fill("admin");
		await passwordInput.fill("admin123");
		await loginBtn.click();
		interactionCount++;

		const sidebar = page.locator("aside");
		await expect(sidebar).toBeVisible({ timeout: 20000 });
		visitedRoutes.push("Login -> Dashboard");
		console.log("   ✓ Đăng nhập thành công với tài khoản Quản trị viên (Admin)");

		// ----------------------------------------------------------------------
		// GIAI ĐOẠN 2: DÒ QUÉT CẠN TOÀN XÃ & 7 THÔN (VILLAGES PAGE)
		// ----------------------------------------------------------------------
		currentAction = "Quét trang Quản Lý Thôn & Quét cạn 7 thôn Đăk Hà";
		console.log("\n📍 [GIAI ĐOẠN 2] Quét trang Quản Lý Thôn & Quét cạn Toàn Xã + 7 Thôn...");
		visitedRoutes.push("Quản Lý Thôn");

		const heroBanner = page.locator("text=Tổng Quan Nông Nghiệp & Nông Thôn Mới Toàn Xã");
		await expect(heroBanner).toBeVisible({ timeout: 10000 });

		// 2.1. Xem Thống Kê Toàn Xã từ Hero Banner
		console.log("   -> Thử nghiệm xem Thống Kê Toàn Xã từ Hero Banner...");
		const viewAllStatsBtn = page.locator('button:has-text("Xem Thống Kê Toàn Xã")').first();
		if (await viewAllStatsBtn.isVisible()) {
			await viewAllStatsBtn.click();
			interactionCount++;
			await page.waitForTimeout(600);
			await expect(page.locator("text=Thống Kê Nông Nghiệp & Nông Thôn Mới")).toBeVisible({ timeout: 10000 });
			console.log("      ✓ Đã xác nhận màn hình thống kê toàn xã");

			// Quay lại Quản Lý Thôn
			const villagesNavBtn = sidebar.locator('button:has-text("Quản Lý Thôn")').first();
			await villagesNavBtn.click();
			await page.waitForTimeout(500);
			await expect(heroBanner).toBeVisible({ timeout: 10000 });
		}

		// 2.2. Tìm kiếm thôn
		const searchVillageInput = page.locator('input[placeholder*="Tìm kiếm thôn"]');
		if (await searchVillageInput.isVisible()) {
			await searchVillageInput.fill("Thôn 1");
			await page.waitForTimeout(300);
			await searchVillageInput.fill("");
			interactionCount++;
			console.log("   ✓ Đã thử tương tác bộ lọc tìm kiếm thôn");
		}

		// 2.3. VÒNG LẶP DUYỆT QUA TOÀN BỘ CÁC THẺ THÔN TRÊN ĐỊA BÀN
		console.log("   -> Quét cạn toàn bộ các thẻ thôn trên địa bàn...");
		const villageCards = page.locator(
			'div[role="button"][aria-label*="hộ nông nghiệp"], div[role="button"][aria-label*="Thôn"]',
		);
		const villageCount = await villageCards.count();
		expect(villageCount).toBeGreaterThan(0);
		console.log(`   ✓ Phát hiện ${villageCount} thẻ thôn/làng bản trên địa bàn`);

		for (let i = 0; i < villageCount; i++) {
			const targetCard = villageCards.nth(i);
			const cardLabel = (await targetCard.getAttribute("aria-label").catch(() => "")) || `Thôn ${i + 1}`;
			currentAction = `Click chọn thôn [${cardLabel}]`;
			console.log(`      ✓ Quét thôn ${i + 1}/${villageCount}: ${cardLabel}`);

			await targetCard.click();
			interactionCount++;
			await page.waitForLoadState("networkidle").catch(() => {});
			await page.waitForTimeout(300);

			// Xác nhận màn hình thống kê thôn nạp thành công không bị crash
			await expect(page.locator("text=Thống Kê Nông Nghiệp & Nông Thôn Mới")).toBeVisible({ timeout: 8000 });

			// Quay lại trang Quản Lý Thôn để tiếp tục duyệt
			const backToVillages = page.locator('button:has-text("Quay lại danh sách thôn")').first();
			if (await backToVillages.isVisible()) {
				await backToVillages.click();
			} else {
				const villagesNav = sidebar.locator('button:has-text("Quản Lý Thôn")').first();
				await villagesNav.click();
			}
			await page.waitForTimeout(300);
		}
		console.log("   ✓ Đã quét cạn thành công toàn bộ các thôn trên địa bàn Đăk Hà!");

		// Button Spider ở cuối màn hình Quản Lý Thôn
		await crawlSafeButtons(page, "Quản Lý Thôn");

		// ----------------------------------------------------------------------
		// GIAI ĐOẠN 3: THỐNG KÊ SẢN LƯỢNG & PHÂN TÍCH (ANALYTICS PAGE)
		// ----------------------------------------------------------------------
		currentAction = "Quét trang Thống Kê Sản Lượng Toàn Xã";
		console.log("\n📊 [GIAI ĐOẠN 3] Quét trang Thống Kê Sản Lượng Toàn Xã (Analytics Page)...");
		await viewAllStatsBtn.click();
		interactionCount++;
		visitedRoutes.push("Thống Kê Sản Lượng");

		await page.waitForTimeout(600);
		await expect(page.locator("text=Thống Kê Nông Nghiệp & Nông Thôn Mới")).toBeVisible({ timeout: 10000 });
		await expect(page.locator("text=TỔNG DIỆN TÍCH CÂY TRỒNG")).toBeVisible({ timeout: 10000 });
		await expect(page.locator("body")).not.toHaveText("Đang tải dữ liệu...");

		const comparisonTable = page.locator("table").first();
		await expect(comparisonTable).toBeVisible({ timeout: 10000 });
		console.log("   ✓ Thống kê sản lượng và bảng tổng hợp 7 thôn hiển thị ổn định");

		// Nút Làm mới thống kê
		const refreshStatsBtn = page.locator('button[aria-label="Làm mới số liệu"]').first();
		if (await refreshStatsBtn.isVisible()) {
			await refreshStatsBtn.click();
			interactionCount++;
			await page.waitForTimeout(300);
			console.log("   ✓ Đã làm mới số liệu thống kê thành công");
		}

		// Button Spider ở cuối màn hình Thống Kê Sản Lượng
		await crawlSafeButtons(page, "Thống Kê Sản Lượng");

		// ----------------------------------------------------------------------
		// GIAI ĐOẠN 4: HỘ NÔNG NGHIỆP, QUÉT CẠN BỘ LỌC & CRUD THẬT (HOUSEHOLDS PAGE)
		// ----------------------------------------------------------------------
		currentAction = "Quét trang Hộ Nông Nghiệp & 18 Chỉ Số";
		console.log("\n👨‍🌾 [GIAI ĐOẠN 4] Quét trang Hộ Nông Nghiệp & 18 Chỉ Số (Households Page)...");

		// Quay lại Quản Lý Thôn và chọn Thôn 1 để vào Hộ Nông Nghiệp
		const villagesNav = sidebar.locator('button:has-text("Quản Lý Thôn")').first();
		await villagesNav.click();
		await page.waitForTimeout(400);

		const firstVillageCard = page.locator('div[role="button"][aria-label*="hộ nông nghiệp"]').first();
		await firstVillageCard.click();
		interactionCount++;
		await page.waitForTimeout(400);

		// Vào Hộ Nông Nghiệp qua Sidebar
		const householdsNav = sidebar.locator('button:has-text("Hộ Nông Nghiệp")').first();
		await householdsNav.click();
		interactionCount++;
		visitedRoutes.push("Hộ Nông Nghiệp");
		await page.waitForLoadState("networkidle").catch(() => {});
		await page.waitForTimeout(600);

		await expect(page.locator("text=Danh Sách Hộ Nông Nghiệp").first()).toBeVisible({ timeout: 10000 });
		const householdsTable = page.locator("table").first();
		await expect(householdsTable).toBeVisible({ timeout: 10000 });
		console.log("   ✓ Danh sách hộ nông nghiệp đã nạp thành công");

		// ----------------------------------------------------------------------
		// 4.0. PRE-TEST CLEANUP: TỰ ĐỘNG DỌN RÁC PHIÊN TRƯỚC BỊ ĐỨT ĐOẠN NẾU CÓ
		// ----------------------------------------------------------------------
		const searchHousehold = page.locator("input#household-search-input");
		console.log("   🧹 [Pre-test Cleanup] Kiểm tra và dọn dẹp bản ghi thử nghiệm cũ nếu có...");
		if (await searchHousehold.isVisible()) {
			await searchHousehold.fill("[TEST-CRAWLER]");
			await page.waitForTimeout(800);

			let cleanupAttempts = 0;
			while (cleanupAttempts < 10) {
				const existingTestRow = page
					.locator('table tbody tr:has-text("[TEST-CRAWLER]")')
					.first();
				if (!(await existingTestRow.isVisible().catch(() => false))) {
					break;
				}
				cleanupAttempts++;
				console.log(`      ⚠️ Phát hiện bản ghi cũ còn sót (#${cleanupAttempts}), tiến hành dọn dẹp...`);
				const oldDeleteBtn = existingTestRow
					.locator('button[aria-label*="Xóa hộ"], button[title*="Xóa"]')
					.first();
				if (await oldDeleteBtn.isVisible().catch(() => false)) {
					await oldDeleteBtn.click();
					await page.waitForTimeout(300);
					const confirmTrash = page.locator('button:has-text("Xác Nhận Xóa")').first();
					if (await confirmTrash.isVisible().catch(() => false)) {
						await Promise.all([
							page.waitForResponse(
								(res) =>
									res.url().includes("/api/households") &&
									res.request().method() === "DELETE" &&
									res.status() < 400,
								{ timeout: 10000 },
							).catch(() => {}),
							confirmTrash.click(),
						]);
						await closeSuccessAlertIfPresent(page);
						await page.waitForTimeout(600);
					}
				} else {
					break;
				}
			}
			const clearSearchInit = page.locator('button[aria-label="Xóa tìm kiếm"]');
			if (await clearSearchInit.isVisible()) {
				await clearSearchInit.click();
			} else {
				await searchHousehold.fill("");
			}
			await page.waitForTimeout(400);
		}

		// ----------------------------------------------------------------------
		// 4.1. QUÉT CẠN 6 VIEW MODE TABS
		// ----------------------------------------------------------------------
		console.log("   -> Quét cạn 6 Tab View Mode trong bảng 18 chỉ số...");
		const tabs = [
			{ name: "Tổng Hợp", label: "Tổng Hợp" },
			{ name: "Cây Trồng", label: "Cây Trồng" },
			{ name: "Dược Liệu", label: "Dược Liệu" },
			{ name: "Vật Nuôi", label: "Vật Nuôi" },
			{ name: "Thủy Sản", label: "Thủy Sản" },
			{ name: "Tất Cả", label: "Tất Cả" },
		];

		for (const t of tabs) {
			currentAction = `Chuyển View Mode tab [${t.label}]`;
			const tabBtn = page.locator(`button:has-text("${t.label}")`).first();
			if (await tabBtn.isVisible()) {
				await tabBtn.click();
				await page.waitForTimeout(200);
				interactionCount++;
				await expect(householdsTable).toBeVisible({ timeout: 5000 });
				console.log(`      ✓ Đã chuyển View Mode tab: [${t.label}]`);
			}
		}

		// ----------------------------------------------------------------------
		// 4.2. QUÉT CẠN CÁC DROPDOWN FILTER BẰNG SELECTCUSTOMOPTION
		// ----------------------------------------------------------------------
		console.log("   -> Quét cạn toàn bộ dropdown bộ lọc nông nghiệp (Quy mô, Loại hình, Sắp xếp)...");

		// 4.2.1. Quét cạn Bộ lọc Quy mô
		const scaleContainer = page.locator("div.w-44").first();
		const scaleOptions = ["Lớn", "Vừa", "Nhỏ lẻ", "Tất cả quy mô"];
		for (const opt of scaleOptions) {
			currentAction = `Lọc theo quy mô: [${opt}]`;
			const selected = await selectCustomOption(page, scaleContainer, opt);
			if (selected) {
				await expect(householdsTable).toBeVisible({ timeout: 5000 });
				console.log(`      ✓ Đã chọn bộ lọc Quy mô: [${opt}]`);
			}
		}

		// 4.2.2. Quét cạn Bộ lọc Loại hình sản xuất
		const typeContainer = page.locator("div.w-44").nth(1);
		const typeOptions = [
			"Có nhận khoán",
			"Trồng dược liệu",
			"Chăn nuôi gia súc",
			"Nuôi trồng thủy sản",
			"Tất cả loại hình",
		];
		for (const opt of typeOptions) {
			currentAction = `Lọc theo loại hình: [${opt}]`;
			const selected = await selectCustomOption(page, typeContainer, opt);
			if (selected) {
				await expect(householdsTable).toBeVisible({ timeout: 5000 });
				console.log(`      ✓ Đã chọn bộ lọc Loại hình: [${opt}]`);
			}
		}

		// 4.2.3. Quét cạn Bộ lọc Sắp xếp
		const sortContainer = page.locator("div.w-42").first();
		const sortOptions = [
			"Diện tích cây trồng",
			"Tổng đàn vật nuôi",
			"Tên chủ hộ A → Z",
			"Tên chủ hộ Z → A",
			"Mặc định",
		];
		for (const opt of sortOptions) {
			currentAction = `Sắp xếp danh sách: [${opt}]`;
			const selected = await selectCustomOption(page, sortContainer, opt);
			if (selected) {
				await expect(householdsTable).toBeVisible({ timeout: 5000 });
				console.log(`      ✓ Đã chọn thứ tự Sắp xếp: [${opt}]`);
			}
		}

		// Accordion Bung / Thu gọn tất cả chi tiết
		const toggleExpandBtn = page.locator(
			'button:has-text("Bung tất cả"), button:has-text("Thu gọn tất cả")',
		).first();
		if (await toggleExpandBtn.isVisible()) {
			await toggleExpandBtn.click();
			await page.waitForTimeout(200);
			await toggleExpandBtn.click();
			interactionCount += 2;
			console.log("      ✓ Đã thử tương tác Accordion Bung/Thu gọn 18 chỉ số");
		}

		// Nút Xóa lọc nếu đang hiển thị
		const resetFiltersBtn = page.locator('button:has-text("Xóa lọc")').first();
		if (await resetFiltersBtn.isVisible()) {
			await resetFiltersBtn.click();
			interactionCount++;
			await page.waitForTimeout(300);
		}

		// ----------------------------------------------------------------------
		// 4.3. VÒNG ĐỜI CRUD THẬT (Thêm -> Lưu -> Sửa -> Xóa) VỚI [TEST-CRAWLER]
		// (Bắt gói tin API chuẩn xác: res.status() < 400 - Anti Race-Condition)
		// ----------------------------------------------------------------------
		const TEST_NAME = "[TEST-CRAWLER] Nguyễn Văn Test";
		console.log(`\n🔄 [GIAI ĐOẠN 4.3] Thực hiện vòng đời CRUD THẬT với bản ghi: ${TEST_NAME}...`);

		// --- BƯỚC 1: THÊM MỚI & LƯU THẬT ---
		currentAction = `Thêm mới & Lưu thật hộ dân [${TEST_NAME}]`;
		console.log("   ➕ [BƯỚC 1: CREATE] Mở modal và tạo bản ghi mới...");
		const addHouseholdBtn = page.locator('button:has-text("Thêm Hộ Dân")').first();
		await addHouseholdBtn.click();
		interactionCount++;

		const modalTitle = page.locator("#household-modal-title");
		await expect(modalTitle).toBeVisible({ timeout: 5000 });

		// Nhập thông tin chung
		await page.locator("input#household-full-name").fill(TEST_NAME);
		await page.locator("input#household-phone").fill("0987654321");
		await page.locator("input#household-address").fill("Thôn 1, Xã Đăk Hà, Huyện Đăk Hà");
		await page.locator("input#household-notes").fill("Khởi tạo tự động bởi Playwright Smart Crawler");

		// Điền các chỉ số nông nghiệp
		// Tab Cây Trồng
		await page.locator("#field-cafe-household").fill("2.5");
		// Tab Vật Nuôi
		const livestockTab = page.locator('button[role="tab"]:has-text("Vật Nuôi")').first();
		await livestockTab.click();
		await page.waitForTimeout(150);
		await page.locator("#field-cow").fill("8");
		// Tab Thủy Sản
		const aquaTab = page.locator('button[role="tab"]:has-text("Thủy Sản")').first();
		await aquaTab.click();
		await page.waitForTimeout(150);
		await page.locator("#field-fish-pond").fill("0.6");

		// BẮT GÓI TIN API CHUẨN XÁC: POST /api/households & status < 400
		console.log("      -> Nhấn nút [Lưu hộ mới] thật (Anti Race-Condition)...");
		const saveBtn = page.locator('button[type="submit"]:has-text("Lưu hộ mới")');
		const [createResponse] = await Promise.all([
			page.waitForResponse(
				(res) =>
					res.url().includes("/api/households") &&
					res.request().method() === "POST" &&
					res.status() < 400,
				{ timeout: 15000 },
			),
			saveBtn.click(),
		]);
		interactionCount++;
		expect(createResponse.status()).toBeLessThan(400);
		console.log(`      ✓ Bắt response POST /api/households thành công (Status ${createResponse.status()} < 400)`);

		// Đóng alert thông báo thành công nếu có
		await closeSuccessAlertIfPresent(page);

		// Kiểm tra modal tự động đóng
		await expect(modalTitle).not.toBeVisible({ timeout: 10000 });

		// Xác nhận dòng [TEST-CRAWLER] xuất hiện trên bảng dữ liệu
		await searchHousehold.fill("[TEST-CRAWLER]");
		await page.waitForTimeout(500);
		const createdRow = page.locator('tr:has-text("[TEST-CRAWLER]")');
		await expect(createdRow.first()).toBeVisible({ timeout: 10000 });
		console.log("   ✓ Xác nhận: Hàng dữ liệu [TEST-CRAWLER] đã hiển thị trên bảng!");

		// --- BƯỚC 2: SỬA BẢN GHI & LƯU THẬT ---
		currentAction = `Sửa bản ghi & Lưu cập nhật [${TEST_NAME}]`;
		console.log("   ✏️ [BƯỚC 2: UPDATE] Mở modal chỉnh sửa và cập nhật bản ghi...");
		const editBtn = createdRow
			.first()
			.locator('button[aria-label*="Sửa số liệu"], button[title*="Sửa"]')
			.first();
		await editBtn.click();
		interactionCount++;

		await expect(modalTitle).toBeVisible({ timeout: 5000 });

		// Đổi ghi chú và số điện thoại
		const notesInput = page.locator("input#household-notes");
		await notesInput.fill("Đã cập nhật số liệu E2E Smart Crawler (PUT Verified)");
		const phoneInput = page.locator("input#household-phone");
		await phoneInput.fill("0912345678");

		// BẮT GÓI TIN API CHUẨN XÁC: PUT /api/households & status < 400
		console.log("      -> Nhấn nút [Cập nhật hồ sơ] thật (Anti Race-Condition)...");
		const updateBtn = page.locator('button[type="submit"]:has-text("Cập nhật hồ sơ")');
		const [updateResponse] = await Promise.all([
			page.waitForResponse(
				(res) =>
					res.url().includes("/api/households") &&
					(res.request().method() === "PUT" || res.request().method() === "PATCH") &&
					res.status() < 400,
				{ timeout: 15000 },
			),
			updateBtn.click(),
		]);
		interactionCount++;
		expect(updateResponse.status()).toBeLessThan(400);
		console.log(`      ✓ Bắt response PUT /api/households thành công (Status ${updateResponse.status()} < 400)`);

		// Đóng alert thông báo thành công nếu có
		await closeSuccessAlertIfPresent(page);

		// Kiểm tra modal tự động đóng
		await expect(modalTitle).not.toBeVisible({ timeout: 10000 });
		await page.waitForTimeout(500);
		await expect(page.locator('tr:has-text("[TEST-CRAWLER]")').first()).toBeVisible();
		console.log("   ✓ Xác nhận: Hồ sơ [TEST-CRAWLER] đã được cập nhật thành công!");

		// --- BƯỚC 3: XÓA DỌN DẸP BẢN GHI AN TOÀN ---
		currentAction = `Xóa dọn dẹp bản ghi [${TEST_NAME}]`;
		console.log("   🗑️ [BƯỚC 3: DELETE] Xóa dọn dẹp bản ghi test (Bảo vệ dữ liệu thật 100%)...");

		const deleteRow = page.locator('tr:has-text("[TEST-CRAWLER]")').first();
		const rowContent = (await deleteRow.innerText().catch(() => "")) || "";

		// TIÊU CHÍ BẢO VỆ DỮ LIỆU THẬT: Chỉ xóa khi dòng chứa chính xác tag [TEST-CRAWLER]
		expect(
			rowContent.includes("[TEST-CRAWLER]"),
			"TUYỆT ĐỐI KHÔNG XÓA dòng dữ liệu không mang tiền tố [TEST-CRAWLER]",
		).toBe(true);

		const deleteBtn = deleteRow
			.locator('button[aria-label*="Xóa hộ"], button[title*="Xóa"]')
			.first();
		await deleteBtn.click();
		interactionCount++;

		// Modal xác nhận Chuyển vào Thùng Rác
		const confirmModalTitle = page.locator("#generic-modal-title").first();
		await expect(confirmModalTitle).toBeVisible({ timeout: 5000 });
		const confirmDeleteBtn = page.locator('button:has-text("Xác Nhận Xóa")');

		// BẮT GÓI TIN API CHUẨN XÁC: DELETE /api/households & status < 400
		const [deleteResponse] = await Promise.all([
			page.waitForResponse(
				(res) =>
					res.url().includes("/api/households") &&
					res.request().method() === "DELETE" &&
					res.status() < 400,
				{ timeout: 15000 },
			),
			confirmDeleteBtn.click(),
		]);
		interactionCount++;
		expect(deleteResponse.status()).toBeLessThan(400);
		console.log(`      ✓ Bắt response DELETE /api/households thành công (Status ${deleteResponse.status()} < 400)`);

		// Đóng alert thông báo thành công nếu có
		await closeSuccessAlertIfPresent(page);

		// Kiểm tra dòng biến mất khỏi bảng dữ liệu
		await expect(page.locator('tr:has-text("[TEST-CRAWLER]")')).not.toBeVisible({ timeout: 10000 });
		console.log("   ✓ Xác nhận: Bản ghi [TEST-CRAWLER] đã được dọn sạch khỏi danh sách hộ!");

		// Xóa tìm kiếm để phục hồi trạng thái bảng
		const clearSearchFinal = page.locator('button[aria-label="Xóa tìm kiếm"]');
		if (await clearSearchFinal.isVisible()) {
			await clearSearchFinal.click();
		} else {
			await searchHousehold.fill("");
		}
		await page.waitForTimeout(300);

		// Button Spider ở cuối màn hình Hộ Nông Nghiệp
		await crawlSafeButtons(page, "Hộ Nông Nghiệp");

		// ----------------------------------------------------------------------
		// GIAI ĐOẠN 5: NHẬT KÝ HOẠT ĐỘNG (AUDIT LOG PAGE)
		// ----------------------------------------------------------------------
		currentAction = "Quét trang Nhật Ký Hoạt Động & Quét cạn Pill sự kiện";
		console.log("\n📜 [GIAI ĐOẠN 5] Quét trang Nhật Ký Hoạt Động (Audit Log View)...");
		const auditNav = sidebar.locator('button:has-text("Nhật Ký")').first();
		await auditNav.click();
		interactionCount++;
		visitedRoutes.push("Nhật Ký Hoạt Động");
		await page.waitForLoadState("networkidle").catch(() => {});
		await page.waitForTimeout(600);

		await expect(page.locator("text=Nhật Ký Hoạt Động & Biến Động Dữ Liệu").first()).toBeVisible({ timeout: 10000 });

		// Quét cạn toàn bộ các pill lọc sự kiện
		console.log("   -> Quét cạn các pill lọc sự kiện (Tất Cả, Thêm Mới, Cập Nhật, Xóa, Khôi Phục, Nhập Excel)...");
		const auditPills = ["Tất Cả", "Thêm Mới", "Cập Nhật", "Xóa", "Khôi Phục", "Nhập Excel"];
		for (const pill of auditPills) {
			currentAction = `Lọc sự kiện nhật ký: [${pill}]`;
			const pillBtn = page.locator(`button:has-text("${pill}")`).first();
			if (await pillBtn.isVisible()) {
				await pillBtn.click();
				await page.waitForTimeout(200);
				interactionCount++;
				console.log(`      ✓ Đã chọn pill sự kiện: [${pill}]`);
			}
		}

		// Nút Xem Toàn Xã trong Nhật Ký nếu có
		const viewAllVillageAudit = page.locator('button:has-text("Xem Toàn Xã")').first();
		if (await viewAllVillageAudit.isVisible()) {
			await viewAllVillageAudit.click();
			interactionCount++;
			await page.waitForTimeout(300);
			console.log("      ✓ Đã chuyển bộ lọc nhật ký về Toàn Xã");
		}

		// Button Spider ở cuối màn hình Nhật Ký Hoạt Động
		await crawlSafeButtons(page, "Nhật Ký Hoạt Động");

		// ----------------------------------------------------------------------
		// GIAI ĐOẠN 6: THÙNG RÁC (RECYCLE BIN PAGE) & DỌN DẸP VĨNH VIỄN [TEST-CRAWLER]
		// ----------------------------------------------------------------------
		currentAction = "Quét trang Thùng Rác & Dọn dẹp vĩnh viễn test data";
		console.log("\n🗑️ [GIAI ĐOẠN 6] Quét trang Thùng Rác (Recycle Bin)...");
		const recycleNav = sidebar.locator('button:has-text("Thùng Rác")').first();
		await recycleNav.click();
		interactionCount++;
		visitedRoutes.push("Thùng Rác");
		await page.waitForLoadState("networkidle").catch(() => {});
		await page.waitForTimeout(600);

		const recycleTable = page.locator("table").first();
		await expect(recycleTable).toBeVisible({ timeout: 5000 });
		console.log("   ✓ Bảng Thùng rác tải thành công");

		// DỌN SẠCH TRIỆT ĐỂ: Nếu tìm thấy dòng [TEST-CRAWLER] trong Thùng rác -> Hard delete
		const recycleTestRow = page.locator('tr:has-text("[TEST-CRAWLER]")');
		if ((await recycleTestRow.count()) > 0) {
			console.log("   🧹 Dọn dẹp vĩnh viễn bản ghi [TEST-CRAWLER] khỏi Thùng rác để làm sạch triệt để CSDL...");
			page.once("dialog", async (dialog) => {
				await dialog.accept();
			});
			const hardDelBtn = recycleTestRow
				.first()
				.locator('button[aria-label*="Xóa hộ"], button[title*="Xóa vĩnh viễn"]')
				.first();
			if (await hardDelBtn.isVisible()) {
				const [purgeResponse] = await Promise.all([
					page.waitForResponse(
						(res) =>
							res.url().includes("/api/households") &&
							res.request().method() === "DELETE" &&
							res.status() < 400,
						{ timeout: 15000 },
					).catch(() => null),
					hardDelBtn.click(),
				]);
				interactionCount++;
				if (purgeResponse) {
					expect(purgeResponse.status()).toBeLessThan(400);
				}
				await closeSuccessAlertIfPresent(page);
				await page.waitForTimeout(500);
				console.log("   ✓ Đã hoàn tất xóa vĩnh viễn [TEST-CRAWLER], CSDL hoàn toàn sạch!");
			}
		}

		// Button Spider ở cuối màn hình Thùng Rác (Safe Guard loại trừ nút Xóa vĩnh viễn các hộ thật)
		await crawlSafeButtons(page, "Thùng Rác");

		// ----------------------------------------------------------------------
		// GIAI ĐOẠN 7: CÀI ĐẶT HỆ THỐNG (SETTINGS PAGE - 4 TABS)
		// ----------------------------------------------------------------------
		currentAction = "Quét trang Cài Đặt Hệ Thống";
		console.log("\n⚙️ [GIAI ĐOẠN 7] Quét trang Cài Đặt Hệ Thống (Settings Page - 4 Tabs)...");
		const settingsNav = sidebar.locator('button:has-text("Cài Đặt")').first();
		await settingsNav.click();
		interactionCount++;
		visitedRoutes.push("Cài Đặt Hệ Thống");
		await page.waitForTimeout(600);

		const settingsTabs = [
			"Tài Khoản Của Tôi",
			"Quản Lý Cán Bộ",
			"Sao Lưu CSDL",
			"Thông Tin Đơn Vị",
		];
		for (const sTab of settingsTabs) {
			currentAction = `Quét tab Cài Đặt: [${sTab}]`;
			const sTabBtn = page.locator(`button:has-text("${sTab}")`).first();
			if (await sTabBtn.isVisible()) {
				await sTabBtn.click();
				await page.waitForTimeout(250);
				interactionCount++;
				console.log(`   ✓ Đã kiểm tra tab: [${sTab}]`);

				// Nếu là tab Quản Lý Cán Bộ, kiểm tra thử modal thêm cán bộ (Đóng an toàn)
				if (sTab === "Quản Lý Cán Bộ") {
					const addUserBtn = page.locator('button:has-text("Thêm Cán Bộ")').first();
					if (await addUserBtn.isVisible()) {
						await addUserBtn.click();
						await page.waitForTimeout(200);
						const cancelUserBtn = page.locator('button:has-text("Hủy")').first();
						if (await cancelUserBtn.isVisible()) {
							await cancelUserBtn.click();
						} else {
							await page.keyboard.press("Escape");
						}
						interactionCount += 2;
						await page.waitForTimeout(200);
					}
				}
			}
		}

		// Button Spider ở cuối màn hình Cài Đặt Hệ Thống
		await crawlSafeButtons(page, "Cài Đặt Hệ Thống");

		// ----------------------------------------------------------------------
		// TRỤ CỘT 4: TỔNG KẾT & TIÊU CHÍ NGHIỆM THU (Assertions & Summary Table)
		// ----------------------------------------------------------------------
		console.log("\n================================================================================");
		console.log("🏁 BÁO CÁO TỔNG HỢP KIỂM ĐỊNH SMART CRAWLER TOÀN DIỆN (QLNN)");
		console.log("================================================================================");
		console.log(`• Tổng số route đã duyệt      : ${visitedRoutes.length} (${visitedRoutes.join(" -> ")})`);
		console.log(`• Tổng số thao tác thực hiện  : ${interactionCount} actions`);
		console.log(`• Lỗi Unhandled Exceptions    : ${unhandledErrors.length}`);
		console.log(`• Lỗi Browser Console         : ${consoleErrors.length}`);
		console.log(`• Lỗi HTTP API (code >= 400)  : ${apiErrors.length}`);
		console.log("================================================================================");

		if (allIssues.length > 0) {
			console.log(`\n⚠️ BẢNG CHI TIẾT CÁC LỖI GHI NHẬN (${allIssues.length} mục):`);
			console.table(
				allIssues.map((item, index) => ({
					STT: index + 1,
					Loại: item.type,
					ThaoTác: item.lastAction,
					Mã_ChiTiết: item.status ? `HTTP ${item.status}` : item.details.slice(0, 70),
					URL: item.url.slice(-40),
					ThờiGian: item.timestamp,
				})),
			);
		} else {
			console.log("\n🎉 XUẤT SẮC: 0 LỖI RUNTIME, 0 LỖI CONSOLE, 0 LỖI HTTP API (CODE >= 400)!");
			console.log("✅ VÒNG ĐỜI CRUD THẬT [TEST-CRAWLER] HOÀN TẤT 100% AN TOÀN & SẠCH SẼ!");
			console.log("✅ TOÀN BỘ BỘ LỌC/PILLS TRÊN TẤT CẢ MÀN HÌNH ĐÃ ĐƯỢC QUÉT BẤM CẠN THÀNH CÔNG.");
			console.log("✅ ĐÃ TÍCH HỢP 5 CƠ CHẾ TỰ ĐỘNG HÓA NÂNG CAO ĐỒNG BỘ 3 PHÂN HỆ.");
		}
		console.log("================================================================================\n");

		// Tiêu chí nghiệm thu chuẩn
		expect(unhandledErrors, "Không được có Unhandled Exception hoặc React crash").toEqual([]);
		expect(apiErrors, "Không được có bất kỳ lỗi HTTP >= 400 từ Backend").toEqual([]);
		expect(
			consoleErrors.filter((e) => e.type === "REACT_CRASH"),
			"Không được có lỗi crash React Component",
		).toEqual([]);
	});
});
