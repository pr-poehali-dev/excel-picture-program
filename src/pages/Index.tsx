import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
import Icon from "@/components/ui/icon";
import { toast } from "sonner";
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

  const isExpired = (expirationDate: string): boolean => {
    const [day, month, year] = expirationDate.split(".");
    const expDate = new Date(+year, +month - 1, +day);
    const today = new Date();
    return expDate < today;
  };

  const isExpiringSoon = (expirationDate: string): boolean => {
    const [day, month, year] = expirationDate.split(".");
    const expDate = new Date(+year, +month - 1, +day);
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

  const stats = {
    total: contracts.length,
    active: contracts.filter(c => !isExpired(c.expirationDate)).length,
    expired: contracts.filter(c => isExpired(c.expirationDate)).length,
    totalAmount: contracts.reduce((sum, c) => sum + parseFloat(c.amount.replace(/\s/g, "")), 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex">
        <Sidebar userRole={userRole} onNavigateUsers={() => navigate("/users")} />

        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-primary">Управление договорами</h2>
                <p className="text-muted-foreground mt-1">Отслеживание сроков и контроль исполнения</p>
              </div>
              <div className="flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Icon name="User" size={18} />
                      <span>{userName}</span>
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
                    <DropdownMenuItem onClick={() => toast.info("Раздел в разработке")}>
                      <Icon name="Settings" size={16} className="mr-2" />
                      Настройки
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <Icon name="LogOut" size={16} className="mr-2" />
                      Выход
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Icon name="Plus" size={18} />
                      Добавить договор
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </div>

            <StatsCards stats={stats} />

            <ContractsTable
              contracts={contracts}
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
