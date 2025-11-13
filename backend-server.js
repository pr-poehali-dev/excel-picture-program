// Express сервер для запуска Python бэкенд-функций на Windows
const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');

const app = express();

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-User-Role', 'X-User-Id']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Логирование запросов
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Переменные окружения
const PORT = process.env.PORT || 3001;
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('ERROR: DATABASE_URL не установлен!');
    console.error('Установите переменную окружения DATABASE_URL');
    console.error('Пример: postgresql://postgres:password@localhost:5432/contracts_db');
    process.exit(1);
}

// Функция для вызова Python handler
function callPythonHandler(scriptPath, event, res) {
    const pythonPath = 'python'; // Или укажите полный путь: 'C:\\Python39\\python.exe'
    const handlerPath = path.join(__dirname, scriptPath, 'index.py');
    
    // Проверка существования файла
    const fs = require('fs');
    if (!fs.existsSync(handlerPath)) {
        console.error(`Python handler не найден: ${handlerPath}`);
        return res.status(500).json({ error: 'Backend function not found' });
    }
    
    // Создание временного скрипта для запуска handler
    const runnerScript = `
import sys
import json
import os

# Установка DATABASE_URL
os.environ['DATABASE_URL'] = '${DATABASE_URL.replace(/'/g, "\\'")}'

# Добавление пути к модулю
sys.path.insert(0, '${scriptPath.replace(/\\/g, '\\\\')}')

try:
    from index import handler
    
    # Парсинг события
    event_str = '''${JSON.stringify(event).replace(/'/g, "\\'")}'''
    event = json.loads(event_str)
    
    # Создание контекста
    class Context:
        def __init__(self):
            self.request_id = 'local-${Date.now()}'
            self.function_name = 'local'
            self.function_version = 'local'
            self.memory_limit_in_mb = 256
    
    context = Context()
    
    # Вызов handler
    result = handler(event, context)
    
    # Вывод результата
    print(json.dumps(result))
    sys.exit(0)
    
except Exception as e:
    error_result = {
        'statusCode': 500,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': str(e), 'type': type(e).__name__}),
        'isBase64Encoded': False
    }
    print(json.dumps(error_result))
    sys.exit(1)
`;
    
    // Запуск Python
    const python = spawn(pythonPath, ['-c', runnerScript]);
    
    let output = '';
    let errorOutput = '';
    
    python.stdout.on('data', (data) => {
        output += data.toString();
    });
    
    python.stderr.on('data', (data) => {
        errorOutput += data.toString();
        console.error('Python stderr:', data.toString());
    });
    
    python.on('error', (error) => {
        console.error('Failed to start Python:', error);
        res.status(500).json({ 
            error: 'Failed to start Python process',
            details: error.message 
        });
    });
    
    python.on('close', (code) => {
        if (code !== 0 && !output) {
            console.error(`Python exited with code ${code}`);
            console.error('Error output:', errorOutput);
            return res.status(500).json({ 
                error: 'Internal server error',
                details: errorOutput 
            });
        }
        
        try {
            // Парсинг результата
            const result = JSON.parse(output.trim());
            
            // Отправка ответа
            res.status(result.statusCode || 200)
               .set(result.headers || {})
               .send(result.body || '');
               
        } catch (err) {
            console.error('Failed to parse Python output:', err);
            console.error('Output was:', output);
            res.status(500).json({ 
                error: 'Failed to parse response',
                details: err.message,
                output: output 
            });
        }
    });
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        database: DATABASE_URL ? 'configured' : 'not configured'
    });
});

// API Routes

// Contracts API
app.all('/api/contracts', (req, res) => {
    const event = {
        httpMethod: req.method,
        headers: req.headers,
        body: JSON.stringify(req.body),
        queryStringParameters: req.query,
        requestContext: {
            requestId: `req-${Date.now()}`,
            identity: {
                sourceIp: req.ip,
                userAgent: req.get('user-agent')
            }
        }
    };
    
    callPythonHandler('backend\\contracts', event, res);
});

// Audit Logs API
app.all('/api/audit-logs', (req, res) => {
    const event = {
        httpMethod: req.method,
        headers: req.headers,
        body: JSON.stringify(req.body),
        queryStringParameters: req.query,
        requestContext: {
            requestId: `req-${Date.now()}`,
            identity: {
                sourceIp: req.ip,
                userAgent: req.get('user-agent')
            }
        }
    };
    
    callPythonHandler('backend\\audit-logs', event, res);
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Not Found',
        path: req.path,
        method: req.method
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: err.message 
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('Contracts Management Backend Server');
    console.log('='.repeat(50));
    console.log(`Server running on: http://localhost:${PORT}`);
    console.log(`Health check:      http://localhost:${PORT}/health`);
    console.log(`Contracts API:     http://localhost:${PORT}/api/contracts`);
    console.log(`Audit Logs API:    http://localhost:${PORT}/api/audit-logs`);
    console.log(`Database:          ${DATABASE_URL ? 'Connected' : 'NOT CONFIGURED'}`);
    console.log('='.repeat(50));
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\nShutting down gracefully...');
    process.exit(0);
});
