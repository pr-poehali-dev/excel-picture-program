# Скрипт для применения всех миграций PostgreSQL
# Использование: .\apply-migrations.ps1 -Password "ваш_пароль"

param(
    [Parameter(Mandatory=$true)]
    [string]$Password,
    
    [string]$User = "postgres",
    [string]$Database = "contracts_db",
    [string]$Host = "localhost",
    [string]$Port = "5432",
    [string]$PgBinPath = "C:\Program Files\PostgreSQL\14\bin"
)

# Установка переменной окружения для пароля
$env:PGPASSWORD = $Password

# Путь к psql
$psqlPath = Join-Path $PgBinPath "psql.exe"

if (!(Test-Path $psqlPath)) {
    Write-Error "PostgreSQL не найден по пути: $psqlPath"
    Write-Host "Укажите правильный путь через параметр -PgBinPath"
    exit 1
}

# Проверка подключения к БД
Write-Host "Проверка подключения к базе данных..." -ForegroundColor Yellow
$testConnection = & $psqlPath -U $User -h $Host -p $Port -d postgres -c "SELECT 1;" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "Не удалось подключиться к PostgreSQL. Проверьте учетные данные."
    exit 1
}
Write-Host "✓ Подключение успешно" -ForegroundColor Green

# Создание базы данных если не существует
Write-Host "`nПроверка существования базы $Database..." -ForegroundColor Yellow
$dbExists = & $psqlPath -U $User -h $Host -p $Port -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$Database';" 2>&1

if ($dbExists -ne "1") {
    Write-Host "База данных $Database не найдена. Создание..." -ForegroundColor Yellow
    & $psqlPath -U $User -h $Host -p $Port -d postgres -c "CREATE DATABASE $Database;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ База данных создана" -ForegroundColor Green
    } else {
        Write-Error "Ошибка при создании базы данных"
        exit 1
    }
} else {
    Write-Host "✓ База данных существует" -ForegroundColor Green
}

# Получение списка миграций
$migrationsPath = Join-Path $PSScriptRoot "..\db_migrations"
if (!(Test-Path $migrationsPath)) {
    Write-Error "Папка миграций не найдена: $migrationsPath"
    exit 1
}

$migrations = Get-ChildItem -Path $migrationsPath -Filter "*.sql" | Sort-Object Name

if ($migrations.Count -eq 0) {
    Write-Warning "Миграции не найдены в $migrationsPath"
    exit 0
}

Write-Host "`nНайдено миграций: $($migrations.Count)" -ForegroundColor Cyan

# Применение миграций
$successCount = 0
$errorCount = 0

foreach ($migration in $migrations) {
    Write-Host "`n--- Применение: $($migration.Name) ---" -ForegroundColor Cyan
    
    $output = & $psqlPath -U $User -h $Host -p $Port -d $Database -f $migration.FullName 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Успешно применена" -ForegroundColor Green
        $successCount++
    } else {
        Write-Host "✗ Ошибка при применении" -ForegroundColor Red
        Write-Host $output -ForegroundColor Red
        $errorCount++
    }
}

# Итоговая статистика
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Результаты применения миграций:" -ForegroundColor Cyan
Write-Host "  Успешно: $successCount" -ForegroundColor Green
Write-Host "  Ошибок:  $errorCount" -ForegroundColor $(if ($errorCount -gt 0) { "Red" } else { "Green" })
Write-Host "========================================" -ForegroundColor Cyan

# Очистка переменной окружения
Remove-Item Env:\PGPASSWORD

if ($errorCount -gt 0) {
    exit 1
}

Write-Host "`n✓ Все миграции успешно применены!" -ForegroundColor Green
exit 0
