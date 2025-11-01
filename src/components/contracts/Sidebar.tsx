import Icon from "@/components/ui/icon";
import { toast } from "sonner";

interface SidebarProps {
  userRole: string;
  onNavigateUsers: () => void;
}

const Sidebar = ({ userRole, onNavigateUsers }: SidebarProps) => {
  return (
    <aside className="w-72 min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50 text-sidebar-foreground p-6 border-r border-sidebar-border">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Icon name="Sparkles" size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Интермед</h1>
            <p className="text-xs text-muted-foreground">Учет договоров</p>
          </div>
        </div>
      </div>

      <nav className="space-y-3">
        <button className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:shadow-lg hover:shadow-purple-500/40 transition-all font-medium">
          <Icon name="LayoutDashboard" size={20} />
          <span>Договоры</span>
        </button>

        {userRole === "admin" && (
          <button 
            onClick={onNavigateUsers}
            className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl hover:bg-purple-100 text-sidebar-foreground/70 hover:text-sidebar-foreground transition-all font-medium"
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