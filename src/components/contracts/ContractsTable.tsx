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
  totalAmount?: string;
  notes?: string;
  sbis: string;
  eis: string;
  workAct: string;
  contactPerson: string;
  contactPhone: string;
  contactPerson2?: string;
  contactPhone2?: string;
  contactPerson3?: string;
  contactPhone3?: string;
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
  onSort?: (field: 'organization' | 'contractNumber') => void;
  sortField?: 'organization' | 'contractNumber' | null;
  sortDirection?: 'asc' | 'desc';
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
  onSort,
  sortField,
  sortDirection,
}: ContractsTableProps) => {
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    if (dateString.includes('.')) return dateString;
    
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  return (
    <Card className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
      <CardContent className="p-0">
        <div className="hidden lg:block">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold w-[16%] text-center">
                  <button 
                    onClick={() => onSort?.('organization')} 
                    className="flex items-center gap-1 hover:text-foreground transition-colors w-full justify-center"
                  >
                    Название организации
                    {sortField === 'organization' && (
                      <Icon name={sortDirection === 'asc' ? 'ArrowUp' : 'ArrowDown'} size={14} />
                    )}
                  </button>
                </TableHead>
                <TableHead className="font-semibold w-[11%] text-center">
                  <button 
                    onClick={() => onSort?.('contractNumber')} 
                    className="flex items-center gap-1 hover:text-foreground transition-colors w-full justify-center"
                  >
                    Договор №, дата
                    {sortField === 'contractNumber' && (
                      <Icon name={sortDirection === 'asc' ? 'ArrowUp' : 'ArrowDown'} size={14} />
                    )}
                  </button>
                </TableHead>
                <TableHead className="font-semibold w-[9%] text-center">Срок действия</TableHead>
                <TableHead className="font-semibold w-[11%] text-center">Цена (₽)</TableHead>
                <TableHead className="font-semibold w-[7%] text-center">Стоимость (₽)</TableHead>
                <TableHead className="font-semibold w-[6%] text-center">СБИС</TableHead>
                <TableHead className="font-semibold w-[6%] text-center">ЕИС</TableHead>
                <TableHead className="font-semibold w-[6%] text-center">Акт вып-ых работ</TableHead>
                <TableHead className="font-semibold w-[14%] text-center">Контактное лицо</TableHead>
                <TableHead className="font-semibold w-[9%] text-center">Примечание</TableHead>
                {userRole !== "accountant" && <TableHead className="font-semibold w-[5%] text-center">Действия</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8">
                    <Icon name="Loader2" size={24} className="animate-spin mx-auto" />
                    <p className="mt-2 text-muted-foreground">Загрузка договоров...</p>
                  </TableCell>
                </TableRow>
              ) : contracts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8">
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
                    <TableCell className="font-medium text-xs text-center">{contract.organizationName}</TableCell>
                    <TableCell>
                      <div className="space-y-0.5 text-center">
                        <div className="font-medium text-xs">№ {contract.contractNumber}</div>
                        <div className="text-xs text-muted-foreground">{formatDate(contract.contractDate)}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="hidden print:inline">{formatDate(contract.expirationDate)}</span>
                      {isExpired(contract.expirationDate) ? (
                        <Badge
                          variant="destructive"
                          className="bg-destructive text-destructive-foreground print:hidden"
                        >
                          {formatDate(contract.expirationDate)}
                        </Badge>
                      ) : (
                        <span className="print:hidden">{formatDate(contract.expirationDate)}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="whitespace-pre-line text-xs break-words text-center">
                        {contract.amount}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-xs text-center">
                      {contract.totalAmount && (
                        <span>
                          {new Intl.NumberFormat('ru-RU', {
                            style: 'decimal',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          }).format(Number(contract.totalAmount) || 0)} ₽
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="hidden print:inline">{contract.sbis || 'Нет'}</span>
                      <Badge 
                        variant="outline"
                        className={`print:hidden text-xs ${
                          contract.sbis === 'Да' 
                            ? 'bg-green-100 text-green-800 border-green-300' 
                            : 'bg-red-500 text-white border-red-500'
                        }`}
                      >
                        {contract.sbis || 'Нет'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="hidden print:inline">{contract.eis || 'Нет'}</span>
                      <Badge 
                        variant="outline"
                        className={`print:hidden text-xs ${
                          contract.eis === 'Да' 
                            ? 'bg-green-100 text-green-800 border-green-300' 
                            : 'bg-red-500 text-white border-red-500'
                        }`}
                      >
                        {contract.eis || 'Нет'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="hidden print:inline">{contract.workAct || 'Нет'}</span>
                      <Badge 
                        variant="outline"
                        className={`print:hidden text-xs ${
                          contract.workAct === 'Да' 
                            ? 'bg-green-100 text-green-800 border-green-300' 
                            : 'bg-red-500 text-white border-red-500'
                        }`}
                      >
                        {contract.workAct || 'Нет'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1.5">
                        <div className="space-y-0.5">
                          <div className="text-xs">{contract.contactPerson}</div>
                          <div className="text-xs text-muted-foreground">{contract.contactPhone}</div>
                        </div>
                        {contract.contactPerson2 && (
                          <div className="space-y-0.5">
                            <div className="text-xs">{contract.contactPerson2}</div>
                            <div className="text-xs text-muted-foreground">{contract.contactPhone2}</div>
                          </div>
                        )}
                        {contract.contactPerson3 && (
                          <div className="space-y-0.5">
                            <div className="text-xs">{contract.contactPerson3}</div>
                            <div className="text-xs text-muted-foreground">{contract.contactPhone3}</div>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-xs break-words">{contract.notes || ''}</div>
                    </TableCell>
                    {userRole !== "accountant" && (
                      <TableCell>
                        <div className="flex flex-col gap-1 items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => onEdit(contract)}
                          >
                            <Icon name="Pencil" size={12} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => onDelete(contract.id)}
                          >
                            <Icon name="Trash2" size={12} />
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
                      <span className="text-sm text-muted-foreground">Цена:</span>
                      <span className="text-sm">{contract.amount}</span>
                    </div>
                    
                    {contract.totalAmount && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Стоимость:</span>
                        <span className="font-semibold">
                          {new Intl.NumberFormat('ru-RU', {
                            style: 'decimal',
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          }).format(Number(contract.totalAmount) || 0)} ₽
                        </span>
                      </div>
                    )}
                    
                    {contract.notes && (
                      <div className="pt-2 border-t">
                        <span className="text-sm text-muted-foreground">Примечание:</span>
                        <p className="font-bold text-sm mt-1">{contract.notes}</p>
                      </div>
                    )}

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

                    {(contract.contactPerson || contract.contactPhone || contract.contactPerson2 || contract.contactPerson3) && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-1">Контакты:</p>
                        {contract.contactPerson && (
                          <div className="mb-2">
                            <p className="text-sm">{contract.contactPerson}</p>
                            {contract.contactPhone && (
                              <p className="text-sm text-muted-foreground">{contract.contactPhone}</p>
                            )}
                          </div>
                        )}
                        {contract.contactPerson2 && (
                          <div className="mb-2">
                            <p className="text-sm">{contract.contactPerson2}</p>
                            {contract.contactPhone2 && (
                              <p className="text-sm text-muted-foreground">{contract.contactPhone2}</p>
                            )}
                          </div>
                        )}
                        {contract.contactPerson3 && (
                          <div>
                            <p className="text-sm">{contract.contactPerson3}</p>
                            {contract.contactPhone3 && (
                              <p className="text-sm text-muted-foreground">{contract.contactPhone3}</p>
                            )}
                          </div>
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