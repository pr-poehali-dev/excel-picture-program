# Скрипт для создания резервной копии базы данных
# Использование: .\backup-db.ps1 -Password "ваш_пароль"

param(
    [Parameter(Mandatory=$true)]
    [string]$Password,
    
    [string]$User = "postgres",
    [string]$Database = "contracts_db",
    [string]$Host = "localhost",
    [string]$Port = "5432",
    [string]$BackupDir = "C:\Backups\ContractsDB",
    [string]$PgBinPath = "C:\Program Files\PostgreSQL\14\bin",
    [int]$RetentionDays = 30
)

# Создание директории для бэкапов
if (!(Test-Path $BackupDir)) {
    Write-Host "Создание директории бэкапов: $BackupDir" -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

# Установка переменной окружения для пароля
$env:PGPASSWORD = $Password

# Путь к pg_dump
$pgDumpPath = Join-Path $PgBinPath "pg_dump.exe"

if (!(Test-Path $pgDumpPath)) {
    Write-Error "pg_dump не найден по пути: $pgDumpPath"
    Remove-Item Env:\PGPASSWORD
    exit 1
}

# Генерация имени файла бэкапа
$timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$backupFile = Join-Path $BackupDir "contracts_db_$timestamp.sql"

Write-Host "`nСоздание резервной копии..." -ForegroundColor Cyan
Write-Host "База данных: $Database" -ForegroundColor White
Write-Host "Файл бэкапа: $backupFile" -ForegroundColor White

# Создание бэкапа
$startTime = Get-Date
& $pgDumpPath -U $User -h $Host -p $Port -d $Database -f $backupFile 2>&1

if ($LASTEXITCODE -eq 0) {
    $endTime = Get-Date
    $duration = $endTime - $startTime
    $fileSize = (Get-Item $backupFile).Length / 1MB
    
    Write-Host "`n✓ Резервная копия успешно создана!" -ForegroundColor Green
    Write-Host "  Размер файла: $([math]::Round($fileSize, 2)) MB" -ForegroundColor White
    Write-Host "  Время создания: $([math]::Round($duration.TotalSeconds, 1)) сек" -ForegroundColor White
} else {
    Write-Error "Ошибка при создании резервной копии"
    Remove-Item Env:\PGPASSWORD
    exit 1
}

# Удаление старых бэкапов
Write-Host "`nОчистка старых бэкапов (старше $RetentionDays дней)..." -ForegroundColor Yellow
$cutoffDate = (Get-Date).AddDays(-$RetentionDays)
$oldBackups = Get-ChildItem $BackupDir -Filter "contracts_db_*.sql" | Where-Object { $_.LastWriteTime -lt $cutoffDate }

if ($oldBackups.Count -gt 0) {
    foreach ($backup in $oldBackups) {
        Write-Host "  Удаление: $($backup.Name)" -ForegroundColor Gray
        Remove-Item $backup.FullName -Force
    }
    Write-Host "✓ Удалено файлов: $($oldBackups.Count)" -ForegroundColor Green
} else {
    Write-Host "  Старых бэкапов не найдено" -ForegroundColor Gray
}

# Список существующих бэкапов
Write-Host "`nСписок резервных копий:" -ForegroundColor Cyan
$allBackups = Get-ChildItem $BackupDir -Filter "contracts_db_*.sql" | Sort-Object LastWriteTime -Descending
$totalSize = 0

foreach ($backup in $allBackups) {
    $size = $backup.Length / 1MB
    $totalSize += $size
    $age = (Get-Date) - $backup.LastWriteTime
    Write-Host "  $($backup.Name) - $([math]::Round($size, 2)) MB ($([math]::Round($age.TotalDays, 0)) дней назад)" -ForegroundColor White
}

Write-Host "`nОбщий размер бэкапов: $([math]::Round($totalSize, 2)) MB" -ForegroundColor Cyan

# Очистка переменной окружения
Remove-Item Env:\PGPASSWORD

Write-Host "`n✓ Готово!" -ForegroundColor Green
exit 0
