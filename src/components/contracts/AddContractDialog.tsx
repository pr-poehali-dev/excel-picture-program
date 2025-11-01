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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Contract } from "./ContractsTable";

interface AddContractDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newContract: Partial<Contract>;
  onContractChange: (contract: Partial<Contract>) => void;
  onSubmit: () => void;
}

const AddContractDialog = ({
  isOpen,
  onOpenChange,
  newContract,
  onContractChange,
  onSubmit,
}: AddContractDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Добавить новый договор</DialogTitle>
          <DialogDescription>Заполните информацию о договоре</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="organizationName">Название организации *</Label>
            <Input
              id="organizationName"
              value={newContract.organizationName || ""}
              onChange={(e) => onContractChange({ ...newContract, organizationName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contractNumber">Номер договора</Label>
            <Input
              id="contractNumber"
              value={newContract.contractNumber || ""}
              onChange={(e) => onContractChange({ ...newContract, contractNumber: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contractDate">Дата договора</Label>
            <Input
              id="contractDate"
              type="date"
              value={newContract.contractDate || ""}
              onChange={(e) => onContractChange({ ...newContract, contractDate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expirationDate">Срок действия *</Label>
            <Input
              id="expirationDate"
              type="date"
              value={newContract.expirationDate || ""}
              onChange={(e) => onContractChange({ ...newContract, expirationDate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Сумма (₽)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={newContract.amount || ""}
              onChange={(e) => onContractChange({ ...newContract, amount: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sbis">СБИС</Label>
            <Select
              value={newContract.sbis || "Нет"}
              onValueChange={(value) => onContractChange({ ...newContract, sbis: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Да">Да</SelectItem>
                <SelectItem value="Нет">Нет</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="eis">ЕИС</Label>
            <Select
              value={newContract.eis || "Нет"}
              onValueChange={(value) => onContractChange({ ...newContract, eis: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Да">Да</SelectItem>
                <SelectItem value="Нет">Нет</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="workAct">Акт выполненных работ</Label>
            <Select
              value={newContract.workAct || "Нет"}
              onValueChange={(value) => onContractChange({ ...newContract, workAct: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Да">Да</SelectItem>
                <SelectItem value="Нет">Нет</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactPerson">Контактное лицо</Label>
            <Input
              id="contactPerson"
              value={newContract.contactPerson || ""}
              onChange={(e) => onContractChange({ ...newContract, contactPerson: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactPhone">Телефон</Label>
            <Input
              id="contactPhone"
              value={newContract.contactPhone || ""}
              onChange={(e) => onContractChange({ ...newContract, contactPhone: e.target.value })}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={onSubmit}>Добавить</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddContractDialog;