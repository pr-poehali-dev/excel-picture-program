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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
              type="date"
              value={contract?.contractDate || ""}
              onChange={(e) => onContractChange(contract ? { ...contract, contractDate: e.target.value } : null)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-expirationDate">Срок действия *</Label>
            <Input
              id="edit-expirationDate"
              type="date"
              value={contract?.expirationDate || ""}
              onChange={(e) => onContractChange(contract ? { ...contract, expirationDate: e.target.value } : null)}
            />
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor="edit-amount">Цена (через / можно добавить 4 значения)</Label>
            <Input
              id="edit-amount"
              type="text"
              placeholder="Например: 1000 / 2000 / 3000 / 4000"
              value={contract?.amount || ""}
              onChange={(e) => onContractChange(contract ? { ...contract, amount: e.target.value } : null)}
            />
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor="edit-amountComment">Комментарий к цене</Label>
            <Textarea
              id="edit-amountComment"
              placeholder="Дополнительная информация о цене"
              value={contract?.amountComment || ""}
              onChange={(e) => onContractChange(contract ? { ...contract, amountComment: e.target.value } : null)}
              className="min-h-[60px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-totalAmount">Сумма договора (₽)</Label>
            <Input
              id="edit-totalAmount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={contract?.totalAmount || ""}
              onChange={(e) => onContractChange(contract ? { ...contract, totalAmount: e.target.value } : null)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-sbis">СБИС</Label>
            <Select
              value={contract?.sbis || "Нет"}
              onValueChange={(value) => onContractChange(contract ? { ...contract, sbis: value } : null)}
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
            <Label htmlFor="edit-eis">ЕИС</Label>
            <Select
              value={contract?.eis || "Нет"}
              onValueChange={(value) => onContractChange(contract ? { ...contract, eis: value } : null)}
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
            <Label htmlFor="edit-workAct">Акт выполненных работ</Label>
            <Select
              value={contract?.workAct || "Нет"}
              onValueChange={(value) => onContractChange(contract ? { ...contract, workAct: value } : null)}
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
          <div className="space-y-2 col-span-2">
            <Label htmlFor="edit-notes">Примечание</Label>
            <Textarea
              id="edit-notes"
              rows={3}
              value={contract?.notes || ""}
              onChange={(e) => onContractChange(contract ? { ...contract, notes: e.target.value } : null)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-contactPerson">Контактное лицо 1</Label>
            <Input
              id="edit-contactPerson"
              value={contract?.contactPerson || ""}
              onChange={(e) => onContractChange(contract ? { ...contract, contactPerson: e.target.value } : null)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-contactPhone">Телефон 1</Label>
            <Input
              id="edit-contactPhone"
              value={contract?.contactPhone || ""}
              onChange={(e) => onContractChange(contract ? { ...contract, contactPhone: e.target.value } : null)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-contactPerson2">Контактное лицо 2 (опционально)</Label>
            <Input
              id="edit-contactPerson2"
              value={contract?.contactPerson2 || ""}
              onChange={(e) => onContractChange(contract ? { ...contract, contactPerson2: e.target.value } : null)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-contactPhone2">Телефон 2 (опционально)</Label>
            <Input
              id="edit-contactPhone2"
              value={contract?.contactPhone2 || ""}
              onChange={(e) => onContractChange(contract ? { ...contract, contactPhone2: e.target.value } : null)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-contactPerson3">Контактное лицо 3 (опционально)</Label>
            <Input
              id="edit-contactPerson3"
              value={contract?.contactPerson3 || ""}
              onChange={(e) => onContractChange(contract ? { ...contract, contactPerson3: e.target.value } : null)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-contactPhone3">Телефон 3 (опционально)</Label>
            <Input
              id="edit-contactPhone3"
              value={contract?.contactPhone3 || ""}
              onChange={(e) => onContractChange(contract ? { ...contract, contactPhone3: e.target.value } : null)}
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