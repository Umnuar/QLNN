import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ImportPreviewModal } from '../../components/excel/ImportPreviewModal';

describe('Excel 21 Columns Preview Verification', () => {
  const sampleFile = new File(['test'], 'test_import.xlsx', {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const sampleRow = [
    1, // 0: STT
    'A Đảo', // 1: Họ và Tên
    1.5, // 2: Cà phê (Hộ)
    0.5, // 3: Cà phê (Nhận k)
    2.0, // 4: Cao su (Hộ)
    0.0, // 5: Cao su (Nhận k)
    0.8, // 6: Cây ăn quả
    1.2, // 7: Macca
    0.3, // 8: Đinh lăng
    0.2, // 9: Gừng
    0.1, // 10: Nghệ
    0.4, // 11: Sả
    1.0, // 12: Lúa nước
    0.6, // 13: Cây HN khác
    5, // 14: Trâu (con)
    10, // 15: Bò (con)
    20, // 16: Heo (con)
    150, // 17: Gia cầm (con)
    0.75, // 18: Ao cá (ha)
    2, // 19: Lồng bè
    'Hộ mẫu đạt chuẩn NTM', // 20: Ghi chú
  ];

  it('1. Render đầy đủ 21 tiêu đề cột chính xác theo đúng thứ tự', () => {
    render(
      <ImportPreviewModal
        isOpen={true}
        onClose={() => {}}
        file={sampleFile}
        parsedData={[sampleRow]}
        onConfirm={() => {}}
        importing={false}
      />
    );

    const expectedHeaders = [
      'STT',
      'Họ và Tên',
      'Cà phê (Hộ)',
      'Cà phê (Nhận k)',
      'Cao su (Hộ)',
      'Cao su (Nhận k)',
      'Cây ăn quả',
      'Macca',
      'Đinh lăng',
      'Gừng',
      'Nghệ',
      'Sả',
      'Lúa nước',
      'Cây HN khác',
      'Trâu (con)',
      'Bò (con)',
      'Heo (con)',
      'Gia cầm (con)',
      'Ao cá (ha)',
      'Lồng bè',
      'Ghi chú',
    ];

    const thElements = screen.getAllByRole('columnheader');
    expect(thElements).toHaveLength(21);

    expectedHeaders.forEach((headerText, index) => {
      expect(thElements[index]).toHaveTextContent(headerText);
    });
  });

  it('2. Dữ liệu các cột chăn nuôi và thủy sản (index 14-20) khớp đúng không bị lệch cột', () => {
    render(
      <ImportPreviewModal
        isOpen={true}
        onClose={() => {}}
        file={sampleFile}
        parsedData={[sampleRow]}
        onConfirm={() => {}}
        importing={false}
      />
    );

    // Xác nhận họ tên
    expect(screen.getByText('A Đảo')).toBeInTheDocument();

    // Lấy dòng dữ liệu đầu tiên
    const rows = screen.getAllByRole('row');
    // Row 0 là header, Row 1 là dữ liệu
    const dataCells = rows[1].querySelectorAll('td');
    expect(dataCells).toHaveLength(21);

    // Cột 14: Trâu (con) = 5
    expect(dataCells[14]).toHaveTextContent('5');
    // Cột 15: Bò (con) = 10
    expect(dataCells[15]).toHaveTextContent('10');
    // Cột 16: Heo (con) = 20
    expect(dataCells[16]).toHaveTextContent('20');
    // Cột 17: Gia cầm (con) = 150
    expect(dataCells[17]).toHaveTextContent('150');
    // Cột 18: Ao cá (ha) = 0.75
    expect(dataCells[18]).toHaveTextContent('0.75');
    // Cột 19: Lồng bè = 2
    expect(dataCells[19]).toHaveTextContent('2');
    // Cột 20: Ghi chú = 'Hộ mẫu đạt chuẩn NTM'
    expect(dataCells[20]).toHaveTextContent('Hộ mẫu đạt chuẩn NTM');
  });

  it('3. Render đúng thông báo khi dữ liệu rỗng với colSpan 21', () => {
    render(
      <ImportPreviewModal
        isOpen={true}
        onClose={() => {}}
        file={sampleFile}
        parsedData={[]}
        onConfirm={() => {}}
        importing={false}
      />
    );

    const emptyCell = screen.getByText('Không tìm thấy dữ liệu hợp lệ trong file');
    expect(emptyCell).toBeInTheDocument();
    expect(emptyCell).toHaveAttribute('colspan', '21');
  });
});
