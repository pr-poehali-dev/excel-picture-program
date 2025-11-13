# 🚀 Развертывание на собственном хостинге

Этот проект можно развернуть на вашем собственном Windows Server 2016 (или выше).

## 📁 Структура проекта

```
contracts-app/
├── src/                          # Исходники фронтенда (React)
├── backend/                      # Бэкенд функции (Python)
│   ├── contracts/               # API управления договорами
│   └── audit-logs/              # API журнала действий
├── db_migrations/               # SQL миграции базы данных
├── scripts/                     # Скрипты для развертывания
│   ├── apply-migrations.ps1    # Применение миграций
│   ├── backup-db.ps1           # Резервное копирование БД
│   └── install-backend-service.ps1  # Установка Windows Service
├── backend-server.js           # Express сервер для бэкенда
├── QUICKSTART.md               # 🔥 Быстрый старт (5 шагов)
├── DEPLOYMENT_WINDOWS.md       # 📖 Полная документация
└── public/web.config           # Конфигурация IIS

```

## 🎯 С чего начать?

### Для быстрого развертывания (5-10 минут):
👉 **[QUICKSTART.md](QUICKSTART.md)** - Пошаговая инструкция за 5 шагов

### Для детального изучения:
👉 **[DEPLOYMENT_WINDOWS.md](DEPLOYMENT_WINDOWS.md)** - Полное руководство со всеми деталями

## ⚡ Быстрая установка

```powershell
# 1. Клонировать репозиторий
git clone https://github.com/ваш_username/ваш_репозиторий.git
cd ваш_репозиторий

# 2. Установить зависимости
npm install
npm install express cors
pip install psycopg2-binary

# 3. Применить миграции БД
.\scripts\apply-migrations.ps1 -Password "пароль_postgres"

# 4. Установить бэкенд как службу
.\scripts\install-backend-service.ps1

# 5. Собрать фронтенд
npm run build

# 6. Настроить IIS (см. QUICKSTART.md)
```

## 🛠 Что входит в комплект

### Готовые скрипты PowerShell:
- ✅ **apply-migrations.ps1** - Автоматическое применение всех миграций БД
- ✅ **backup-db.ps1** - Резервное копирование базы данных
- ✅ **install-backend-service.ps1** - Установка бэкенда как Windows Service

### Автоматизация:
- ✅ Бэкенд работает как Windows Service (автозапуск после перезагрузки)
- ✅ Готовая конфигурация IIS (web.config)
- ✅ URL Rewrite для React Router
- ✅ Настроенный CORS
- ✅ Компрессия и кэширование

## 📋 Требования

- **Windows Server 2016** или выше
- **Node.js 18+**
- **Python 3.9+**
- **PostgreSQL 14+**
- **IIS** (устанавливается через Server Manager)
- **Минимум 4 GB RAM**, 10 GB диска

## 🏗 Архитектура

```
┌─────────────────────────────────────────────┐
│  IIS (Port 80/443)                         │
│  ├── React SPA (dist/)                     │
│  └── Reverse Proxy → Backend API          │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  Windows Service (Port 3001)               │
│  ├── Express.js                            │
│  └── Python Handlers                       │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  PostgreSQL (Port 5432)                    │
│  └── contracts_db                          │
└─────────────────────────────────────────────┘
```

## 🔐 Безопасность

### Что настроено:
- ✅ CORS headers
- ✅ X-Content-Type-Options: nosniff
- ✅ X-Frame-Options: DENY
- ✅ X-XSS-Protection
- ✅ База данных доступна только локально

### Что нужно настроить:
- 🔒 SSL сертификат (для HTTPS)
- 🔒 Firewall правила
- 🔒 Сложные пароли для PostgreSQL
- 🔒 Ограничение доступа к административным портам

Подробнее в **[DEPLOYMENT_WINDOWS.md](DEPLOYMENT_WINDOWS.md)**

## 📦 Резервное копирование

### Ручной бэкап:
```powershell
.\scripts\backup-db.ps1 -Password "пароль_postgres"
```

### Автоматический ежедневный бэкап:
```powershell
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" `
    -Argument "-File C:\inetpub\contracts-app\scripts\backup-db.ps1 -Password 'пароль'"

$trigger = New-ScheduledTaskTrigger -Daily -At 3am

Register-ScheduledTask -Action $action -Trigger $trigger `
    -TaskName "ContractsDB_Backup"
```

Бэкапы хранятся 30 дней в `C:\Backups\ContractsDB\`

## 🔄 Обновление

После получения обновлений из GitHub:

```powershell
git pull origin main
npm install
npm run build
Restart-Service -Name ContractsBackend
iisreset
```

## 🐛 Устранение неполадок

### Логи бэкенда:
```powershell
Get-Content C:\inetpub\contracts-app\logs\backend-stdout.log -Tail 50
Get-Content C:\inetpub\contracts-app\logs\backend-stderr.log -Tail 50
```

### Логи IIS:
```
C:\inetpub\logs\LogFiles\W3SVC1\
```

### Статус сервисов:
```powershell
Get-Service ContractsBackend
Get-Service postgresql*
```

Больше информации в разделе "Устранение неполадок" в **[DEPLOYMENT_WINDOWS.md](DEPLOYMENT_WINDOWS.md)**

## 📞 Поддержка

- **Документация проекта**: https://docs.poehali.dev
- **Сообщество**: https://t.me/+QgiLIa1gFRY4Y2Iy
- **GitHub Issues**: Для сообщений об ошибках

## 🎓 Дополнительные ресурсы

- [Node.js на Windows](https://nodejs.org/)
- [PostgreSQL для Windows](https://www.postgresql.org/download/windows/)
- [IIS URL Rewrite](https://www.iis.net/downloads/microsoft/url-rewrite)
- [NSSM - Windows Service Manager](https://nssm.cc/)

---

## ✨ Возможности после развертывания

После успешного развертывания у вас будет:

✅ Полнофункциональная система управления договорами  
✅ Автоматические резервные копии базы данных  
✅ Бэкенд работает как служба Windows (автозапуск)  
✅ Готовность к работе 24/7  
✅ Возможность масштабирования  
✅ Полный контроль над данными  

---

**Приятного использования!** 🚀

*Создано с помощью poehali.dev*
