# Инструкция по развертыванию на Windows Server 2016

## Оглавление
1. [Предварительные требования](#предварительные-требования)
2. [Установка необходимого ПО](#установка-необходимого-по)
3. [Настройка базы данных](#настройка-базы-данных)
4. [Развертывание бэкенда](#развертывание-бэкенда)
5. [Развертывание фронтенда](#развертывание-фронтенда)
6. [Настройка IIS](#настройка-iis)
7. [Запуск и проверка](#запуск-и-проверка)

---

## Предварительные требования

### Системные требования
- Windows Server 2016 или выше
- Минимум 4 GB RAM
- 10 GB свободного места на диске
- Права администратора

---

## Установка необходимого ПО

### 1. Node.js 18+

**Скачать и установить:**
1. Перейдите на https://nodejs.org/
2. Скачайте версию **18 LTS** или выше
3. Запустите установщик и следуйте инструкциям
4. После установки откройте PowerShell и проверьте:
```powershell
node --version  # Должно показать v18.x.x или выше
npm --version   # Должно показать 9.x.x или выше
```

### 2. PostgreSQL 14+

**Скачать и установить:**
1. Перейдите на https://www.postgresql.org/download/windows/
2. Скачайте установщик **PostgreSQL 14** или выше
3. Запустите установщик:
   - Задайте пароль для пользователя `postgres` (запомните его!)
   - Порт по умолчанию: **5432**
   - Locale: **Russian, Russia**
4. После установки откройте SQL Shell (psql) и проверьте:
```sql
SELECT version();
```

### 3. Git (опционально)

Если хотите клонировать репозиторий напрямую:
1. Скачайте с https://git-scm.com/download/win
2. Установите с настройками по умолчанию

### 4. IIS (Internet Information Services)

**Включить IIS:**
1. Откройте **Server Manager** → **Add Roles and Features**
2. Выберите **Role-based or feature-based installation**
3. В списке ролей выберите **Web Server (IIS)**
4. Добавьте следующие компоненты:
   - **Application Development** → CGI, ISAPI Extensions
   - **Management Tools** → IIS Management Console
5. Завершите установку

---

## Настройка базы данных

### 1. Создание базы данных

Откройте **SQL Shell (psql)**:
```sql
-- Войдите как postgres (введите пароль, который задали при установке)
CREATE DATABASE contracts_db;
\c contracts_db
```

### 2. Применение миграций

После получения кода проекта из GitHub, найдите папку `db_migrations/` и выполните SQL-скрипты по порядку:

```sql
-- В psql выполните:
\i C:/путь_к_проекту/db_migrations/V0001__create_contracts_table.sql
\i C:/путь_к_проекту/db_migrations/V0002__create_audit_log_table.sql
\i C:/путь_к_проекту/db_migrations/V0003__create_audit_logs_table.sql
\i C:/путь_к_проекту/db_migrations/V0004__add_new_contract_fields.sql
\i C:/путь_к_проекту/db_migrations/V0005__add_amount_comment_column.sql
```

Или используйте скрипт PowerShell (создайте файл `apply_migrations.ps1`):
```powershell
$env:PGPASSWORD = "ваш_пароль_postgres"
$migrations = Get-ChildItem -Path "db_migrations" -Filter "*.sql" | Sort-Object Name

foreach ($migration in $migrations) {
    Write-Host "Применение миграции: $($migration.Name)"
    & "C:\Program Files\PostgreSQL\14\bin\psql.exe" -U postgres -d contracts_db -f $migration.FullName
}
```

### 3. Проверка таблиц

```sql
\dt  -- Должны увидеть: contracts, audit_log
```

---

## Развертывание бэкенда

### 1. Получение кода

**Вариант A: Через GitHub (рекомендуется)**
```powershell
cd C:\inetpub\
git clone https://github.com/ваш_username/ваш_репозиторий.git contracts-app
cd contracts-app
```

**Вариант B: Скачать ZIP**
1. Скачайте код из GitHub
2. Распакуйте в `C:\inetpub\contracts-app\`

### 2. Установка зависимостей

```powershell
cd C:\inetpub\contracts-app

# Установка зависимостей фронтенда
npm install

# Установка зависимостей бэкенда (Python)
cd backend\contracts
pip install psycopg2-binary

cd ..\audit-logs
pip install psycopg2-binary

cd ..\..
```

### 3. Создание Express сервера для бэкенда

Создайте файл `backend-server.js` в корне проекта:

```javascript
const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
app.use(cors());
app.use(express.json());

// Переменные окружения
process.env.DATABASE_URL = 'postgresql://postgres:ваш_пароль@localhost:5432/contracts_db';

// Функция для вызова Python handler
function callPythonHandler(scriptPath, event, res) {
    const python = spawn('python', ['-c', `
import sys
import json
sys.path.append('${scriptPath.replace(/\\/g, '\\\\')}')
from index import handler

event = json.loads('''${JSON.stringify(event)}''')
context = type('Context', (), {'request_id': 'local', 'function_name': 'local'})()

result = handler(event, context)
print(json.dumps(result))
    `]);

    let output = '';
    python.stdout.on('data', (data) => { output += data.toString(); });
    python.stderr.on('data', (data) => { console.error('Python error:', data.toString()); });
    
    python.on('close', (code) => {
        if (code !== 0) {
            return res.status(500).json({ error: 'Internal server error' });
        }
        try {
            const result = JSON.parse(output);
            res.status(result.statusCode).set(result.headers).send(result.body);
        } catch (err) {
            res.status(500).json({ error: 'Failed to parse response' });
        }
    });
}

// API маршруты
app.all('/api/contracts', (req, res) => {
    const event = {
        httpMethod: req.method,
        headers: req.headers,
        body: JSON.stringify(req.body),
        queryStringParameters: req.query
    };
    callPythonHandler('backend\\contracts', event, res);
});

app.all('/api/audit-logs', (req, res) => {
    const event = {
        httpMethod: req.method,
        headers: req.headers,
        body: JSON.stringify(req.body),
        queryStringParameters: req.query
    };
    callPythonHandler('backend\\audit-logs', event, res);
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
```

Установите зависимости:
```powershell
npm install express cors
```

### 4. Создание Windows Service для бэкенда

Создайте файл `install-backend-service.ps1`:

```powershell
# Установка NSSM (Non-Sucking Service Manager)
$nssmUrl = "https://nssm.cc/release/nssm-2.24.zip"
$nssmZip = "$env:TEMP\nssm.zip"
$nssmDir = "C:\nssm"

Invoke-WebRequest -Uri $nssmUrl -OutFile $nssmZip
Expand-Archive -Path $nssmZip -DestinationPath $nssmDir -Force

# Установка сервиса
$nssm = "$nssmDir\nssm-2.24\win64\nssm.exe"
$serviceName = "ContractsBackend"
$appPath = "C:\Program Files\nodejs\node.exe"
$appParams = "C:\inetpub\contracts-app\backend-server.js"

& $nssm install $serviceName $appPath $appParams
& $nssm set $serviceName AppDirectory "C:\inetpub\contracts-app"
& $nssm set $serviceName DisplayName "Contracts Management Backend"
& $nssm set $serviceName Description "Backend API для системы управления договорами"
& $nssm set $serviceName Start SERVICE_AUTO_START

# Запуск сервиса
Start-Service -Name $serviceName

Write-Host "Сервис $serviceName установлен и запущен!"
```

Запустите скрипт с правами администратора:
```powershell
.\install-backend-service.ps1
```

---

## Развертывание фронтенда

### 1. Настройка API URL

Откройте файл `src/pages/Index.tsx` и измените API_URL:

```typescript
// Было:
const API_URL = "https://functions.poehali.dev/...";

// Должно быть:
const API_URL = "http://localhost:3001/api/contracts";
```

Также обновите в других файлах где используется API (проверьте файлы в `src/pages/`).

### 2. Сборка фронтенда

```powershell
cd C:\inetpub\contracts-app
npm run build
```

После успешной сборки файлы появятся в папке `dist/`.

---

## Настройка IIS

### 1. Создание сайта в IIS

1. Откройте **IIS Manager**
2. Правой кнопкой на **Sites** → **Add Website**
3. Заполните параметры:
   - **Site name:** ContractsApp
   - **Physical path:** `C:\inetpub\contracts-app\dist`
   - **Binding:** 
     - Type: http
     - IP: All Unassigned
     - Port: 80 (или 8080 если 80 занят)
     - Host name: оставьте пустым или укажите домен
4. Нажмите **OK**

### 2. Настройка URL Rewrite (для React Router)

Установите URL Rewrite Module:
1. Скачайте с https://www.iis.net/downloads/microsoft/url-rewrite
2. Установите модуль

Создайте файл `web.config` в папке `dist/`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <system.webServer>
        <rewrite>
            <rules>
                <rule name="React Routes" stopProcessing="true">
                    <match url=".*" />
                    <conditions logicalGrouping="MatchAll">
                        <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
                        <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
                        <add input="{REQUEST_URI}" pattern="^/(api)" negate="true" />
                    </conditions>
                    <action type="Rewrite" url="/" />
                </rule>
            </rules>
        </rewrite>
        <staticContent>
            <mimeMap fileExtension=".json" mimeType="application/json" />
            <mimeMap fileExtension=".woff" mimeType="application/font-woff" />
            <mimeMap fileExtension=".woff2" mimeType="application/font-woff2" />
        </staticContent>
    </system.webServer>
</configuration>
```

### 3. Настройка CORS и прокси для API

Если фронтенд и бэкенд на одном сервере, настройте reverse proxy:

В IIS Manager:
1. Выберите ваш сайт **ContractsApp**
2. Откройте **URL Rewrite** → **Add Rule** → **Reverse Proxy**
3. Настройте:
   - Server name: `localhost:3001`
   - Pattern: `^api/(.*)`
   - Rewrite URL: `http://localhost:3001/api/{R:1}`

---

## Запуск и проверка

### 1. Проверка бэкенда

Откройте браузер и перейдите:
```
http://localhost:3001/api/contracts
```

Должен вернуться JSON с договорами (или пустой массив).

### 2. Проверка фронтенда

Откройте браузер:
```
http://localhost/
```

Должна открыться страница авторизации.

### 3. Тестовый вход

Создайте тестового пользователя в базе:
```sql
-- В psql:
\c contracts_db

-- Добавьте тестового пользователя (если есть таблица users)
-- Или используйте существующую логику авторизации
```

### 4. Проверка логов

**Логи бэкенда:**
```powershell
# Через Event Viewer
eventvwr.msc
# Applications and Services Logs → найдите ContractsBackend

# Или через NSSM
C:\nssm\nssm-2.24\win64\nssm.exe status ContractsBackend
```

**Логи IIS:**
```
C:\inetpub\logs\LogFiles\W3SVC1\
```

---

## Автозапуск после перезагрузки

### Бэкенд
Уже настроен через Windows Service (NSSM) с автозапуском.

### IIS
Настройте автозапуск сайта:
1. В IIS Manager выберите ваш сайт
2. **Advanced Settings** → **Start Automatically:** True
3. **Application Pool** → **Advanced Settings** → **Start Mode:** AlwaysRunning

---

## Резервное копирование

### Ежедневный бэкап базы данных

Создайте файл `backup-db.ps1`:

```powershell
$backupDir = "C:\Backups\ContractsDB"
$date = Get-Date -Format "yyyy-MM-dd_HH-mm"
$backupFile = "$backupDir\contracts_db_$date.sql"

if (!(Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir
}

$env:PGPASSWORD = "ваш_пароль_postgres"
& "C:\Program Files\PostgreSQL\14\bin\pg_dump.exe" -U postgres -d contracts_db -f $backupFile

# Удаление старых бэкапов (старше 30 дней)
Get-ChildItem $backupDir -Filter "*.sql" | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } | Remove-Item

Write-Host "Backup создан: $backupFile"
```

Настройте Task Scheduler для автоматического запуска:
```powershell
# Создание задачи (запустите от администратора)
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-File C:\inetpub\contracts-app\backup-db.ps1"
$trigger = New-ScheduledTaskTrigger -Daily -At 3am
Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "ContractsDB_Backup" -Description "Ежедневный бэкап базы данных"
```

---

## Устранение неполадок

### Проблема: Backend не запускается
```powershell
# Проверка статуса
C:\nssm\nssm-2.24\win64\nssm.exe status ContractsBackend

# Просмотр логов
C:\nssm\nssm-2.24\win64\nssm.exe log ContractsBackend
```

### Проблема: База данных недоступна
```powershell
# Проверка службы PostgreSQL
Get-Service -Name postgresql*

# Запуск службы
Start-Service -Name postgresql-x64-14
```

### Проблема: IIS не отдает файлы
1. Проверьте права доступа на папку `dist/`
2. Убедитесь что Application Pool запущен
3. Проверьте логи IIS

---

## Обновление приложения

### 1. Получить обновления из GitHub
```powershell
cd C:\inetpub\contracts-app
git pull origin main
```

### 2. Пересобрать фронтенд
```powershell
npm install  # Если обновились зависимости
npm run build
```

### 3. Перезапустить бэкенд
```powershell
Restart-Service -Name ContractsBackend
```

### 4. Перезапустить IIS (если нужно)
```powershell
iisreset
```

---

## Безопасность

### 1. Firewall
```powershell
# Разрешить входящие подключения на порт 80
New-NetFirewallRule -DisplayName "Contracts App HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow

# Разрешить внутренние подключения к бэкенду (3001 порт только локально)
```

### 2. SSL/HTTPS (опционально)
1. Получите SSL сертификат (Let's Encrypt, самоподписанный, или коммерческий)
2. В IIS Manager → выберите сайт → Bindings → Add
3. Type: https, Port: 443, SSL Certificate: выберите установленный

### 3. Обновите DATABASE_URL
Храните пароль базы в безопасном месте, не в коде!

---

## Производительность

### Рекомендации:
1. **Connection Pooling:** Настройте пул соединений PostgreSQL (pgBouncer)
2. **Кэширование:** Настройте Redis для кэширования запросов
3. **Мониторинг:** Установите мониторинг (Grafana + Prometheus)

---

## Контакты и поддержка

При возникновении вопросов:
- Документация проекта: https://docs.poehali.dev
- Сообщество: https://t.me/+QgiLIa1gFRY4Y2Iy

---

**Дата создания:** 2025-11-14
**Версия:** 1.0
