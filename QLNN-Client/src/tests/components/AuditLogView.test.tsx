import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AuditLogView } from '../../components/audit/AuditLogView';
import { AppProvider } from '../../AppContext';
import { auditApi } from '../../api/auditApi';

// Mock API
vi.mock('../../api/auditApi', () => ({
  auditApi: {
    getLogs: vi.fn(),
  },
}));

const mockLogs = {
  data: [
    {
      id: '1',
      action: 'UPDATE',
      username: 'admin',
      created_at: new Date().toISOString(),
      details: { 'Cà phê (Hộ gia đình) (ha)': { old: 0, new: 100 } }
    },
    {
      id: '2',
      action: 'RESTORE',
      username: 'admin',
      created_at: new Date().toISOString(),
      details: { message: 'Khôi phục 1 hộ dân', names: ['Nguyễn Văn A'] }
    }
  ],
  pagination: { total: 2 }
};

describe('AuditLogView UI (Phần 2.4)', () => {
  it('1. Render giao diện Timeline thành công', async () => {
    (auditApi.getLogs as any).mockResolvedValueOnce(mockLogs);
    
    render(
      <AppProvider>
        <AuditLogView showFilters={true} />
      </AppProvider>
    );

    // Kiểm tra API được gọi
    expect(auditApi.getLogs).toHaveBeenCalled();
    
    // Đợi render
    await waitFor(() => {
      expect(screen.getByText('Khôi phục 1 hộ dân')).toBeInTheDocument();
      expect(screen.getByText('Cà phê (Hộ gia đình) (ha):')).toBeInTheDocument();
    });
  });

  it('2. Filter theo Action "RESTORE"', async () => {
    (auditApi.getLogs as any).mockResolvedValue(mockLogs);
    
    render(
      <AppProvider>
        <AuditLogView />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Khôi phục 1 hộ dân')).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'RESTORE' } });

    // Cà phê (UPDATE) sẽ bị ẩn đi
    expect(screen.queryByText('Cà phê (Hộ gia đình) (ha):')).not.toBeInTheDocument();
    // Nhưng Khôi phục vẫn còn
    expect(screen.getByText('Khôi phục 1 hộ dân')).toBeInTheDocument();
  });
});
