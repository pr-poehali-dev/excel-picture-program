# Скрипт для установки бэкенда как Windows Service
# Требует прав администратора
# Использование: .\install-backend-service.ps1

#Requires -RunAsAdministrator

param(
    [string]$ServiceName = "ContractsBackend",
    [string]$ProjectPath = "C:\inetpub\contracts-app",
    [string]$NodePath = "C:\Program Files\nodejs\node.exe",
    [int]$Port = 3001,
    [string]$DatabaseUrl = ""
)

# Проверка существования Node.js
if (!(Test-Path $NodePath)) {
    Write-Error "Node.js не найден по пути: $NodePath"
    Write-Host "Установите Node.js с https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Проверка существования проекта
if (!(Test-Path $ProjectPath)) {
    Write-Error "Проект не найден по пути: $ProjectPath"
    exit 1
}

$backendScript = Join-Path $ProjectPath "backend-server.js"
if (!(Test-Path $backendScript)) {
    Write-Error "Файл backend-server.js не найден: $backendScript"
    Write-Host "Убедитесь что файл существует в корне проекта" -ForegroundColor Yellow
    exit 1
}

# Установка NSSM если не установлен
$nssmDir = "C:\nssm"
$nssmExe = "$nssmDir\nssm-2.24\win64\nssm.exe"

if (!(Test-Path $nssmExe)) {
    Write-Host "`nУстановка NSSM (Non-Sucking Service Manager)..." -ForegroundColor Yellow
    
    $nssmUrl = "https://nssm.cc/release/nssm-2.24.zip"
    $nssmZip = "$env:TEMP\nssm.zip"
    
    Write-Host "Скачивание NSSM..." -ForegroundColor Gray
    Invoke-WebRequest -Uri $nssmUrl -OutFile $nssmZip -UseBasicParsing
    
    Write-Host "Распаковка..." -ForegroundColor Gray
    Expand-Archive -Path $nssmZip -DestinationPath $nssmDir -Force
    
    Remove-Item $nssmZip
    Write-Host "✓ NSSM установлен" -ForegroundColor Green
} else {
    Write-Host "`n✓ NSSM уже установлен" -ForegroundColor Green
}

# Проверка существующего сервиса
$existingService = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue

if ($existingService) {
    Write-Host "`nСервис '$ServiceName' уже существует" -ForegroundColor Yellow
    $response = Read-Host "Удалить и переустановить? (y/n)"
    
    if ($response -eq 'y') {
        Write-Host "Остановка сервиса..." -ForegroundColor Gray
        Stop-Service -Name $ServiceName -Force -ErrorAction SilentlyContinue
        
        Write-Host "Удаление сервиса..." -ForegroundColor Gray
        & $nssmExe remove $ServiceName confirm
        
        Start-Sleep -Seconds 2
        Write-Host "✓ Старый сервис удален" -ForegroundColor Green
    } else {
        Write-Host "Установка отменена" -ForegroundColor Yellow
        exit 0
    }
}

# Проверка/запрос DATABASE_URL
if ([string]::IsNullOrEmpty($DatabaseUrl)) {
    Write-Host "`nВведите строку подключения к PostgreSQL:" -ForegroundColor Cyan
    Write-Host "Формат: postgresql://user:password@host:port/database" -ForegroundColor Gray
    Write-Host "Пример: postgresql://postgres:mypassword@localhost:5432/contracts_db" -ForegroundColor Gray
    $DatabaseUrl = Read-Host "DATABASE_URL"
    
    if ([string]::IsNullOrEmpty($DatabaseUrl)) {
        Write-Error "DATABASE_URL не может быть пустым"
        exit 1
    }
}

# Установка сервиса
Write-Host "`nУстановка сервиса '$ServiceName'..." -ForegroundColor Cyan

# Создание сервиса
& $nssmExe install $ServiceName $NodePath $backendScript

# Настройка параметров сервиса
& $nssmExe set $ServiceName AppDirectory $ProjectPath
& $nssmExe set $ServiceName DisplayName "Contracts Management Backend"
& $nssmExe set $ServiceName Description "Backend API для системы управления договорами"
& $nssmExe set $ServiceName Start SERVICE_AUTO_START

# Настройка переменных окружения
& $nssmExe set $ServiceName AppEnvironmentExtra "DATABASE_URL=$DatabaseUrl" "PORT=$Port"

# Настройка логирования
$logDir = Join-Path $ProjectPath "logs"
if (!(Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

& $nssmExe set $ServiceName AppStdout "$logDir\backend-stdout.log"
& $nssmExe set $ServiceName AppStderr "$logDir\backend-stderr.log"

# Настройка перезапуска при сбое
& $nssmExe set $ServiceName AppExit Default Restart
& $nssmExe set $ServiceName AppRestartDelay 5000

Write-Host "✓ Сервис настроен" -ForegroundColor Green

# Запуск сервиса
Write-Host "`nЗапуск сервиса..." -ForegroundColor Yellow
Start-Service -Name $ServiceName

Start-Sleep -Seconds 3

$service = Get-Service -Name $ServiceName
if ($service.Status -eq 'Running') {
    Write-Host "✓ Сервис успешно запущен!" -ForegroundColor Green
    
    Write-Host "`nИнформация о сервисе:" -ForegroundColor Cyan
    Write-Host "  Имя: $ServiceName" -ForegroundColor White
    Write-Host "  Статус: $($service.Status)" -ForegroundColor White
    Write-Host "  Порт: $Port" -ForegroundColor White
    Write-Host "  Логи: $logDir" -ForegroundColor White
    
    Write-Host "`nПроверка работы API:" -ForegroundColor Cyan
    Write-Host "  http://localhost:$Port/api/contracts" -ForegroundColor White
    
    # Тест API
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$Port/api/contracts" -Method GET -TimeoutSec 5 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ API отвечает корректно" -ForegroundColor Green
        }
    } catch {
        Write-Warning "API не отвечает. Проверьте логи: $logDir"
    }
    
} else {
    Write-Error "Сервис не запустился. Проверьте логи в: $logDir"
    exit 1
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Полезные команды:" -ForegroundColor Cyan
Write-Host "  Статус сервиса:  Get-Service -Name $ServiceName" -ForegroundColor Gray
Write-Host "  Остановка:       Stop-Service -Name $ServiceName" -ForegroundColor Gray
Write-Host "  Запуск:          Start-Service -Name $ServiceName" -ForegroundColor Gray
Write-Host "  Перезапуск:      Restart-Service -Name $ServiceName" -ForegroundColor Gray
Write-Host "  Удаление:        $nssmExe remove $ServiceName confirm" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`n✓ Установка завершена!" -ForegroundColor Green
exit 0
