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
import Icon from "@/components/ui/icon";

export interface Contract {
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

interface ContractsTableProps {
  contracts: Contract[];
  isLoading: boolean;
  userRole: string;
  onEdit: (contract: Contract) => void;
  onDelete: (id: number) => void;
  isExpired: (date: string) => boolean;
  isExpiringSoon: (date: string) => boolean;
  onAddClick?: () => void;
}

const ContractsTable = ({
  contracts,
  isLoading,
  userRole,
  onEdit,
  onDelete,
  isExpired,
  isExpiringSoon,
  onAddClick,
}: ContractsTableProps) => {
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    
    let date: Date;
    if (dateString.includes('.')) {
      const [day, month, year] = dateString.split(".");
      date = new Date(+year, +month - 1, +day);
    } else if (dateString.includes('-')) {
      date = new Date(dateString);
    } else {
      return dateString;
    }
    
    const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 
                    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  return (
    <Card className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
      <CardContent className="p-0">
        <div className="hidden lg:block overflow-x-auto">
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
                <TableHead className="font-semibold">Акт выполненных работ</TableHead>
                <TableHead className="font-semibold">Контактное лицо</TableHead>
                {userRole !== "accountant" && <TableHead className="font-semibold">Действия</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    <Icon name="Loader2" size={24} className="animate-spin mx-auto" />
                    <p className="mt-2 text-muted-foreground">Загрузка договоров...</p>
                  </TableCell>
                </TableRow>
              ) : contracts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    <Icon name="FileText" size={48} className="mx-auto text-muted-foreground/50" />
                    <p className="mt-2 text-muted-foreground">Договоры не найдены</p>
                    <p className="text-sm text-muted-foreground">Добавьте первый договор</p>
                  </TableCell>
                </TableRow>
              ) : (
                contracts.map((contract, index) => (
                  <TableRow
                    key={contract.id}
                    className={`hover:bg-muted/30 transition-colors ${
                      isExpired(contract.expirationDate) ? 'bg-red-50' : ''
                    }`}
                  >
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="font-medium">{contract.organizationName}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">№ {contract.contractNumber}</div>
                        <div className="text-sm text-muted-foreground">{contract.contractDate}</div>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[160px]">
                      {isExpired(contract.expirationDate) ? (
                        <Badge
                          variant="destructive"
                          className="bg-destructive text-destructive-foreground print:bg-transparent print:text-foreground print:border-none print:p-0"
                        >
                          {contract.expirationDate}
                        </Badge>
                      ) : (
                        <span>{contract.expirationDate}</span>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold min-w-[140px]">
                      <span className="print:hidden">
                        {new Intl.NumberFormat('ru-RU', {
                          style: 'decimal',
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        }).format(Number(contract.amount) || 0)} ₽
                      </span>
                      <span className="hidden print:inline">{contract.amount}</span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={`print:bg-transparent print:text-foreground print:border-none print:p-0 ${
                          contract.sbis === 'Да' 
                            ? 'bg-green-100 text-green-800 border-green-300' 
                            : 'bg-red-500 text-white border-red-500'
                        }`}
                      >
                        {contract.sbis || 'Нет'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={`print:bg-transparent print:text-foreground print:border-none print:p-0 ${
                          contract.eis === 'Да' 
                            ? 'bg-green-100 text-green-800 border-green-300' 
                            : 'bg-red-500 text-white border-red-500'
                        }`}
                      >
                        {contract.eis || 'Нет'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={`print:bg-transparent print:text-foreground print:border-none print:p-0 ${
                          contract.workAct === 'Да' 
                            ? 'bg-green-100 text-green-800 border-green-300' 
                            : 'bg-red-500 text-white border-red-500'
                        }`}
                      >
                        {contract.workAct || 'Нет'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">{contract.contactPerson}</div>
                        <div className="text-xs text-muted-foreground">{contract.contactPhone}</div>
                      </div>
                    </TableCell>
                    {userRole !== "accountant" && (
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(contract)}
                          >
                            <Icon name="Pencil" size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(contract.id)}
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="lg:hidden">
          {isLoading ? (
            <div className="text-center py-12">
              <Icon name="Loader2" size={32} className="animate-spin mx-auto" />
              <p className="mt-3 text-muted-foreground">Загрузка договоров...</p>
            </div>
          ) : contracts.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="FileText" size={48} className="mx-auto text-muted-foreground/50" />
              <p className="mt-3 text-muted-foreground">Договоры не найдены</p>
              <p className="text-sm text-muted-foreground">Добавьте первый договор</p>
            </div>
          ) : (
            <div className="divide-y">
              {contracts.map((contract, index) => (
                <div
                  key={contract.id}
                  className={`p-4 ${isExpired(contract.expirationDate) ? 'bg-red-50' : ''}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-muted-foreground">№{index + 1}</span>
                        <h3 className="font-semibold text-base">{contract.organizationName}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Договор № {contract.contractNumber}
                      </p>
                      <p className="text-xs text-muted-foreground">{contract.contractDate}</p>
                    </div>
                    {userRole !== "accountant" && (
                      <div className="flex gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(contract)}
                        >
                          <Icon name="Pencil" size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(contract.id)}
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Срок действия:</span>
                      {isExpired(contract.expirationDate) ? (
                        <Badge
                          variant="destructive"
                          className="bg-destructive text-destructive-foreground"
                        >
                          {formatDate(contract.expirationDate)}
                        </Badge>
                      ) : (
                        <span className="text-sm font-medium">{formatDate(contract.expirationDate)}</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Сумма:</span>
                      <span className="font-semibold">
                        {new Intl.NumberFormat('ru-RU', {
                          style: 'decimal',
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        }).format(Number(contract.amount) || 0)} ₽
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">СБИС</p>
                        <Badge 
                          variant="outline"
                          className={`text-xs ${
                            contract.sbis === 'Да' 
                              ? 'bg-green-100 text-green-800 border-green-300' 
                              : 'bg-red-500 text-white border-red-500'
                          }`}
                        >
                          {contract.sbis || 'Нет'}
                        </Badge>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">ЕИС</p>
                        <Badge 
                          variant="outline"
                          className={`text-xs ${
                            contract.eis === 'Да' 
                              ? 'bg-green-100 text-green-800 border-green-300' 
                              : 'bg-red-500 text-white border-red-500'
                          }`}
                        >
                          {contract.eis || 'Нет'}
                        </Badge>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Акт</p>
                        <Badge 
                          variant="outline"
                          className={`text-xs ${
                            contract.workAct === 'Да' 
                              ? 'bg-green-100 text-green-800 border-green-300' 
                              : 'bg-red-500 text-white border-red-500'
                          }`}
                        >
                          {contract.workAct || 'Нет'}
                        </Badge>
                      </div>
                    </div>

                    {(contract.contactPerson || contract.contactPhone) && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-1">Контакты:</p>
                        {contract.contactPerson && (
                          <p className="text-sm">{contract.contactPerson}</p>
                        )}
                        {contract.contactPhone && (
                          <p className="text-sm text-muted-foreground">{contract.contactPhone}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ContractsTable;