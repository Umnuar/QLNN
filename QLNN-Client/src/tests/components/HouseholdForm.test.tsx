import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HouseholdModal } from '../../components/households/HouseholdModal';
import { AppProvider } from '../../AppContext';
import { ModalProvider } from '../../hooks/useModal';

describe('HouseholdModal (HouseholdForm) UI', () => {
  it('1. Render các tab Trồng trọt, Chăn nuôi, Thuỷ sản', () => {
    render(
      <AppProvider>
        <ModalProvider>
          <HouseholdModal isOpen={true} onClose={() => {}} household={null} onSuccess={() => {}} />
        </ModalProvider>
      </AppProvider>
    );

    // Cây trồng (tab mặc định)
    expect(screen.getByText(/1\. Cây Trồng/i)).toBeInTheDocument();
    expect(screen.getByText(/2\. Vật Nuôi/i)).toBeInTheDocument();
    expect(screen.getByText(/3\. Thủy Sản/i)).toBeInTheDocument();

    // Nội dung tab Cây trồng hiện ra mặc định
    expect(screen.getByText('CÀ PHÊ')).toBeInTheDocument();
  });

  it('2. Chuyển đổi giữa các tab', () => {
    render(
      <AppProvider>
        <ModalProvider>
          <HouseholdModal isOpen={true} onClose={() => {}} household={null} onSuccess={() => {}} />
        </ModalProvider>
      </AppProvider>
    );

    // Chuyển sang Vật nuôi
    fireEvent.click(screen.getByText(/2\. Vật Nuôi/i));
    expect(screen.getByText('Đàn Trâu')).toBeInTheDocument();
    expect(screen.queryByText('CÀ PHÊ')).not.toBeInTheDocument();

    // Chuyển sang Thuỷ sản
    fireEvent.click(screen.getByText(/3\. Thủy Sản/i));
    expect(screen.getByText('Nuôi Cá Lồng Bè (Số lồng)')).toBeInTheDocument();
    expect(screen.queryByText('Đàn Trâu')).not.toBeInTheDocument();
  });

  it('3. Validate dữ liệu trống khi submit form', async () => {
    render(
      <AppProvider>
        <ModalProvider>
          <HouseholdModal isOpen={true} onClose={() => {}} household={null} onSuccess={() => {}} />
        </ModalProvider>
      </AppProvider>
    );

    // Trigger submit directly on the form or submit button bypass?
    // Wait, let's just trigger submit on the submit button's form
    const submitButton = screen.getByRole('button', { name: /Lưu Hộ Mới/i });
    fireEvent.submit(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Vui lòng nhập họ và tên chủ hộ.')).toBeInTheDocument();
    });
  });
});
