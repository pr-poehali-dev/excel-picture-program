import { Card, CardContent } from "@/components/ui/card";
import Icon from "@/components/ui/icon";

interface StatsCardsProps {
  stats: {
    total: number;
    active: number;
    expired: number;
    totalAmount: number;
  };
}

const StatsCards = ({ stats }: StatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="animate-fade-in border-none shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Всего договоров</p>
              <p className="text-3xl font-bold mt-2">{stats.total}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center">
              <Icon name="FileText" size={26} className="text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="animate-fade-in border-none shadow-sm hover:shadow-md transition-shadow" style={{ animationDelay: "0.1s" }}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Активных</p>
              <p className="text-3xl font-bold mt-2 text-green-600">{stats.active}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl flex items-center justify-center">
              <Icon name="CheckCircle2" size={26} className="text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="animate-fade-in border-none shadow-sm hover:shadow-md transition-shadow" style={{ animationDelay: "0.2s" }}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Просроченных</p>
              <p className="text-3xl font-bold mt-2 text-destructive">{stats.expired}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-destructive/10 to-destructive/5 rounded-xl flex items-center justify-center">
              <Icon name="AlertCircle" size={26} className="text-destructive" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="animate-fade-in border-none shadow-sm hover:shadow-md transition-shadow" style={{ animationDelay: "0.3s" }}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Общая сумма</p>
              <p className="text-2xl font-bold mt-2">
                {stats.totalAmount.toLocaleString("ru-RU")} ₽
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">₽</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;