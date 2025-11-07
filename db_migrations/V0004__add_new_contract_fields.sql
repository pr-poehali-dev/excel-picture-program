-- Добавление новых полей для договоров
ALTER TABLE contracts 
ADD COLUMN total_amount TEXT,
ADD COLUMN notes TEXT,
ADD COLUMN contact_person2 TEXT,
ADD COLUMN contact_phone2 TEXT,
ADD COLUMN contact_person3 TEXT,
ADD COLUMN contact_phone3 TEXT;