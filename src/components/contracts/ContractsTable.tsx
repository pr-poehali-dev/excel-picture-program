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
}

const ContractsTable = ({
  contracts,
  isLoading,
  userRole,
  onEdit,
  onDelete,
  isExpired,
  isExpiringSoon,
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
                          className="bg-destructive text-destructive-foreground"
                        >
                          {formatDate(contract.expirationDate)}
                        </Badge>
                      ) : (
                        <span>{formatDate(contract.expirationDate)}</span>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold min-w-[140px]">
                      {new Intl.NumberFormat('ru-RU', {
                        style: 'decimal',
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      }).format(Number(contract.amount) || 0)} ₽
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={
                          contract.sbis === 'Да' 
                            ? 'bg-green-100 text-green-800 border-green-300' 
                            : 'bg-red-100 text-red-800 border-red-300'
                        }
                      >
                        {contract.sbis}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={
                          contract.eis === 'Да' 
                            ? 'bg-green-100 text-green-800 border-green-300' 
                            : 'bg-red-100 text-red-800 border-red-300'
                        }
                      >
                        {contract.eis}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={
                          contract.workAct === 'Да' 
                            ? 'bg-green-100 text-green-800 border-green-300' 
                            : 'bg-red-100 text-red-800 border-red-300'
                        }
                      >
                        {contract.workAct}
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
      </CardContent>
    </Card>
  );
};

export default ContractsTable;