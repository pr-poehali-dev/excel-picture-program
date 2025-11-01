import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Contract } from "./ContractsTable";

interface EditContractDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  contract: Contract | null;
  onContractChange: (contract: Contract | null) => void;
  onSubmit: () => void;
}

const EditContractDialog = ({
  isOpen,
  onOpenChange,
  contract,
  onContractChange,
  onSubmit,
}: EditContractDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактировать договор</DialogTitle>
          <DialogDescription>Измените данные договора</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-organizationName">Название организации *</Label>
            <Input
              id="edit-organizationName"
              value={contract?.organizationName || ""}
              onChange={(e) => onContractChange(contract ? { ...contract, organizationName: e.target.value } : null)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-contractNumber">Номер договора</Label>
            <Input
              id="edit-contractNumber"
              value={contract?.contractNumber || ""}
              onChange={(e) => onContractChange(contract ? { ...contract, contractNumber: e.target.value } : null)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-contractDate">Дата договора</Label>
            <Input
              id="edit-contractDate"
              value={contract?.contractDate || ""}
              onChange={(e) => onContractChange(contract ? { ...contract, contractDate: e.target.value } : null)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-expirationDate">Срок действия *</Label>
            <Input
              id="edit-expirationDate"
              value={contract?.expirationDate || ""}
              onChange={(e) => onContractChange(contract ? { ...contract, expirationDate: e.target.value } : null)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-amount">Сумма</Label>
            <Input
              id="edit-amount"
              value={contract?.amount || ""}
              onChange={(e) => onContractChange(contract ? { ...contract, amount: e.target.value } : null)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-sbis">СБИС</Label>
            <Input
              id="edit-sbis"
              value={contract?.sbis || ""}
              onChange={(e) => onContractChange(contract ? { ...contract, sbis: e.target.value } : null)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-eis">ЕИС</Label>
            <Input
              id="edit-eis"
              value={contract?.eis || ""}
              onChange={(e) => onContractChange(contract ? { ...contract, eis: e.target.value } : null)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-workAct">Акт выполненных работ</Label>
            <Input
              id="edit-workAct"
              value={contract?.workAct || ""}
              onChange={(e) => onContractChange(contract ? { ...contract, workAct: e.target.value } : null)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-contactPerson">Контактное лицо</Label>
            <Input
              id="edit-contactPerson"
              value={contract?.contactPerson || ""}
              onChange={(e) => onContractChange(contract ? { ...contract, contactPerson: e.target.value } : null)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-contactPhone">Телефон</Label>
            <Input
              id="edit-contactPhone"
              value={contract?.contactPhone || ""}
              onChange={(e) => onContractChange(contract ? { ...contract, contactPhone: e.target.value } : null)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={onSubmit}>Сохранить</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditContractDialog;
