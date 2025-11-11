import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Icon from "@/components/ui/icon";
import { toast } from "sonner";
import * as XLSX from 'xlsx-js-style';
import Sidebar from "@/components/contracts/Sidebar";
import StatsCards from "@/components/contracts/StatsCards";
import ContractsTable, { Contract } from "@/components/contracts/ContractsTable";
import AddContractDialog from "@/components/contracts/AddContractDialog";
import EditContractDialog from "@/components/contracts/EditContractDialog";
import AuditLogDialog from "@/components/contracts/AuditLogDialog";

const API_URL = "https://functions.poehali.dev/b8cf114d-cee0-421e-8222-3f5a782739fb";

const Index = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "Пользователь";
  const userRole = localStorage.getItem("userRole") || "";
  const userLogin = localStorage.getItem("userLogin") || "";

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userName");
    localStorage.removeItem("userLogin");
    localStorage.removeItem("userRole");
    toast.success("Вы вышли из системы");
    navigate("/login");
  };

  const handleNavigateUsers = () => {
    navigate("/users");
  };

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const firstLoad = async () => {
      await loadContracts(false);
    };
    firstLoad();
    
    const syncInterval = setInterval(() => {
      loadContracts(false);
    }, 30000);
    
    return () => clearInterval(syncInterval);
  }, []);

  const loadContracts = async (showToast = false, clearCache = false) => {
    try {
      setIsLoading(true);
      
      if (clearCache) {
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));
        }
        console.log('Кэш очищен');
      }
      
      const timestamp = new Date().getTime();
      const response = await fetch(`${API_URL}?t=${timestamp}`, {
        headers: {
          'X-User-Role': userRole,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        cache: 'no-store'
      });
      const data = await response.json();
      const contractCount = data.contracts?.length || 0;
      console.log('=== СИНХРОНИЗАЦИЯ С СЕРВЕРОМ ===');
      console.log('Получено договоров:', contractCount);
      setContracts(data.contracts || []);
      if (showToast) {
        toast.success(`Синхронизировано: ${contractCount} договоров`);
      }
    } catch (error) {
      toast.error("Ошибка загрузки договоров");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSyncContracts = () => {
    loadContracts(true, true);
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newContract, setNewContract] = useState<Partial<Contract>>({});
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAuditLogOpen, setIsAuditLogOpen] = useState(false);
  const [sortField, setSortField] = useState<'organization' | 'contractNumber' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const isExpired = (expirationDate: string): boolean => {
    if (!expirationDate || expirationDate.trim() === '') return false;
    
    let expDate: Date;
    if (expirationDate.includes('.')) {
      const [day, month, year] = expirationDate.split(".");
      if (!day || !month || !year) return false;
      expDate = new Date(+year, +month - 1, +day);
    } else if (expirationDate.includes('-')) {
      expDate = new Date(expirationDate);
    } else {
      return false;
    }
    
    expDate.setHours(23, 59, 59, 999);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return expDate < today;
  };

  const isExpiringSoon = (expirationDate: string): boolean => {
    if (!expirationDate || expirationDate.trim() === '') return false;
    
    let expDate: Date;
    if (expirationDate.includes('.')) {
      const [day, month, year] = expirationDate.split(".");
      if (!day || !month || !year) return false;
      expDate = new Date(+year, +month - 1, +day);
    } else if (expirationDate.includes('-')) {
      expDate = new Date(expirationDate);
    } else {
      return false;
    }
    
    const today = new Date();
    const daysUntilExpiration = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiration > 0 && daysUntilExpiration <= 30;
  };

  const convertDateToDisplay = (dateStr: string): string => {
    if (!dateStr) return '';
    if (dateStr.includes('.')) return dateStr;
    
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const convertDateToInput = (dateStr: string): string => {
    if (!dateStr) return '';
    if (dateStr.includes('-')) return dateStr;
    
    const [day, month, year] = dateStr.split('.');
    if (!day || !month || !year) return '';
    return `${year}-${month}-${day}`;
  };

  const handleAddContract = async () => {
    if (!newContract.organizationName) {
      toast.error("Заполните обязательное поле: Название организации");
      return;
    }

    const contractData = {
      ...newContract,
      contractDate: newContract.contractDate ? convertDateToDisplay(newContract.contractDate) : '',
      expirationDate: newContract.expirationDate ? convertDateToDisplay(newContract.expirationDate) : '',
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-User-Role": userRole
        },
        body: JSON.stringify(contractData),
      });

      if (response.ok) {
        await loadContracts();
        setNewContract({});
        setIsDialogOpen(false);
        toast.success("Договор успешно добавлен");
      } else {
        toast.error("Ошибка при добавлении договора");
      }
    } catch (error) {
      toast.error("Ошибка связи с сервером");
      console.error(error);
    }
  };

  const handleEditContract = async () => {
    if (!editingContract) return;

    const contractData = {
      ...editingContract,
      contractDate: editingContract.contractDate ? convertDateToDisplay(editingContract.contractDate) : '',
      expirationDate: editingContract.expirationDate ? convertDateToDisplay(editingContract.expirationDate) : '',
    };

    try {
      const response = await fetch(`${API_URL}?id=${editingContract.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "X-User-Role": userRole
        },
        body: JSON.stringify(contractData),
      });

      if (response.ok) {
        await loadContracts();
        setEditingContract(null);
        setIsEditDialogOpen(false);
        toast.success("Договор успешно обновлен");
      } else {
        toast.error("Ошибка при обновлении договора");
      }
    } catch (error) {
      toast.error("Ошибка связи с сервером");
      console.error(error);
    }
  };

  const handleDeleteContract = async (id: number) => {
    if (!confirm("Вы уверены, что хотите удалить этот договор?")) return;

    try {
      const response = await fetch(`${API_URL}?id=${id}`, {
        method: "DELETE",
        headers: {
          "X-User-Role": userRole
        }
      });

      if (response.ok) {
        await loadContracts();
        toast.success("Договор успешно удален");
      } else {
        toast.error("Ошибка при удалении договора");
      }
    } catch (error) {
      toast.error("Ошибка связи с сервером");
      console.error(error);
    }
  };

  const handleSort = (field: 'organization' | 'contractNumber') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'active' ? !isExpired(contract.expirationDate) :
      isExpired(contract.expirationDate);
    
    const matchesSearch = 
      searchQuery.trim() === '' ||
      (contract.organizationName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (contract.contractNumber || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  }).sort((a, b) => {
    if (!sortField) return 0;
    
    let comparison = 0;
    if (sortField === 'organization') {
      comparison = (a.organizationName || '').localeCompare(b.organizationName || '', 'ru');
    } else if (sortField === 'contractNumber') {
      const numA = parseInt((a.contractNumber || '').replace(/\D/g, '')) || 0;
      const numB = parseInt((b.contractNumber || '').replace(/\D/g, '')) || 0;
      comparison = numA - numB;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const stats = {
    total: contracts.length,
    active: contracts.filter(c => !isExpired(c.expirationDate)).length,
    expired: contracts.filter(c => isExpired(c.expirationDate)).length,
    totalAmount: contracts.reduce((sum, c) => sum + parseFloat((c.totalAmount || '0').replace(/\s/g, "")), 0),
  };
  
  console.log('Статистика договоров:', stats.total, 'всего');

  const handleExportToExcel = () => {
    const exportData = contracts.map((contract, index) => ({
      '№': index + 1,
      'Название организации': contract.organizationName || '',
      'Номер договора': contract.contractNumber || '',
      'Дата договора': convertDateToDisplay(contract.contractDate || ''),
      'Срок действия': convertDateToDisplay(contract.expirationDate || ''),
      'Цена': contract.amount || '',
      'Комментарий к цене': contract.amountComment || '',
      'Сумма договора (₽)': contract.totalAmount ? parseFloat(contract.totalAmount) : 0,
      'СБИС': contract.sbis || '',
      'ЕИС': contract.eis || '',
      'Акт работ': contract.workAct || '',
      'Контактное лицо 1': contract.contactPerson || '',
      'Телефон 1': contract.contactPhone || '',
      'Контактное лицо 2': contract.contactPerson2 || '',
      'Телефон 2': contract.contactPhone2 || '',
      'Контактное лицо 3': contract.contactPerson3 || '',
      'Телефон 3': contract.contactPhone3 || '',
      'Примечание': contract.notes || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    const colCount = range.e.c + 1;
    const rowCount = range.e.r + 1;

    worksheet['!cols'] = [
      { wch: 6 }, { wch: 38 }, { wch: 18 }, { wch: 14 }, 
      { wch: 14 }, { wch: 24 }, { wch: 30 }, { wch: 16 }, { wch: 15 }, { wch: 15 }, 
      { wch: 15 }, { wch: 30 }, { wch: 20 }, { wch: 30 }, { wch: 20 },
      { wch: 30 }, { wch: 20 }, { wch: 40 }
    ];

    if (!worksheet['!rows']) worksheet['!rows'] = [];
    worksheet['!rows'][0] = { hpt: 35 };
    for (let i = 1; i < rowCount; i++) {
      worksheet['!rows'][i] = { hpt: 22 };
    }

    for (let R = 0; R < rowCount; R++) {
      for (let C = 0; C < colCount; C++) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!worksheet[cellAddress]) continue;

        const cell = worksheet[cellAddress];
        
        if (R === 0) {
          cell.s = {
            fill: { fgColor: { rgb: "2563EB" } },
            font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12, name: "Segoe UI" },
            alignment: { horizontal: "center", vertical: "center", wrapText: true },
            border: {
              top: { style: "thin", color: { rgb: "1E40AF" } },
              bottom: { style: "thin", color: { rgb: "1E40AF" } },
              left: { style: "thin", color: { rgb: "1E40AF" } },
              right: { style: "thin", color: { rgb: "1E40AF" } }
            }
          };
        } else {
          const isEvenRow = R % 2 === 0;
          cell.s = {
            fill: { fgColor: { rgb: isEvenRow ? "EFF6FF" : "FFFFFF" } },
            font: { sz: 11, name: "Segoe UI", color: { rgb: "0F172A" } },
            alignment: { 
              horizontal: C === 0 ? "center" : (C === 6 ? "right" : "left"), 
              vertical: "center", 
              wrapText: C === 5
            },
            border: {
              top: { style: "hair", color: { rgb: "DBEAFE" } },
              bottom: { style: "hair", color: { rgb: "DBEAFE" } },
              left: { style: "hair", color: { rgb: "E0E7FF" } },
              right: { style: "hair", color: { rgb: "E0E7FF" } }
            }
          };

          if (C === 0) {
            cell.t = 'n';
            cell.z = '0';
            cell.s.font = { ...cell.s.font, bold: true, color: { rgb: "2563EB" } };
          } else if (C === 5) {
            cell.t = 's';
            cell.s.alignment = { ...cell.s.alignment, wrapText: true };
          } else if (C === 6) {
            cell.t = 'n';
            cell.z = '#,##0 ₽';
            cell.s.font = { ...cell.s.font, bold: true };
          } else if (C === 3 || C === 4) {
            cell.t = 's';
          } else if (C === 16) {
            cell.t = 's';
            cell.s.font = { ...cell.s.font, bold: true };
          } else {
            cell.t = 's';
          }
        }
      }
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Договоры');
    
    const today = new Date();
    const dateStr = today.toLocaleDateString('ru-RU').replace(/\./g, '-');
    const fileName = `Договоры_${dateStr}.xlsx`;
    
    XLSX.writeFile(workbook, fileName);
    toast.success("Файл успешно экспортирован");
  };

  const handleImportFromExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        console.log('Импорт данных:', jsonData);

        let successCount = 0;
        let errorCount = 0;

        const parseExcelDate = (value: any): string => {
          if (!value) return '';
          
          if (typeof value === 'number') {
            const date = new Date((value - 25569) * 86400 * 1000);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}.${month}.${year}`;
          }
          
          return String(value).trim();
        };

        for (const row of jsonData) {
          if (!row['Название организации'] || row['Название организации'].trim() === '') {
            console.log('Пропуск пустой строки:', row);
            continue;
          }

          const totalAmountValue = row['Сумма договора (₽)'];
          let totalAmountStr = '';
          
          if (typeof totalAmountValue === 'number') {
            totalAmountStr = String(Math.round(totalAmountValue));
          } else if (typeof totalAmountValue === 'string' && totalAmountValue.trim()) {
            totalAmountStr = totalAmountValue.replace(/[^\d]/g, '') || '';
          }

          const contract: Partial<Contract> = {
            organizationName: String(row['Название организации'] || '').trim(),
            contractNumber: String(row['Номер договора'] || '').trim(),
            contractDate: parseExcelDate(row['Дата договора']),
            expirationDate: parseExcelDate(row['Срок действия']),
            amount: String(row['Цена'] || '').trim(),
            totalAmount: totalAmountStr,
            notes: String(row['Примечание'] || '').trim(),
            sbis: String(row['СБИС'] || '').trim() || 'Нет',
            eis: String(row['ЕИС'] || '').trim() || 'Нет',
            workAct: String(row['Акт работ'] || '').trim() || 'Нет',
            contactPerson: String(row['Контактное лицо 1'] || row['Контактное лицо'] || '').trim(),
            contactPhone: String(row['Телефон 1'] || row['Телефон'] || '').trim(),
            contactPerson2: String(row['Контактное лицо 2'] || '').trim(),
            contactPhone2: String(row['Телефон 2'] || '').trim(),
            contactPerson3: String(row['Контактное лицо 3'] || '').trim(),
            contactPhone3: String(row['Телефон 3'] || '').trim(),
          };

          // Проверка на дубликаты по номеру договора и названию организации
          const isDuplicate = contracts.some(c => 
            c.contractNumber === contract.contractNumber && 
            c.organizationName === contract.organizationName
          );

          if (isDuplicate) {
            console.log('Пропуск дубликата:', contract);
            continue;
          }

          console.log('Отправка договора:', contract);

          try {
            const response = await fetch(API_URL, {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                "X-User-Role": userRole
              },
              body: JSON.stringify(contract),
            });

            if (response.ok) {
              successCount++;
            } else {
              const errorText = await response.text();
              console.error('Ошибка при добавлении:', errorText);
              errorCount++;
            }
          } catch (error) {
            console.error('Ошибка запроса:', error);
            errorCount++;
          }
        }

        await loadContracts();
        toast.success(`Импортировано: ${successCount}, ошибок: ${errorCount}`);
      } catch (error) {
        toast.error("Ошибка при импорте файла");
        console.error(error);
      }
    };

    reader.readAsArrayBuffer(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex flex-1">
        {userRole === "admin" && (
          <>
            <aside className="hidden lg:block w-64 border-r bg-card print:hidden">
              <Sidebar 
                userRole={userRole} 
                onNavigateUsers={handleNavigateUsers}
                onOpenAuditLog={() => setIsAuditLogOpen(true)}
              />
            </aside>

            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden print:hidden fixed top-4 left-4 z-50">
                <Button variant="ghost" size="icon">
                  <Icon name="Menu" size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle>Меню</SheetTitle>
                </SheetHeader>
                <Sidebar 
                  userRole={userRole} 
                  onNavigateUsers={handleNavigateUsers}
                  onOpenAuditLog={() => setIsAuditLogOpen(true)}
                />
              </SheetContent>
            </Sheet>
          </>
        )}

        <main className="flex-1 overflow-x-hidden">
          <div className="w-full max-w-[1920px] mx-auto p-4 lg:p-6 space-y-6">
            <div className="flex justify-end print:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Icon name="User" size={20} />
                    <span className="hidden md:inline-block">{userName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userName}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {userRole === "admin" ? "Администратор" : 
                         userRole === "accountant" ? "Бухгалтер" : "Пользователь"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">{userLogin}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <Icon name="LogOut" size={16} className="mr-2" />
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <StatsCards stats={stats} onSync={handleSyncContracts} />

            <div className="bg-card rounded-lg border p-4 mb-6">
              <div className="flex flex-col gap-4">
                <div className="flex-1 relative">
                  <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по организации или номеру договора..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <div className="flex gap-2">
                    <Button
                      variant={statusFilter === 'all' ? 'default' : 'outline'}
                      onClick={() => setStatusFilter('all')}
                      size="sm"
                    >
                      Все
                    </Button>
                    <Button
                      variant={statusFilter === 'active' ? 'default' : 'outline'}
                      onClick={() => setStatusFilter('active')}
                      size="sm"
                    >
                      Активные
                    </Button>
                    <Button
                      variant={statusFilter === 'expired' ? 'default' : 'outline'}
                      onClick={() => setStatusFilter('expired')}
                      size="sm"
                    >
                      Истекшие
                    </Button>
                  </div>

                  <div className="flex gap-2 ml-auto">
                    {userRole !== "accountant" && (
                      <>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={handleImportFromExcel}
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Icon name="Upload" size={18} className="mr-2" />
                          <span className="hidden sm:inline">Импорт</span>
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportToExcel}
                    >
                      <Icon name="Download" size={18} className="mr-2" />
                      <span className="hidden sm:inline">Экспорт</span>
                    </Button>
                    {userRole !== "accountant" && (
                      <Button onClick={() => setIsDialogOpen(true)} size="sm">
                        <Icon name="Plus" size={18} className="mr-2" />
                        <span className="hidden sm:inline">Добавить</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <AddContractDialog
              isOpen={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              newContract={newContract}
              onContractChange={setNewContract}
              onSubmit={handleAddContract}
            />

            <EditContractDialog
              isOpen={isEditDialogOpen}
              onOpenChange={setIsEditDialogOpen}
              contract={editingContract}
              onContractChange={setEditingContract}
              onSubmit={handleEditContract}
            />

            <AuditLogDialog
              isOpen={isAuditLogOpen}
              onOpenChange={setIsAuditLogOpen}
              onRestore={loadContracts}
            />

            <div className="print-header hidden print:block mb-4">
              <h1 className="text-lg font-bold mb-1">Список договоров - {
                statusFilter === 'all' ? 'Все договоры' :
                statusFilter === 'active' ? 'Активные договоры' :
                'Истекшие договоры'
              }</h1>
              <p className="text-sm">Дата печати: {new Date().toLocaleDateString('ru-RU')}</p>
            </div>

            <ContractsTable
              contracts={filteredContracts}
              isLoading={isLoading}
              onEdit={(contract) => {
                setEditingContract({
                  ...contract,
                  contractDate: convertDateToInput(contract.contractDate),
                  expirationDate: convertDateToInput(contract.expirationDate)
                });
                setIsEditDialogOpen(true);
              }}
              onDelete={handleDeleteContract}
              userRole={userRole}
              isExpired={isExpired}
              isExpiringSoon={isExpiringSoon}
              onSort={handleSort}
              sortField={sortField}
              sortDirection={sortDirection}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;