import ExcelJS from 'exceljs';

/**
 * Professional Excel Workbook Exporter for Royal Mart
 * Meets all formatting requirements:
 * - Theme green header (#294638) with bold white text
 * - Frozen header row
 * - Auto-sized column widths with padding
 * - Correct number formats (₹ currency, real dates, numbers)
 * - Auto-filter on header
 * - Totals row where appropriate
 * - Filename format: <module>-<store-name>-<YYYY-MM-DD>.xlsx
 */
export async function exportToExcel({
  moduleName = 'export',
  storeName = 'royal-mart',
  sheetName = 'Data',
  columns = [],
  rows = [],
  totals = null // { labelCol: 'name', sumCols: ['selling_price', 'total'] }
}) {
  if (!rows || !rows.length) {
    throw new Error('No records available to export.');
  }

  const wb = new ExcelJS.Workbook();
  wb.creator = 'Royal Mart Management System';
  wb.created = new Date();

  const ws = wb.addWorksheet(sheetName, {
    views: [{ state: 'frozen', ySplit: 1 }]
  });

  // Define columns
  ws.columns = columns.map(col => ({
    header: col.header,
    key: col.key,
    width: col.width || 18
  }));

  // Style Header Row
  const headerRow = ws.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF294638' } // Theme Deep Green
    };
    cell.font = {
      name: 'Segoe UI',
      size: 11,
      bold: true,
      color: { argb: 'FFFFFFFF' }
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'left',
      wrapText: false
    };
    cell.border = {
      bottom: { style: 'medium', color: { argb: 'FFD5BD91' } } // Gold accent
    };
  });

  // Populate data rows with type safety and formatting
  rows.forEach((item) => {
    const rowValues = {};
    columns.forEach((col) => {
      let val = item[col.key];
      if (col.format === 'currency' || col.format === 'number') {
        val = val == null || val === '' ? 0 : Number(val);
      } else if (col.format === 'date' && val) {
        val = new Date(val);
      } else if (val == null) {
        val = '';
      }
      rowValues[col.key] = val;
    });

    const addedRow = ws.addRow(rowValues);
    addedRow.height = 20;

    // Apply cell formatting
    columns.forEach((col, colIdx) => {
      const cell = addedRow.getCell(colIdx + 1);
      cell.alignment = {
        vertical: 'middle',
        horizontal: col.align || (col.format === 'currency' || col.format === 'number' ? 'right' : 'left')
      };

      if (col.format === 'currency') {
        cell.numFmt = '₹#,##0.00';
      } else if (col.format === 'number') {
        cell.numFmt = col.precision ? `#,##0.${'0'.repeat(col.precision)}` : '#,##0.00';
      } else if (col.format === 'integer') {
        cell.numFmt = '#,##0';
      } else if (col.format === 'date') {
        cell.numFmt = 'yyyy-mm-dd hh:mm';
      } else if (col.format === 'date-only') {
        cell.numFmt = 'yyyy-mm-dd';
      }
    });
  });

  // Add auto-filter
  if (columns.length > 0) {
    ws.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: columns.length }
    };
  }

  // Add Totals row if configured
  if (totals && rows.length > 0) {
    const totalRowValues = {};
    columns.forEach((col) => {
      if (col.key === (totals.labelCol || columns[0].key)) {
        totalRowValues[col.key] = 'TOTAL';
      } else if (totals.sumCols && totals.sumCols.includes(col.key)) {
        const sum = rows.reduce((acc, r) => acc + (Number(r[col.key]) || 0), 0);
        totalRowValues[col.key] = sum;
      } else {
        totalRowValues[col.key] = '';
      }
    });

    const tRow = ws.addRow(totalRowValues);
    tRow.height = 24;
    columns.forEach((col, colIdx) => {
      const cell = tRow.getCell(colIdx + 1);
      cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FF294638' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE9EFE8' } // Sage
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF496751' } },
        bottom: { style: 'double', color: { argb: 'FF294638' } }
      };
      if (totals.sumCols && totals.sumCols.includes(col.key)) {
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        if (col.format === 'currency') cell.numFmt = '₹#,##0.00';
        else if (col.format === 'number') cell.numFmt = '#,##0.00';
      }
    });
  }

  // Auto-fit column widths
  columns.forEach((col, colIdx) => {
    let maxLen = col.header ? String(col.header).length : 10;
    rows.forEach((r) => {
      const cellVal = r[col.key];
      if (cellVal != null) {
        const str = col.format === 'currency' ? `₹${Number(cellVal).toFixed(2)}` : String(cellVal);
        if (str.length > maxLen) maxLen = str.length;
      }
    });
    const column = ws.getColumn(colIdx + 1);
    column.width = Math.min(Math.max(maxLen + 4, 13), 42);
  });

  // Generate buffer and trigger browser download
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  const dateStr = new Date().toISOString().slice(0, 10);
  const cleanStore = String(storeName).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'royal-mart';
  const cleanModule = String(moduleName).toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const fullFilename = `${cleanModule}-${cleanStore}-${dateStr}.xlsx`;

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fullFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);

  return fullFilename;
}
