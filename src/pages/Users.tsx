import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { toast } from "sonner";
import { getUsers, updateUsers, isAdmin, User } from "@/utils/users";

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<Partial<User>>({
    role: "manager",
  });

  useEffect(() => {
    if (!isAdmin()) {
      toast.error("Доступ запрещен");
      navigate("/");
      return;
    }
    loadUsers();
  }, [navigate]);

  const loadUsers = () => {
    setUsers(getUsers());
  };

  const handleAddUser = () => {
    if (!newUser.login || !newUser.password || !newUser.name) {
      toast.error("Заполните все поля");
      return;
    }

    const existingUsers = getUsers();
    const exists = existingUsers.find((u) => u.login === newUser.login);
    
    if (exists) {
      toast.error("Пользователь с таким логином уже существует");
      return;
    }

    const user: User = {
      login: newUser.login,
      password: newUser.password,
      name: newUser.name,
      role: newUser.role as "admin" | "manager" | "accountant",
    };

    const updatedUsers = [...existingUsers, user];
    updateUsers(updatedUsers);
    loadUsers();
    setNewUser({ role: "manager" });
    setIsAddDialogOpen(false);
    toast.success("Пользователь добавлен");
  };

  const handleEditUser = () => {
    if (!editingUser) return;

    const existingUsers = getUsers();
    const updatedUsers = existingUsers.map((u) =>
      u.login === editingUser.login ? editingUser : u
    );
    
    updateUsers(updatedUsers);
    loadUsers();
    setEditingUser(null);
    setIsEditDialogOpen(false);
    toast.success("Данные пользователя обновлены");
  };

  const handleDeleteUser = (login: string) => {
    if (login === "admhub") {
      toast.error("Нельзя удалить главного администратора");
      return;
    }

    const existingUsers = getUsers();
    const updatedUsers = existingUsers.filter((u) => u.login !== login);
    updateUsers(updatedUsers);
    loadUsers();
    toast.success("Пользователь удален");
  };

  const openEditDialog = (user: User) => {
    setEditingUser({ ...user });
    setIsEditDialogOpen(true);
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case "admin":
        return "Администратор";
      case "manager":
        return "Менеджер";
      case "accountant":
        return "Бухгалтер";
      default:
        return role;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "default";
      case "manager":
        return "outline";
      case "accountant":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
              <Icon name="ArrowLeft" size={18} className="mr-2" />
              Назад к договорам
            </Button>
            <h1 className="text-3xl font-bold text-primary">Управление пользователями</h1>
            <p className="text-muted-foreground mt-1">Администрирование системы</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Icon name="UserPlus" size={18} className="mr-2" />
                Добавить пользователя
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Новый пользователь</DialogTitle>
                <DialogDescription>Создание учетной записи</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="newLogin">Логин *</Label>
                  <Input
                    id="newLogin"
                    value={newUser.login || ""}
                    onChange={(e) => setNewUser({ ...newUser, login: e.target.value })}
                    placeholder="username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newName">Имя *</Label>
                  <Input
                    id="newName"
                    value={newUser.name || ""}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="Иван Иванов"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Пароль *</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newUser.password || ""}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newRole">Роль *</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value) => setNewUser({ ...newUser, role: value as User["role"] })}
                  >
                    <SelectTrigger id="newRole">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Администратор</SelectItem>
                      <SelectItem value="manager">Менеджер</SelectItem>
                      <SelectItem value="accountant">Бухгалтер</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={handleAddUser}>Добавить</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Список пользователей</CardTitle>
            <CardDescription>Всего пользователей: {users.length}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Логин</TableHead>
                  <TableHead>Имя</TableHead>
                  <TableHead>Роль</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.login}>
                    <TableCell className="font-medium">{user.login}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role) as any}>
                        {getRoleName(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(user)}
                        >
                          <Icon name="Edit" size={16} className="mr-1" />
                          Изменить
                        </Button>
                        {user.login !== "admhub" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.login)}
                          >
                            <Icon name="Trash2" size={16} className="mr-1" />
                            Удалить
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Редактирование пользователя</DialogTitle>
              <DialogDescription>Изменение данных учетной записи</DialogDescription>
            </DialogHeader>
            {editingUser && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="editLogin">Логин</Label>
                  <Input
                    id="editLogin"
                    value={editingUser.login}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editName">Имя *</Label>
                  <Input
                    id="editName"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editPassword">Новый пароль</Label>
                  <Input
                    id="editPassword"
                    type="password"
                    value={editingUser.password}
                    onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                    placeholder="Оставьте пустым, чтобы не менять"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editRole">Роль *</Label>
                  <Select
                    value={editingUser.role}
                    onValueChange={(value) => setEditingUser({ ...editingUser, role: value as User["role"] })}
                    disabled={editingUser.login === "admhub"}
                  >
                    <SelectTrigger id="editRole">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Администратор</SelectItem>
                      <SelectItem value="manager">Менеджер</SelectItem>
                      <SelectItem value="accountant">Бухгалтер</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleEditUser}>Сохранить</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Users;
