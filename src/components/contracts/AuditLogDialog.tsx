import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";
import { toast } from "sonner";

interface AuditLog {
  id: number;
  action: string;
  userRole: string;
  contractId: number | null;
  contractData: any;
  createdAt: string;
}

interface AuditLogDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onRestore: () => void;
}

const AUDIT_API_URL = "https://functions.poehali.dev/333e409e-d6ef-4c99-845e-d06af76a1e20";

const AuditLogDialog = ({ isOpen, onOpenChange, onRestore }: AuditLogDialogProps) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(AUDIT_API_URL);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      }
    } catch (error) {
      toast.error("Ошибка загрузки логов");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadLogs();
    }
  }, [isOpen]);

  const handleRestore = async (logId: number) => {
    try {
      const response = await fetch(AUDIT_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Role": localStorage.getItem("userRole") || "admin",
        },
        body: JSON.stringify({ logId }),
      });

      if (response.ok) {
        toast.success("Договор успешно восстановлен");
        onRestore();
        loadLogs();
      } else {
        toast.error("Ошибка при восстановлении");
      }
    } catch (error) {
      toast.error("Ошибка связи с сервером");
      console.error(error);
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "CREATE": return "Создание";
      case "UPDATE": return "Изменение";
      case "DELETE": return "Удаление";
      case "RESTORE": return "Восстановление";
      default: return action;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin": return "Администратор";
      case "accountant": return "Бухгалтер";
      default: return role;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Журнал действий пользователей</DialogTitle>
          <DialogDescription>
            Последние 100 действий с договорами
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Icon name="Loader2" size={32} className="animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-2">
            {logs.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                Нет записей в журнале
              </p>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`
                          px-2 py-1 rounded text-xs font-medium
                          ${log.action === 'CREATE' ? 'bg-green-100 text-green-800' : ''}
                          ${log.action === 'UPDATE' ? 'bg-blue-100 text-blue-800' : ''}
                          ${log.action === 'DELETE' ? 'bg-red-100 text-red-800' : ''}
                          ${log.action === 'RESTORE' ? 'bg-purple-100 text-purple-800' : ''}
                        `}>
                          {getActionLabel(log.action)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {getRoleLabel(log.userRole)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(log.createdAt)}
                        </span>
                      </div>
                      
                      {log.contractData && (
                        <div className="text-sm mt-2">
                          <p className="font-medium">
                            {log.contractData.organizationName}
                          </p>
                          <p className="text-muted-foreground">
                            Договор №{log.contractData.contractNumber} от {log.contractData.contractDate}
                          </p>
                        </div>
                      )}
                    </div>

                    {log.action === 'DELETE' && log.contractData && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRestore(log.id)}
                      >
                        <Icon name="RotateCcw" size={16} className="mr-2" />
                        Восстановить
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuditLogDialog;
