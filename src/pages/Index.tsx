import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import * as XLSX from 'xlsx';
import Sidebar from "@/components/contracts/Sidebar";
import StatsCards from "@/components/contracts/StatsCards";
import ContractsTable, { Contract } from "@/components/contracts/ContractsTable";
import AddContractDialog from "@/components/contracts/AddContractDialog";
import EditContractDialog from "@/components/contracts/EditContractDialog";

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

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(API_URL);
      const data = await response.json();
      console.log('Загруженные договоры:', data.contracts);
      setContracts(data.contracts || []);
    } catch (error) {
      toast.error("Ошибка загрузки договоров");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newContract, setNewContract] = useState<Partial<Contract>>({});
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const handleAddContract = async () => {
    if (!newContract.organizationName || !newContract.expirationDate) {
      toast.error("Заполните обязательные поля");
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newContract),
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

    try {
      const response = await fetch(`${API_URL}?id=${editingContract.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingContract),
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

  const filteredContracts = contracts.filter(contract => {
    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'active' ? !isExpired(contract.expirationDate) :
      isExpired(contract.expirationDate);
    
    const matchesSearch = 
      searchQuery.trim() === '' ||
      contract.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.contractNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: contracts.length,
    active: contracts.filter(c => !isExpired(c.expirationDate)).length,
    expired: contracts.filter(c => isExpired(c.expirationDate)).length,
    totalAmount: contracts.reduce((sum, c) => sum + parseFloat(c.amount.replace(/\s/g, "")), 0),
  };

  const handleExportToExcel = () => {
    const exportData = contracts.map((contract, index) => ({
      '№': index + 1,
      'Название организации': contract.organizationName,
      'Номер договора': contract.contractNumber,
      'Дата договора': contract.contractDate,
      'Срок действия': contract.expirationDate,
      'Сумма (₽)': contract.amount,
      'СБИС': contract.sbis,
      'ЕИС': contract.eis,
      'Акт работ': contract.workAct,
      'Контактное лицо': contract.contactPerson,
      'Телефон': contract.contactPhone,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Договоры');
    
    const date = new Date().toLocaleDateString('ru-RU').replace(/\./g, '-');
    XLSX.writeFile(workbook, `Договоры_${date}.xlsx`);
    
    toast.success('Файл Excel успешно выгружен');
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
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        let added = 0;
        let updated = 0;

        for (const row of jsonData) {
          const importedContract = {
            organizationName: row['Название организации'] || '',
            contractNumber: row['Номер договора'] || '',
            contractDate: row['Дата договора'] || '',
            expirationDate: row['Срок действия'] || '',
            amount: String(row['Сумма (₽)'] || '0').replace(/[^\d.]/g, ''),
            sbis: row['СБИС'] || 'Нет',
            eis: row['ЕИС'] || 'Нет',
            workAct: row['Акт работ'] || 'Нет',
            contactPerson: row['Контактное лицо'] || '',
            contactPhone: row['Телефон'] || '',
          };

          const existingContract = contracts.find(
            c => c.organizationName === importedContract.organizationName && 
                 c.contractNumber === importedContract.contractNumber
          );

          if (existingContract) {
            await fetch(`${API_URL}?id=${existingContract.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...importedContract, id: existingContract.id }),
            });
            updated++;
          } else {
            await fetch(API_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(importedContract),
            });
            added++;
          }
        }

        await loadContracts();
        toast.success(`Импорт завершен: добавлено ${added}, обновлено ${updated}`);
      } catch (error) {
        toast.error('Ошибка при импорте файла');
        console.error(error);
      }
    };
    reader.readAsArrayBuffer(file);
    event.target.value = '';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar userRole={userRole} onNavigateUsers={() => navigate("/users")} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-4 lg:space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3">
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="lg:hidden">
                      <Icon name="Menu" size={20} />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-64 bg-gradient-to-b from-slate-800 via-slate-700 to-slate-800 text-white border-slate-600">
                    <SheetHeader>
                      <SheetTitle className="text-left">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                            <Icon name="FileText" size={22} className="text-primary-foreground" />
                          </div>
                          <div>
                            <h1 className="text-lg font-bold text-white">Интермед</h1>
                            <p className="text-xs text-white/60">Учет договоров</p>
                          </div>
                        </div>
                      </SheetTitle>
                    </SheetHeader>
                    <nav className="space-y-1 mt-8">
                      <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-medium">
                        <Icon name="LayoutDashboard" size={20} />
                        <span>Договоры</span>
                      </button>
                      {userRole === "admin" && (
                        <button 
                          onClick={() => {
                            navigate("/users");
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700 text-white/80 hover:text-white transition-all font-medium"
                        >
                          <Icon name="Users" size={20} />
                          <span>Пользователи</span>
                        </button>
                      )}
                    </nav>
                  </SheetContent>
                </Sheet>
                <div>
                  <h2 className="text-2xl lg:text-4xl font-bold tracking-tight">Управление договорами</h2>
                  <p className="text-muted-foreground mt-1 lg:mt-2 text-sm lg:text-base">Отслеживание сроков и контроль исполнения</p>
                </div>
              </div>
              <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
                <Button 
                  variant="outline" 
                  onClick={handleExportToExcel}
                  className="flex items-center gap-2 flex-1 sm:flex-none"
                  disabled={contracts.length === 0}
                >
                  <Icon name="Download" size={18} />
                  <span className="hidden sm:inline">Экспорт в Excel</span>
                  <span className="sm:hidden">Экспорт</span>
                </Button>

                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 flex-1 sm:flex-none"
                  onClick={() => document.getElementById('excel-import')?.click()}
                >
                  <Icon name="Upload" size={18} />
                  <span className="hidden sm:inline">Импорт из Excel</span>
                  <span className="sm:hidden">Импорт</span>
                </Button>
                <input
                  id="excel-import"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleImportFromExcel}
                  className="hidden"
                />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Icon name="User" size={18} />
                      <span className="hidden sm:inline">{userName}</span>
                      <Icon name="ChevronDown" size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="font-medium">{userName}</span>
                        <span className="text-xs text-muted-foreground">@{userLogin}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <Icon name="LogOut" size={16} className="mr-2" />
                      Выход
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2 w-full sm:w-auto">
                      <Icon name="Plus" size={18} />
                      <span>Добавить договор</span>
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </div>

            <StatsCards stats={stats} />

            <div className="mb-4">
              <div className="relative w-full">
                <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Поиск по организации или номеру договора..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-3 mb-4 overflow-x-auto pb-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <Icon name="List" size={16} />
                <span className="hidden sm:inline">Все ({stats.total})</span>
                <span className="sm:hidden">Все</span>
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('active')}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <Icon name="CheckCircle2" size={16} />
                <span className="hidden sm:inline">Активные ({stats.active})</span>
                <span className="sm:hidden">Активные</span>
              </Button>
              <Button
                variant={statusFilter === 'expired' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('expired')}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <Icon name="AlertCircle" size={16} />
                <span className="hidden sm:inline">Просроченные ({stats.expired})</span>
                <span className="sm:hidden">Просрочено</span>
              </Button>
            </div>

            <ContractsTable
              contracts={filteredContracts}
              isLoading={isLoading}
              userRole={userRole}
              onEdit={(contract) => {
                setEditingContract(contract);
                setIsEditDialogOpen(true);
              }}
              onDelete={handleDeleteContract}
              isExpired={isExpired}
              isExpiringSoon={isExpiringSoon}
            />
          </div>
        </main>
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
    </div>
  );
};

export default Index;