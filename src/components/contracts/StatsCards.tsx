import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface StatsCardsProps {
  stats: {
    total: number;
    active: number;
    expired: number;
    totalAmount: number;
  };
  onSync?: () => void;
}

const StatsCards = ({ stats, onSync }: StatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 print:hidden">
      <Card className="animate-fade-in border-none shadow-sm hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-blue-50 to-white">
        <CardContent className="p-4 lg:p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Всего договоров</p>
              <p className="text-2xl lg:text-3xl font-bold mt-2">{stats.total}</p>
            </div>
            <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="FileText" size={26} className="text-primary" />
            </div>
          </div>
          <Button 
            onClick={onSync}
            variant="outline" 
            size="sm" 
            className="w-full gap-2 bg-white hover:bg-blue-50 border-blue-200"
          >
            <Icon name="RefreshCw" size={16} />
            Синхронизировать
          </Button>
        </CardContent>
      </Card>

      <Card className="animate-fade-in border-none shadow-sm hover:shadow-md transition-shadow" style={{ animationDelay: "0.1s" }}>
        <CardContent className="p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Активных</p>
              <p className="text-2xl lg:text-3xl font-bold mt-2 text-green-600">{stats.active}</p>
            </div>
            <div className="w-14 h-14 bg-green-50 rounded-lg flex items-center justify-center">
              <Icon name="CheckCircle2" size={26} className="text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="animate-fade-in border-none shadow-sm hover:shadow-md transition-shadow" style={{ animationDelay: "0.2s" }}>
        <CardContent className="p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Просроченных</p>
              <p className="text-2xl lg:text-3xl font-bold mt-2 text-destructive">{stats.expired}</p>
            </div>
            <div className="w-14 h-14 bg-destructive/10 rounded-lg flex items-center justify-center">
              <Icon name="AlertCircle" size={26} className="text-destructive" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;