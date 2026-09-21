import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Sidebar } from '../../components/Layout/Sidebar';
import { useApp } from '../../AppContext';

vi.mock('../../AppContext', () => ({
  useApp: vi.fn(),
}));

describe('SidebarNavigation Contextual Filtering', () => {
  const mockSetActiveTab = vi.fn();
  const mockSetSelectedVillageId = vi.fn();
  const mockToggleSidebar = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Trạng thái ban đầu: Admin ở tab villages với selectedVillageId = "" -> render đúng 4 nút', () => {
    (useApp as any).mockReturnValue({
      user: { id: '1', username: 'admin', role: 'admin' },
      activeTab: 'villages',
      setActiveTab: mockSetActiveTab,
      selectedVillageId: '',
      setSelectedVillageId: mockSetSelectedVillageId,
      selectedVillageName: '',
      isSidebarCollapsed: false,
      toggleSidebar: mockToggleSidebar,
    });

    render(<Sidebar />);

    // Phải có đúng 4 nút
    expect(screen.getByText('Quản Lý Thôn')).toBeInTheDocument();
    expect(screen.getByText('Quản lý các thôn xã Đăk Hà')).toBeInTheDocument();
    expect(screen.getByText('Thùng Rác')).toBeInTheDocument();
    expect(screen.getByText('Nhật Ký Hoạt Động')).toBeInTheDocument();
    expect(screen.getByText('Cài Đặt Hệ Thống')).toBeInTheDocument();

    // Tuyệt đối không render Thống Kê, Hộ Nông Nghiệp, Nhập / Xuất Excel
    expect(screen.queryByText('Thống Kê')).not.toBeInTheDocument();
    expect(screen.queryByText('Hộ Nông Nghiệp')).not.toBeInTheDocument();
    expect(screen.queryByText('Nhập / Xuất Excel')).not.toBeInTheDocument();
  });

  it('2. Trạng thái Thống kê tổng: Admin ở tab analytics với selectedVillageId = "" -> render đúng 5 nút', () => {
    (useApp as any).mockReturnValue({
      user: { id: '1', username: 'admin', role: 'admin' },
      activeTab: 'analytics',
      setActiveTab: mockSetActiveTab,
      selectedVillageId: '',
      setSelectedVillageId: mockSetSelectedVillageId,
      selectedVillageName: '',
      isSidebarCollapsed: false,
      toggleSidebar: mockToggleSidebar,
    });

    render(<Sidebar />);

    // Phải có đúng 5 nút
    expect(screen.getByText('Quản Lý Thôn')).toBeInTheDocument();
    expect(screen.getByText('Thống Kê')).toBeInTheDocument();
    expect(screen.getByText('Toàn xã Đăk Hà')).toBeInTheDocument();
    expect(screen.getByText('Chính')).toBeInTheDocument();
    expect(screen.getByText('Thùng Rác')).toBeInTheDocument();
    expect(screen.getByText('Nhật Ký Hoạt Động')).toBeInTheDocument();
    expect(screen.getByText('Cài Đặt Hệ Thống')).toBeInTheDocument();

    // Không có Hộ Nông Nghiệp, Nhập / Xuất Excel
    expect(screen.queryByText('Hộ Nông Nghiệp')).not.toBeInTheDocument();
    expect(screen.queryByText('Nhập / Xuất Excel')).not.toBeInTheDocument();
  });

  it('3. Trạng thái chọn 1 thôn: Admin có selectedVillageId = "v1" -> render đúng 6 nút với Thống Kê là mục chính đầu tiên', () => {
    (useApp as any).mockReturnValue({
      user: { id: '1', username: 'admin', role: 'admin' },
      activeTab: 'analytics',
      setActiveTab: mockSetActiveTab,
      selectedVillageId: 'v1',
      setSelectedVillageId: mockSetSelectedVillageId,
      selectedVillageName: 'Thôn Kon Đào',
      isSidebarCollapsed: false,
      toggleSidebar: mockToggleSidebar,
    });

    render(<Sidebar />);

    // Kiểm tra đủ 6 nút (không có Nhập / Xuất Excel)
    expect(screen.getByText('Quản Lý Thôn')).toBeInTheDocument();
    expect(screen.getByText('Quay lại danh sách thôn')).toBeInTheDocument();
    expect(screen.getByText('Thống Kê')).toBeInTheDocument();
    expect(screen.getAllByText('Thôn Kon Đào').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Hộ Nông Nghiệp')).toBeInTheDocument();
    expect(screen.getByText('Thùng Rác')).toBeInTheDocument();
    expect(screen.getByText('Nhật Ký Hoạt Động')).toBeInTheDocument();
    expect(screen.getByText('Cài Đặt Hệ Thống')).toBeInTheDocument();
    expect(screen.queryByText('Nhập / Xuất Excel')).not.toBeInTheDocument();

    // Kiểm tra thứ tự các buttons trong nav
    const buttonTexts = screen.getAllByRole('button').map(b => b.textContent);
    const villagesIdx = buttonTexts.findIndex(t => t?.includes('Quản Lý Thôn'));
    const analyticsIdx = buttonTexts.findIndex(t => t?.includes('Thống Kê'));
    const householdsIdx = buttonTexts.findIndex(t => t?.includes('Hộ Nông Nghiệp'));

    expect(villagesIdx).toBeLessThan(analyticsIdx);
    expect(analyticsIdx).toBeLessThan(householdsIdx);
  });

  it('4. Tương tác click "Quản Lý Thôn" -> gọi setSelectedVillageId("") và setActiveTab("villages")', () => {
    (useApp as any).mockReturnValue({
      user: { id: '1', username: 'admin', role: 'admin' },
      activeTab: 'analytics',
      setActiveTab: mockSetActiveTab,
      selectedVillageId: 'v1',
      setSelectedVillageId: mockSetSelectedVillageId,
      selectedVillageName: 'Thôn Kon Đào',
      isSidebarCollapsed: false,
      toggleSidebar: mockToggleSidebar,
    });

    render(<Sidebar />);

    const villagesBtn = screen.getByRole('button', { name: /Quản Lý Thôn/i });
    fireEvent.click(villagesBtn);

    expect(mockSetSelectedVillageId).toHaveBeenCalledWith('');
    expect(mockSetActiveTab).toHaveBeenCalledWith('villages');
  });

  it('5. Cán bộ thôn (user?.role !== "admin"): đưa Thống Kê lên làm mục chính đầu tiên', () => {
    (useApp as any).mockReturnValue({
      user: { id: '2', username: 'officer_thon1', role: 'user' },
      activeTab: 'analytics',
      setActiveTab: mockSetActiveTab,
      selectedVillageId: 'v1',
      setSelectedVillageId: mockSetSelectedVillageId,
      selectedVillageName: 'Thôn 1',
      isSidebarCollapsed: false,
      toggleSidebar: mockToggleSidebar,
    });

    render(<Sidebar />);

    // Thống Kê là mục chính đầu tiên
    expect(screen.getByText('Thống Kê')).toBeInTheDocument();
    expect(screen.getByText('Hộ Nông Nghiệp')).toBeInTheDocument();
    expect(screen.getByText('Thùng Rác')).toBeInTheDocument();
    expect(screen.getByText('Nhật Ký Hoạt Động')).toBeInTheDocument();
    expect(screen.queryByText('Nhập / Xuất Excel')).not.toBeInTheDocument();

    // Không có Quản Lý Thôn và Cài Đặt Hệ Thống
    expect(screen.queryByText('Quản Lý Thôn')).not.toBeInTheDocument();
    expect(screen.queryByText('Cài Đặt Hệ Thống')).not.toBeInTheDocument();

    // Thứ tự Thống Kê trước Hộ Nông Nghiệp
    const buttonTexts = screen.getAllByRole('button').map(b => b.textContent);
    const analyticsIdx = buttonTexts.findIndex(t => t?.includes('Thống Kê'));
    const householdsIdx = buttonTexts.findIndex(t => t?.includes('Hộ Nông Nghiệp'));
    expect(analyticsIdx).toBeLessThan(householdsIdx);
  });
});
