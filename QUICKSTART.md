# Быстрый старт - Развертывание на Windows Server 2016

## 📋 Что вам понадобится (5-10 минут)

1. **Node.js 18+** - https://nodejs.org/
2. **PostgreSQL 14+** - https://www.postgresql.org/download/windows/
3. **Python 3.9+** - https://www.python.org/downloads/
4. **Git** (опционально) - https://git-scm.com/download/win

---

## 🚀 Установка за 5 шагов

### Шаг 1: Получить код проекта

**Через GitHub (рекомендуется):**
1. В редакторе poehali.dev: **Скачать → Подключить GitHub**
2. Код автоматически загрузится в репозиторий
3. Клонируйте репозиторий на сервер:
```powershell
cd C:\inetpub
git clone https://github.com/ваш_username/ваш_репозиторий.git contracts-app
cd contracts-app
```

**Или скачать ZIP:**
1. Скачайте код с GitHub
2. Распакуйте в `C:\inetpub\contracts-app\`

---

### Шаг 2: Установить зависимости

```powershell
cd C:\inetpub\contracts-app

# Фронтенд
npm install

# Бэкенд (Express сервер)
npm install express cors

# Python зависимости
pip install psycopg2-binary
```

---

### Шаг 3: Настроить базу данных

Откройте **SQL Shell (psql)** и выполните:

```sql
-- Создание базы
CREATE DATABASE contracts_db;
\q
```

Примените миграции с помощью скрипта:

```powershell
# В PowerShell (из корня проекта)
.\scripts\apply-migrations.ps1 -Password "ваш_пароль_postgres"
```

---

### Шаг 4: Установить бэкенд как службу Windows

```powershell
# Запустите PowerShell от администратора
cd C:\inetpub\contracts-app

# Установка сервиса
.\scripts\install-backend-service.ps1

# Введите DATABASE_URL когда попросит:
# postgresql://postgres:ваш_пароль@localhost:5432/contracts_db
```

Проверка работы:
```powershell
# Откройте браузер
http://localhost:3001/api/contracts
# Должен вернуться JSON с пустым массивом или данными
```

---

### Шаг 5: Собрать и запустить фронтенд

#### 5.1. Обновить API URL

Откройте файл `src/pages/Index.tsx` и измените:

```typescript
// Строка 30: было
const API_URL = "https://functions.poehali.dev/b8cf114d-cee0-421e-8222-3f5a782739fb";

// Должно быть
const API_URL = "http://localhost:3001/api/contracts";
```

Также обновите в файле `src/pages/Users.tsx` (если есть).

#### 5.2. Собрать проект

```powershell
npm run build
```

Результат появится в папке `dist/`.

#### 5.3. Настроить IIS

1. Откройте **IIS Manager**
2. Правой кнопкой на **Sites** → **Add Website**
3. Заполните:
   - **Site name:** ContractsApp
   - **Physical path:** `C:\inetpub\contracts-app\dist`
   - **Port:** 80 (или 8080)
4. Нажмите **OK**

#### 5.4. Настроить URL Rewrite

Скачайте и установите **URL Rewrite Module**:
- https://www.iis.net/downloads/microsoft/url-rewrite

Скопируйте файл `web.config` в папку `dist/` (он должен быть создан автоматически при билде, или создайте вручную - см. DEPLOYMENT_WINDOWS.md).

---

## ✅ Проверка работы

### Проверка бэкенда
```powershell
# В браузере откройте
http://localhost:3001/health
# Должен вернуться: {"status": "ok", ...}

http://localhost:3001/api/contracts
# Должен вернуться: {"contracts": [...]}
```

### Проверка фронтенда
```powershell
# В браузере откройте
http://localhost/
# Или
http://your-server-ip/

# Должна открыться страница входа
```

### Тестовый вход

Логин и пароль по умолчанию (если не изменили):
- Логин: `admin`
- Пароль: `admin` (или другой, который задали)

---

## 🔧 Управление сервисом

### Статус бэкенда
```powershell
Get-Service -Name ContractsBackend
```

### Перезапуск
```powershell
Restart-Service -Name ContractsBackend
```

### Логи бэкенда
```powershell
# Посмотреть логи
Get-Content C:\inetpub\contracts-app\logs\backend-stdout.log -Tail 50
Get-Content C:\inetpub\contracts-app\logs\backend-stderr.log -Tail 50
```

### Логи IIS
```powershell
# Логи находятся в
C:\inetpub\logs\LogFiles\W3SVC1\
```

---

## 📦 Резервное копирование

### Создать бэкап базы данных

```powershell
.\scripts\backup-db.ps1 -Password "ваш_пароль_postgres"
```

Бэкапы сохраняются в: `C:\Backups\ContractsDB\`

### Автоматические бэкапы

Настройте Task Scheduler для запуска бэкапа каждый день:

```powershell
# Создание задачи
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" `
    -Argument "-File C:\inetpub\contracts-app\scripts\backup-db.ps1 -Password 'ваш_пароль'"

$trigger = New-ScheduledTaskTrigger -Daily -At 3am

Register-ScheduledTask -Action $action -Trigger $trigger `
    -TaskName "ContractsDB_Backup" `
    -Description "Ежедневный бэкап базы данных"
```

---

## 🔄 Обновление приложения

После получения обновлений из GitHub:

```powershell
cd C:\inetpub\contracts-app

# 1. Получить обновления
git pull origin main

# 2. Обновить зависимости (если изменились)
npm install

# 3. Пересобрать фронтенд
npm run build

# 4. Перезапустить бэкенд
Restart-Service -Name ContractsBackend

# 5. Перезапустить IIS (опционально)
iisreset
```

---

## ❌ Решение проблем

### Бэкенд не запускается

```powershell
# Проверить статус
Get-Service ContractsBackend

# Посмотреть логи
Get-Content C:\inetpub\contracts-app\logs\backend-stderr.log -Tail 20

# Проверить DATABASE_URL
C:\nssm\nssm-2.24\win64\nssm.exe get ContractsBackend AppEnvironmentExtra
```

### База данных недоступна

```powershell
# Проверить службу PostgreSQL
Get-Service postgresql*

# Запустить службу
Start-Service postgresql-x64-14
```

### IIS не отдает страницу

1. Проверьте что сайт запущен в IIS Manager
2. Проверьте права доступа на папку `dist/`
3. Посмотрите логи IIS: `C:\inetpub\logs\LogFiles\W3SVC1\`

### Python не найден

```powershell
# Установите Python 3.9+ с python.org
# После установки проверьте:
python --version

# Переустановите psycopg2
pip install psycopg2-binary
```

---

## 📚 Дополнительная информация

Полная документация: **DEPLOYMENT_WINDOWS.md**

Включает:
- Подробную настройку безопасности
- Настройку SSL/HTTPS
- Оптимизацию производительности
- Мониторинг и логирование
- И многое другое

---

## 📞 Поддержка

- Документация проекта: https://docs.poehali.dev
- Сообщество: https://t.me/+QgiLIa1gFRY4Y2Iy

---

**Готово!** 🎉

Ваш сайт развернут на Windows Server 2016 и готов к работе!
