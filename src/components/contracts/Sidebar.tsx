import Icon from "@/components/ui/icon";
import { toast } from "sonner";

interface SidebarProps {
  userRole: string;
  onNavigateUsers: () => void;
}

const Sidebar = ({ userRole, onNavigateUsers }: SidebarProps) => {
  return (
    <aside className="hidden lg:block w-64 min-h-screen bg-gradient-to-b from-slate-800 via-slate-700 to-slate-800 text-sidebar-foreground p-6 border-r border-sidebar-border">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Icon name="FileText" size={22} className="text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">Интермед</h1>
            <p className="text-xs text-sidebar-foreground/60">Учет договоров</p>
          </div>
        </div>
      </div>

      <nav className="space-y-1">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-medium">
          <Icon name="LayoutDashboard" size={20} />
          <span>Договоры</span>
        </button>

        {userRole === "admin" && (
          <button 
            onClick={onNavigateUsers}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/80 hover:text-sidebar-foreground transition-all font-medium"
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