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
    toast.success("Файл успешно экспортирован");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 bg-card border-b shadow-sm">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Icon name="Menu" size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <SheetHeader className="p-6 border-b">
                  <SheetTitle>Меню</SheetTitle>
                </SheetHeader>
                <Sidebar userRole={userRole} />
              </SheetContent>
            </Sheet>

            <h1 className="text-xl font-bold">Договоры</h1>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Icon name="User" size={20} />
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
      </header>

      <div className="flex flex-1">
        <aside className="hidden lg:block w-64 border-r bg-card">
          <Sidebar userRole={userRole} />
        </aside>

        <main className="flex-1 overflow-x-hidden">
          <div className="container mx-auto p-4 lg:p-6 space-y-6">
            <StatsCards stats={stats} />

            <div className="bg-card rounded-lg border p-4 mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Поиск по организации или номеру договора..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

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

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportToExcel}
                  >
                    <Icon name="Download" size={18} className="mr-2" />
                    Экспорт
                  </Button>
                  {userRole !== "accountant" && (
                    <Button onClick={() => setIsDialogOpen(true)} size="sm">
                      <Icon name="Plus" size={18} className="mr-2" />
                      Добавить
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <div />
              </DialogTrigger>
              <AddContractDialog
                newContract={newContract}
                setNewContract={setNewContract}
                onSubmit={handleAddContract}
                onCancel={() => {
                  setIsDialogOpen(false);
                  setNewContract({});
                }}
              />
            </Dialog>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <div />
              </DialogTrigger>
              <EditContractDialog
                editingContract={editingContract}
                setEditingContract={setEditingContract}
                onSubmit={handleEditContract}
                onCancel={() => {
                  setIsEditDialogOpen(false);
                  setEditingContract(null);
                }}
              />
            </Dialog>

            <ContractsTable
              contracts={filteredContracts}
              isLoading={isLoading}
              onEdit={(contract) => {
                setEditingContract(contract);
                setIsEditDialogOpen(true);
              }}
              onDelete={handleDeleteContract}
              userRole={userRole}
              isExpired={isExpired}
              isExpiringSoon={isExpiringSoon}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
