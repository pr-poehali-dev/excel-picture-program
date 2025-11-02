import * as XLSX from 'xlsx';
import { Contract } from './ContractsTable';

export const exportContractsToExcel = (contracts: Contract[]) => {
  const exportData = contracts.map((contract, index) => ({
    '№': index + 1,
    'Название организации': contract.organizationName,
    'Номер договора': contract.contractNumber,
    'Дата договора': contract.contractDate,
    'Срок действия': contract.expirationDate,
    'Сумма (₽)': parseFloat(contract.amount.replace(/\s/g, '')),
    'СБИС': contract.sbis,
    'ЕИС': contract.eis,
    'Акт работ': contract.workAct,
    'Контактное лицо': contract.contactPerson,
    'Телефон': contract.contactPhone,
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  const colCount = range.e.c + 1;
  const rowCount = range.e.r + 1;

  worksheet['!cols'] = [
    { wch: 5 }, { wch: 30 }, { wch: 18 }, { wch: 15 }, 
    { wch: 15 }, { wch: 15 }, { wch: 8 }, { wch: 8 }, 
    { wch: 12 }, { wch: 25 }, { wch: 18 }
  ];

  for (let R = 0; R < rowCount; R++) {
    for (let C = 0; C < colCount; C++) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!worksheet[cellAddress]) continue;

      const cell = worksheet[cellAddress];
      
      if (R === 0) {
        cell.s = {
          fill: { fgColor: { rgb: "1E293B" } },
          font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
          alignment: { horizontal: "center", vertical: "center", wrapText: true },
          border: {
            top: { style: "thin", color: { rgb: "334155" } },
            bottom: { style: "thin", color: { rgb: "334155" } },
            left: { style: "thin", color: { rgb: "334155" } },
            right: { style: "thin", color: { rgb: "334155" } }
          }
        };
      } else {
        cell.s = {
          alignment: { 
            horizontal: C === 0 ? "center" : (C === 5 ? "right" : "left"), 
            vertical: "center", 
            wrapText: true 
          },
          border: {
            top: { style: "thin", color: { rgb: "E2E8F0" } },
            bottom: { style: "thin", color: { rgb: "E2E8F0" } },
            left: { style: "thin", color: { rgb: "E2E8F0" } },
            right: { style: "thin", color: { rgb: "E2E8F0" } }
          }
        };

        if (C === 5) {
          cell.z = '#,##0.00';
        }
      }
    }
  }

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Договоры');
  
  const today = new Date();
  const dateStr = today.toLocaleDateString('ru-RU').replace(/\./g, '-');
  const fileName = `Договоры_${dateStr}.xlsx`;
  
  XLSX.writeFile(workbook, fileName);
};
