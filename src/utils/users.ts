export interface User {
  login: string;
  password: string;
  name: string;
  role: "admin" | "manager" | "accountant";
}

const defaultUsers: User[] = [
  {
    login: "admhub",
    password: "Qwerty55",
    name: "Администратор",
    role: "admin",
  },
  {
    login: "meneger",
    password: "Qwerty44",
    name: "Менеджер",
    role: "manager",
  },
  {
    login: "buhgalter",
    password: "Qwerty33",
    name: "Бухгалтер",
    role: "accountant",
  },
];

export const initializeUsers = () => {
  const storedUsers = localStorage.getItem("appUsers");
  if (!storedUsers) {
    localStorage.setItem("appUsers", JSON.stringify(defaultUsers));
  }
};

export const getUsers = (): User[] => {
  const stored = localStorage.getItem("appUsers");
  return stored ? JSON.parse(stored) : defaultUsers;
};

export const updateUsers = (users: User[]) => {
  localStorage.setItem("appUsers", JSON.stringify(users));
};

export const authenticateUser = (login: string, password: string): User | null => {
  const users = getUsers();
  const user = users.find((u) => u.login === login && u.password === password);
  return user || null;
};

export const getCurrentUser = (): User | null => {
  const userLogin = localStorage.getItem("userLogin");
  if (!userLogin) return null;
  
  const users = getUsers();
  return users.find((u) => u.login === userLogin) || null;
};

export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.role === "admin";
};
