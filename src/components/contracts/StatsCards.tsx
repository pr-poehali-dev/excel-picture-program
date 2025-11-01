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
      <Card className="animate-fade-in border-none bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-xl hover:shadow-purple-500/30 transition-all hover:-translate-y-1">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-100 tracking-wide">Всего договоров</p>
              <p className="text-4xl font-bold mt-3">{stats.total}</p>
            </div>
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Icon name="FileText" size={28} className="text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="animate-fade-in border-none bg-gradient-to-br from-emerald-500 to-green-600 text-white hover:shadow-xl hover:shadow-emerald-500/30 transition-all hover:-translate-y-1" style={{ animationDelay: "0.1s" }}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-100 tracking-wide">Активных</p>
              <p className="text-4xl font-bold mt-3">{stats.active}</p>
            </div>
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Icon name="CheckCircle2" size={28} className="text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="animate-fade-in border-none bg-gradient-to-br from-orange-500 to-red-500 text-white hover:shadow-xl hover:shadow-orange-500/30 transition-all hover:-translate-y-1" style={{ animationDelay: "0.2s" }}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-100 tracking-wide">Просроченных</p>
              <p className="text-4xl font-bold mt-3">{stats.expired}</p>
            </div>
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Icon name="AlertCircle" size={28} className="text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="animate-fade-in border-none bg-gradient-to-br from-pink-500 to-rose-600 text-white hover:shadow-xl hover:shadow-pink-500/30 transition-all hover:-translate-y-1" style={{ animationDelay: "0.3s" }}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-pink-100 tracking-wide">Общая сумма</p>
              <p className="text-3xl font-bold mt-3">
                {stats.totalAmount.toLocaleString("ru-RU")} ₽
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <span className="text-3xl font-bold">₽</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;