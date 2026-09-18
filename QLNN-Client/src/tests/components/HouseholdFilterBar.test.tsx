import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  HouseholdFilterBar,
  ScaleFilter,
  ProductionTypeFilter,
  SortOption,
} from '../../components/households/HouseholdFilterBar';

describe('HouseholdFilterBar UI and Interactions', () => {
  const defaultProps = {
    search: '',
    setSearch: vi.fn(),
    loading: false,
    onRefresh: vi.fn(),
    scaleFilter: 'all' as ScaleFilter,
    setScaleFilter: vi.fn(),
    typeFilter: 'all' as ProductionTypeFilter,
    setTypeFilter: vi.fn(),
    sortBy: 'default' as SortOption,
    setSortBy: vi.fn(),
    isAllExpanded: false,
    onToggleExpandAll: vi.fn(),
    onResetFilters: vi.fn(),
  };

  it('1. Loại bỏ hoàn toàn mảng CATEGORIES và các nút pill danh mục cũ', () => {
    render(<HouseholdFilterBar {...defaultProps} />);

    // Các danh mục cũ không được xuất hiện dưới dạng nút pill độc lập
    expect(screen.queryByRole('button', { name: /^Cà phê$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Cao su$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Dược liệu$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Chăn nuôi$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Thủy sản$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Tất cả$/i })).not.toBeInTheDocument();
  });

  it('2. Nút Làm mới (↻) tồn tại, hoạt động và hiển thị trạng thái loading', () => {
    const onRefresh = vi.fn();
    const { rerender } = render(
      <HouseholdFilterBar {...defaultProps} onRefresh={onRefresh} loading={false} />
    );

    const refreshBtn = screen.getByRole('button', { name: /Làm mới danh sách/i });
    expect(refreshBtn).toBeInTheDocument();

    fireEvent.click(refreshBtn);
    expect(onRefresh).toHaveBeenCalledTimes(1);

    // Kiểm tra icon xoay khi loading
    rerender(<HouseholdFilterBar {...defaultProps} onRefresh={onRefresh} loading={true} />);
    const icon = refreshBtn.querySelector('svg');
    expect(icon).toHaveClass('animate-spin');
  });

  it('3. Tích hợp và hiển thị đầy đủ 3 dropdown CustomSelect (Quy mô, Loại hình, Sắp xếp)', () => {
    render(<HouseholdFilterBar {...defaultProps} />);

    // Dropdown Quy mô canh tác
    expect(screen.getByRole('button', { name: /Tất cả quy mô/i })).toBeInTheDocument();
    // Dropdown Loại hình đặc thù
    expect(screen.getByRole('button', { name: /Tất cả loại hình/i })).toBeInTheDocument();
    // Dropdown Sắp xếp nhanh
    expect(screen.getByRole('button', { name: /Mặc định \(STT\)/i })).toBeInTheDocument();
  });

  it('4. Tương tác với dropdowns kích hoạt setScaleFilter, setTypeFilter, setSortBy', () => {
    const setScaleFilter = vi.fn();
    const setTypeFilter = vi.fn();
    const setSortBy = vi.fn();

    render(
      <HouseholdFilterBar
        {...defaultProps}
        setScaleFilter={setScaleFilter}
        setTypeFilter={setTypeFilter}
        setSortBy={setSortBy}
      />
    );

    // Mở dropdown Quy mô và chọn 'Lớn (> 2ha / > 15 con)'
    const scaleTrigger = screen.getByRole('button', { name: /Tất cả quy mô/i });
    fireEvent.click(scaleTrigger);
    const scaleListbox = screen.getByRole('listbox');
    const largeOption = within(scaleListbox).getByText(/Lớn \(> 2ha \/ > 15 con\)/i);
    fireEvent.click(largeOption);
    expect(setScaleFilter).toHaveBeenCalledWith('large');

    // Mở dropdown Loại hình và chọn 'Trồng dược liệu'
    const typeTrigger = screen.getByRole('button', { name: /Tất cả loại hình/i });
    fireEvent.click(typeTrigger);
    const typeListbox = screen.getByRole('listbox');
    const herbsOption = within(typeListbox).getByText('Trồng dược liệu');
    fireEvent.click(herbsOption);
    expect(setTypeFilter).toHaveBeenCalledWith('herbs');

    // Mở dropdown Sắp xếp và chọn 'Diện tích cây trồng ↓'
    const sortTrigger = screen.getByRole('button', { name: /Mặc định \(STT\)/i });
    fireEvent.click(sortTrigger);
    const sortListbox = screen.getByRole('listbox');
    const sortOption = within(sortListbox).getByText('Diện tích cây trồng ↓');
    fireEvent.click(sortOption);
    expect(setSortBy).toHaveBeenCalledWith('crops_desc');
  });

  it('5. Nút Bung / Thu gọn tất cả chi tiết hoạt động chính xác theo trạng thái', () => {
    const onToggleExpandAll = vi.fn();
    const { rerender } = render(
      <HouseholdFilterBar
        {...defaultProps}
        isAllExpanded={false}
        onToggleExpandAll={onToggleExpandAll}
      />
    );

    // Khi isAllExpanded = false -> Bung tất cả
    const expandBtn = screen.getByRole('button', { name: /Bung tất cả chi tiết/i });
    expect(expandBtn).toBeInTheDocument();
    expect(screen.getByText('Bung tất cả')).toBeInTheDocument();

    fireEvent.click(expandBtn);
    expect(onToggleExpandAll).toHaveBeenCalledTimes(1);

    // Khi isAllExpanded = true -> Thu gọn tất cả
    rerender(
      <HouseholdFilterBar
        {...defaultProps}
        isAllExpanded={true}
        onToggleExpandAll={onToggleExpandAll}
      />
    );

    const collapseBtn = screen.getByRole('button', { name: /Thu gọn tất cả chi tiết/i });
    expect(collapseBtn).toBeInTheDocument();
    expect(screen.getByText('Thu gọn tất cả')).toBeInTheDocument();
  });

  it('6. Nút Xóa nhanh bộ lọc chỉ hiển thị khi có bộ lọc active và hoạt động đúng', () => {
    const setSearch = vi.fn();
    const setScaleFilter = vi.fn();
    const setTypeFilter = vi.fn();
    const setSortBy = vi.fn();
    const onResetFilters = vi.fn();

    // Mặc định: không hiển thị nút Xóa lọc
    const { rerender } = render(
      <HouseholdFilterBar
        {...defaultProps}
        search=""
        scaleFilter="all"
        typeFilter="all"
        sortBy="default"
      />
    );
    expect(screen.queryByRole('button', { name: /Xóa bộ lọc/i })).not.toBeInTheDocument();

    // Khi có search
    rerender(
      <HouseholdFilterBar
        {...defaultProps}
        search="A Blong"
        scaleFilter="all"
        typeFilter="all"
        sortBy="default"
        setSearch={setSearch}
        setScaleFilter={setScaleFilter}
        setTypeFilter={setTypeFilter}
        setSortBy={setSortBy}
        onResetFilters={onResetFilters}
      />
    );
    const resetBtn = screen.getByRole('button', { name: /Xóa bộ lọc/i });
    expect(resetBtn).toBeInTheDocument();
    expect(screen.getByText('Xóa lọc')).toBeInTheDocument();

    // Click nút Xóa lọc
    fireEvent.click(resetBtn);
    expect(setSearch).toHaveBeenCalledWith('');
    expect(setScaleFilter).toHaveBeenCalledWith('all');
    expect(setTypeFilter).toHaveBeenCalledWith('all');
    expect(setSortBy).toHaveBeenCalledWith('default');
    expect(onResetFilters).toHaveBeenCalledTimes(1);

    // Khi có scaleFilter !== 'all'
    rerender(
      <HouseholdFilterBar
        {...defaultProps}
        search=""
        scaleFilter="large"
        typeFilter="all"
        sortBy="default"
      />
    );
    expect(screen.getByRole('button', { name: /Xóa bộ lọc/i })).toBeInTheDocument();
  });

  it('7. Ô tìm kiếm họ tên hoạt động và hỗ trợ nút xóa text nhanh', () => {
    const setSearch = vi.fn();
    const { rerender } = render(
      <HouseholdFilterBar {...defaultProps} search="" setSearch={setSearch} />
    );

    const input = screen.getByPlaceholderText('Tìm theo họ tên chủ hộ...');
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'Y Krang' } });
    expect(setSearch).toHaveBeenCalledWith('Y Krang');

    // Nút X xóa tìm kiếm hiển thị khi search có giá trị
    rerender(
      <HouseholdFilterBar {...defaultProps} search="Y Krang" setSearch={setSearch} />
    );
    const clearSearchBtn = screen.getByRole('button', { name: /Xóa tìm kiếm/i });
    expect(clearSearchBtn).toBeInTheDocument();

    fireEvent.click(clearSearchBtn);
    expect(setSearch).toHaveBeenCalledWith('');
  });
});
