import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import Sidebar from "@/components/contracts/Sidebar";
import StatsCards from "@/components/contracts/StatsCards";
import ContractsTable, { Contract } from "@/components/contracts/ContractsTable";
import AddContractDialog from "@/components/contracts/AddContractDialog";
import EditContractDialog from "@/components/contracts/EditContractDialog";
import Header from "@/components/contracts/Header";
import ContractFilters from "@/components/contracts/ContractFilters";
import { isExpired } from "@/components/contracts/ContractUtils";
import { exportContractsToExcel } from "@/components/contracts/ExcelExport";

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
    exportContractsToExcel(contracts);
    toast.success("Файл успешно экспортирован");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header 
        userName={userName}
        userRole={userRole}
        userLogin={userLogin}
        onLogout={handleLogout}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <div className="flex flex-1">
        <aside className="hidden lg:block w-64 border-r bg-card">
          <Sidebar userRole={userRole} />
        </aside>

        <main className="flex-1 overflow-x-hidden">
          <div className="container mx-auto p-4 lg:p-6 space-y-6">
            <StatsCards stats={stats} />

            <ContractFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              onAddContract={() => setIsDialogOpen(true)}
              onExportToExcel={handleExportToExcel}
              userRole={userRole}
            />

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
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
