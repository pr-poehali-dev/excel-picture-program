import Icon from "@/components/ui/icon";
import { toast } from "sonner";

interface SidebarProps {
  userRole: string;
  onNavigateUsers: () => void;
}

const Sidebar = ({ userRole, onNavigateUsers }: SidebarProps) => {
  return (
    <aside className="w-64 min-h-screen bg-sidebar text-sidebar-foreground p-6">
      <div className="mb-8">
        <div className="flex justify-center mb-3">
          <img 
            src="https://cdn.poehali.dev/files/fbc1e769-5979-4ed3-9a22-471aabeb5904.png" 
            alt="Интермед" 
            className="w-28 h-28 object-contain"
          />
        </div>
        <h1 className="text-lg font-bold text-center">ИнтерМед-учет</h1>
        <p className="text-sm text-sidebar-foreground/70 mt-1 text-center">Система управления</p>
      </div>

      <nav className="space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80 transition-colors">
          <Icon name="LayoutDashboard" size={20} />
          <span>Договоры</span>
        </button>

        {userRole === "admin" && (
          <button 
            onClick={onNavigateUsers}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-sidebar-accent/50 text-sidebar-foreground transition-colors"
          >
            <Icon name="Users" size={20} />
            <span>Пользователи</span>
          </button>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;