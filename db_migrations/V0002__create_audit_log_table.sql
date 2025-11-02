-- Создание таблицы для хранения логов действий пользователей
CREATE TABLE IF NOT EXISTS t_p14922891_excel_picture_progra.audit_log (
  id SERIAL PRIMARY KEY,
  action VARCHAR(50) NOT NULL,
  user_role VARCHAR(50) NOT NULL,
  contract_id INTEGER NULL,
  contract_data JSONB NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание индекса для быстрого поиска по дате
CREATE INDEX idx_audit_log_created_at ON t_p14922891_excel_picture_progra.audit_log(created_at DESC);

-- Создание индекса для поиска по действию
CREATE INDEX idx_audit_log_action ON t_p14922891_excel_picture_progra.audit_log(action);