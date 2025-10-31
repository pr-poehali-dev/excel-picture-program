import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { toast } from "sonner";

interface Contract {
  id: number;
  organizationName: string;
  contractNumber: string;
  contractDate: string;
  expirationDate: string;
  amount: string;
  sbis: string;
  eis: string;
  workAct: string;
  contactPerson: string;
  contactPhone: string;
}

const Index = () => {
  const [contracts, setContracts] = useState<Contract[]>([
    {
      id: 1,
      organizationName: 'ООО "Техносервис"',
      contractNumber: "ДГ-2024-001",
      contractDate: "15.01.2024",
      expirationDate: "15.01.2025",
      amount: "1 250 000",
      sbis: "Отправлен",
      eis: "Зарегистрирован",
      workAct: "Подписан",
      contactPerson: "Иванов И.И.",
      contactPhone: "+7 (495) 123-45-67",
    },
    {
      id: 2,
      organizationName: 'АО "СтройКомплекс"',
      contractNumber: "ДГ-2023-045",
      contractDate: "10.03.2023",
      expirationDate: "10.03.2024",
      amount: "3 500 000",
      sbis: "Отправлен",
      eis: "Зарегистрирован",
      workAct: "Ожидает",
      contactPerson: "Петров П.П.",
      contactPhone: "+7 (495) 234-56-78",
    },
    {
      id: 3,
      organizationName: 'ИП "Логистик Про"',
      contractNumber: "ДГ-2024-012",
      contractDate: "20.02.2024",
      expirationDate: "20.08.2025",
      amount: "850 000",
      sbis: "Подготовлен",
      eis: "В процессе",
      workAct: "Не требуется",
      contactPerson: "Сидорова А.В.",
      contactPhone: "+7 (495) 345-67-89",
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newContract, setNewContract] = useState<Partial<Contract>>({});

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

  const handleAddContract = () => {
    if (!newContract.organizationName || !newContract.expirationDate) {
      toast.error("Заполните обязательные поля");
      return;
    }

    const contract: Contract = {
      id: contracts.length + 1,
      organizationName: newContract.organizationName || "",
      contractNumber: newContract.contractNumber || "",
      contractDate: newContract.contractDate || "",
      expirationDate: newContract.expirationDate || "",
      amount: newContract.amount || "",
      sbis: newContract.sbis || "",
      eis: newContract.eis || "",
      workAct: newContract.workAct || "",
      contactPerson: newContract.contactPerson || "",
      contactPhone: newContract.contactPhone || "",
    };

    setContracts([...contracts, contract]);
    setNewContract({});
    setIsDialogOpen(false);
    toast.success("Договор успешно добавлен");
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
        <aside className="w-64 min-h-screen bg-sidebar text-sidebar-foreground p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Icon name="FileText" size={28} />
              Договоры
            </h1>
            <p className="text-sm text-sidebar-foreground/70 mt-1">Система управления</p>
          </div>

          <nav className="space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80 transition-colors">
              <Icon name="LayoutDashboard" size={20} />
              <span>Dashboard</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-sidebar-accent/50 text-sidebar-foreground transition-colors">
              <Icon name="Building2" size={20} />
              <span>Организации</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-sidebar-accent/50 text-sidebar-foreground transition-colors">
              <Icon name="Users" size={20} />
              <span>Пользователи</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-sidebar-accent/50 text-sidebar-foreground transition-colors">
              <Icon name="Bell" size={20} />
              <span>Уведомления</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-sidebar-accent/50 text-sidebar-foreground transition-colors">
              <Icon name="Settings" size={20} />
              <span>Настройки</span>
            </button>
          </nav>
        </aside>

        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-primary">Управление договорами</h2>
                <p className="text-muted-foreground mt-1">Отслеживание сроков и контроль исполнения</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Icon name="Plus" size={18} />
                    Добавить договор
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Новый договор</DialogTitle>
                    <DialogDescription>Заполните информацию о договоре</DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="orgName">Название организации *</Label>
                      <Input
                        id="orgName"
                        value={newContract.organizationName || ""}
                        onChange={(e) => setNewContract({ ...newContract, organizationName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contractNum">Договор №</Label>
                      <Input
                        id="contractNum"
                        value={newContract.contractNumber || ""}
                        onChange={(e) => setNewContract({ ...newContract, contractNumber: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contractDate">Дата договора</Label>
                      <Input
                        id="contractDate"
                        type="date"
                        value={newContract.contractDate || ""}
                        onChange={(e) => setNewContract({ ...newContract, contractDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expirationDate">Срок действия *</Label>
                      <Input
                        id="expirationDate"
                        type="date"
                        value={newContract.expirationDate || ""}
                        onChange={(e) => setNewContract({ ...newContract, expirationDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Сумма (₽)</Label>
                      <Input
                        id="amount"
                        value={newContract.amount || ""}
                        onChange={(e) => setNewContract({ ...newContract, amount: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sbis">СБИС</Label>
                      <Input
                        id="sbis"
                        value={newContract.sbis || ""}
                        onChange={(e) => setNewContract({ ...newContract, sbis: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="eis">ЕИС</Label>
                      <Input
                        id="eis"
                        value={newContract.eis || ""}
                        onChange={(e) => setNewContract({ ...newContract, eis: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="workAct">Акт выполненных работ</Label>
                      <Input
                        id="workAct"
                        value={newContract.workAct || ""}
                        onChange={(e) => setNewContract({ ...newContract, workAct: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPerson">Контактное лицо</Label>
                      <Input
                        id="contactPerson"
                        value={newContract.contactPerson || ""}
                        onChange={(e) => setNewContract({ ...newContract, contactPerson: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Телефон</Label>
                      <Input
                        id="contactPhone"
                        value={newContract.contactPhone || ""}
                        onChange={(e) => setNewContract({ ...newContract, contactPhone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Отмена
                    </Button>
                    <Button onClick={handleAddContract}>Добавить</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="animate-fade-in">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Всего договоров</p>
                      <p className="text-3xl font-bold mt-2">{stats.total}</p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon name="FileText" size={24} className="text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Активных</p>
                      <p className="text-3xl font-bold mt-2 text-accent">{stats.active}</p>
                    </div>
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                      <Icon name="CheckCircle2" size={24} className="text-accent" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Просроченных</p>
                      <p className="text-3xl font-bold mt-2 text-destructive">{stats.expired}</p>
                    </div>
                    <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                      <Icon name="AlertCircle" size={24} className="text-destructive" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Общая сумма</p>
                      <p className="text-2xl font-bold mt-2">
                        {stats.totalAmount.toLocaleString("ru-RU")} ₽
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon name="DollarSign" size={24} className="text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">№</TableHead>
                        <TableHead className="font-semibold">Название организации</TableHead>
                        <TableHead className="font-semibold">Договор №, дата</TableHead>
                        <TableHead className="font-semibold">Срок действия</TableHead>
                        <TableHead className="font-semibold">Сумма (₽)</TableHead>
                        <TableHead className="font-semibold">СБИС</TableHead>
                        <TableHead className="font-semibold">ЕИС</TableHead>
                        <TableHead className="font-semibold">Акт работ</TableHead>
                        <TableHead className="font-semibold">Контактное лицо</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contracts.map((contract, index) => (
                        <TableRow
                          key={contract.id}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell className="font-medium">{contract.organizationName}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{contract.contractNumber}</div>
                              <div className="text-sm text-muted-foreground">{contract.contractDate}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                isExpired(contract.expirationDate)
                                  ? "destructive"
                                  : isExpiringSoon(contract.expirationDate)
                                  ? "outline"
                                  : "default"
                              }
                              className={
                                isExpired(contract.expirationDate)
                                  ? "bg-destructive text-destructive-foreground"
                                  : isExpiringSoon(contract.expirationDate)
                                  ? "border-orange-500 text-orange-700"
                                  : "bg-accent text-accent-foreground"
                              }
                            >
                              {contract.expirationDate}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold">{contract.amount}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{contract.sbis}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{contract.eis}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{contract.workAct}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm">{contract.contactPerson}</div>
                              <div className="text-xs text-muted-foreground">{contract.contactPhone}</div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
