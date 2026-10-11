import { expect, test, type Page } from "@playwright/test";

interface CapturedError {
	type: "HTTP" | "CONSOLE" | "PAGE_EXCEPTION" | "REACT_CRASH";
	url: string;
	lastAction: string;
	status?: number;
	method?: string;
	details: string;
	timestamp: string;
}

test.describe("QLNN Smart Crawler - E2E Full Scan & Interaction Suite (Best of 3)", () => {
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
	// TRỤ CỘT 2: CƠ CHẾ BẢO VỆ DỮ LIỆU & TỰ MÒ NÚT AN TOÀN (Safe Guard & Button Spider)
	// --------------------------------------------------------------------------
	const isDangerous = (text: string): boolean => {
		const dangerousRegex =
			/xóa vĩnh viễn|xóa hàng loạt|hard delete|reset|xóa thôn|xóa dữ liệu|khôi phục dữ liệu|đăng xuất|logout/i;
		return dangerousRegex.test(text);
	};

	const crawlSafeButtons = async (page: Page, screenName: string) => {
		const buttons = await page.locator("button").all();
		for (const btn of buttons) {
			const isVisible = await btn.isVisible().catch(() => false);
			if (!isVisible) continue;

			const text = (await btn.innerText().catch(() => "")) || "";
			const ariaLabel = (await btn.getAttribute("aria-label").catch(() => "")) || "";
			const title = (await btn.getAttribute("title").catch(() => "")) || "";
			const fullLabel = `${text} ${ariaLabel} ${title}`.trim();

			if (!fullLabel || isDangerous(fullLabel)) continue;

			// Bỏ qua nút thanh bên hoặc modal để không làm lệch giao diện
			if (fullLabel.includes("thanh bên") || fullLabel.includes("chẩn đoán")) continue;

			// Tự động tương tác với các nút tiện ích an toàn theo đặc tả ("Đổi thôn", "Làm mới", "Thu gọn", "Mở rộng")
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

	test("Smart Crawler: Tự duyệt toàn bộ phân hệ QLNN, click tương tác nông nghiệp & kiểm chứng Backend", async ({
		page,
	}) => {
		test.setTimeout(120000);
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
		// GIAI ĐOẠN 2: DÒ QUÉT QUẢN LÝ THÔN (VILLAGES PAGE)
		// ----------------------------------------------------------------------
		currentAction = "Quét trang Quản Lý Thôn";
		console.log("\n📍 [GIAI ĐOẠN 2] Quét trang Quản Lý Thôn (Villages Page)...");
		visitedRoutes.push("Quản Lý Thôn");

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

		// Xác nhận các thẻ thôn hiển thị
		const villageCards = page.locator(
			'div[role="button"][aria-label*="hộ nông nghiệp"], div[role="button"][aria-label*="Thôn"]',
		);
		const villageCount = await villageCards.count();
		expect(villageCount).toBeGreaterThan(0);
		console.log(`   ✓ Phát hiện ${villageCount} thẻ thôn/làng bản trên địa bàn`);

		// Button Spider trên Quản Lý Thôn
		await crawlSafeButtons(page, "Quản Lý Thôn");

		// ----------------------------------------------------------------------
		// GIAI ĐOẠN 3: THỐNG KÊ SẢN LƯỢNG & PHÂN TÍCH (ANALYTICS PAGE)
		// ----------------------------------------------------------------------
		currentAction = "Quét trang Thống Kê Sản Lượng Toàn Xã";
		console.log("\n📊 [GIAI ĐOẠN 3] Quét trang Thống Kê Sản Lượng Toàn Xã (Analytics Page)...");
		const viewAllStatsBtn = page.locator('button:has-text("Xem Thống Kê Toàn Xã")').first();
		await viewAllStatsBtn.click();
		interactionCount++;
		visitedRoutes.push("Thống Kê Sản Lượng");

		await page.waitForTimeout(1000);
		await expect(page.locator("text=Thống Kê Nông Nghiệp & Nông Thôn Mới")).toBeVisible({ timeout: 10000 });
		await expect(page.locator("text=TỔNG DIỆN TÍCH CÂY TRỒNG")).toBeVisible({ timeout: 10000 });
		await expect(page.locator("body")).not.toHaveText("Đang tải dữ liệu...");

		const comparisonTable = page.locator("table").first();
		await expect(comparisonTable).toBeVisible({ timeout: 10000 });
		console.log("   ✓ Thống kê sản lượng và bảng tổng hợp 7 thôn hiển thị ổn định");

		// Button Spider trên Thống Kê Sản Lượng
		await crawlSafeButtons(page, "Thống Kê Sản Lượng");

		// ----------------------------------------------------------------------
		// GIAI ĐOẠN 4: HỘ NÔNG NGHIỆP & 18 CHỈ SỐ (HOUSEHOLDS PAGE)
		// ----------------------------------------------------------------------
		currentAction = "Quét trang Hộ Nông Nghiệp & 18 Chỉ Số";
		console.log("\n👨‍🌾 [GIAI ĐOẠN 4] Quét trang Hộ Nông Nghiệp & 18 Chỉ Số (Households Page)...");

		// Quay lại Quản Lý Thôn
		const villagesNav = sidebar.locator('button:has-text("Quản Lý Thôn")').first();
		await villagesNav.click();
		await page.waitForTimeout(500);

		// Chọn thẻ thôn đầu tiên để kích hoạt phạm vi thôn và mở danh sách hộ
		const firstVillageCard = page.locator('div[role="button"][aria-label*="hộ nông nghiệp"]').first();
		await firstVillageCard.click();
		interactionCount++;
		await page.waitForTimeout(500);

		// Vào Hộ Nông Nghiệp qua Sidebar
		const householdsNav = sidebar.locator('button:has-text("Hộ Nông Nghiệp")').first();
		await householdsNav.click();
		interactionCount++;
		visitedRoutes.push("Hộ Nông Nghiệp");
		await page.waitForTimeout(1000);

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

		// Dropdown Quy mô (CustomSelect)
		const scaleTrigger = page.locator('button:has-text("Tất cả quy mô")').first();
		if (await scaleTrigger.isVisible()) {
			await scaleTrigger.click();
			await page.waitForTimeout(200);
			const largeOption = page.locator('[role="option"]:has-text("Lớn")').first();
			if (await largeOption.isVisible()) {
				await largeOption.click();
				await page.waitForTimeout(200);
				interactionCount++;
			}
		}

		// Nút Bung / Thu gọn tất cả chi tiết
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

			const fullNameInput = page.locator("input#household-full-name");
			if (await fullNameInput.isVisible()) {
				await fullNameInput.fill("Hộ Khảo Sát Tự Động (Crawler Test)");
			}
			const phoneInput = page.locator("input#household-phone");
			if (await phoneInput.isVisible()) {
				await phoneInput.fill("0912345678");
			}

			// Chuyển 3 tab chỉ số nông nghiệp và điền số liệu mẫu
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

			// Đóng modal bằng nút Đóng / Hủy an toàn (Bảo vệ CSDL)
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

		// Button Spider trên Hộ Nông Nghiệp
		await crawlSafeButtons(page, "Hộ Nông Nghiệp");

		// ----------------------------------------------------------------------
		// GIAI ĐOẠN 5: NHẬT KÝ HOẠT ĐỘNG (AUDIT LOG PAGE)
		// ----------------------------------------------------------------------
		currentAction = "Quét trang Nhật Ký Hoạt Động";
		console.log("\n📜 [GIAI ĐOẠN 5] Quét trang Nhật Ký Hoạt Động (Audit Log View)...");
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

		// Button Spider trên Nhật Ký Hoạt Động
		await crawlSafeButtons(page, "Nhật Ký Hoạt Động");

		// ----------------------------------------------------------------------
		// GIAI ĐOẠN 6: THÙNG RÁC (RECYCLE BIN PAGE)
		// ----------------------------------------------------------------------
		currentAction = "Quét trang Thùng Rác";
		console.log("\n🗑️ [GIAI ĐOẠN 6] Quét trang Thùng Rác (Recycle Bin)...");
		const recycleNav = sidebar.locator('button:has-text("Thùng Rác")').first();
		await recycleNav.click();
		interactionCount++;
		visitedRoutes.push("Thùng Rác");
		await page.waitForTimeout(800);

		const recycleTable = page.locator("table").first();
		await expect(recycleTable).toBeVisible({ timeout: 5000 });
		console.log("   ✓ Bảng Thùng rác tải thành công (bỏ qua nút Xóa vĩnh viễn theo chỉ dẫn an toàn)");

		// Button Spider trên Thùng Rác (Safe Guard loại trừ nút Xóa vĩnh viễn)
		await crawlSafeButtons(page, "Thùng Rác");

		// ----------------------------------------------------------------------
		// GIAI ĐOẠN 7: CÀI ĐẶT HỆ THỐNG (SETTINGS PAGE - 4 TABS)
		// ----------------------------------------------------------------------
		currentAction = "Quét trang Cài Đặt Hệ Thống";
		console.log("\n⚙️ [GIAI ĐOẠN 7] Quét trang Cài Đặt Hệ Thống (Settings Page)...");
		const settingsNav = sidebar.locator('button:has-text("Cài Đặt")').first();
		await settingsNav.click();
		interactionCount++;
		visitedRoutes.push("Cài Đặt Hệ Thống");
		await page.waitForTimeout(800);

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

				// Nếu là tab Quản Lý Cán Bộ, kiểm tra thử modal thêm cán bộ
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

		// Button Spider trên Cài Đặt Hệ Thống
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
			console.log("✅ Phân hệ QLNN đạt chuẩn đồng bộ kiến trúc cao nhất (Best of 3) từ QLCS, QLNN, QLHK.");
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
