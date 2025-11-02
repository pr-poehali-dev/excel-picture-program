import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface ContractFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: 'all' | 'active' | 'expired';
  setStatusFilter: (filter: 'all' | 'active' | 'expired') => void;
  onAddContract: () => void;
  onExportToExcel: () => void;
  userRole: string;
}

const ContractFilters = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  onAddContract,
  onExportToExcel,
  userRole
}: ContractFiltersProps) => {
  return (
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
            onClick={onExportToExcel}
          >
            <Icon name="Download" size={18} className="mr-2" />
            Экспорт
          </Button>
          {userRole !== "accountant" && (
            <Button onClick={onAddContract} size="sm">
              <Icon name="Plus" size={18} className="mr-2" />
              Добавить
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractFilters;
