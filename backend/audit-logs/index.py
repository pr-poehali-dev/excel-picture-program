import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для получения журнала действий и восстановления удалённых договоров
    Args: event - dict с httpMethod, body, queryStringParameters
          context - object с request_id, function_name
    Returns: HTTP response dict с логами действий
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Role',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database configuration missing'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            cur.execute('''
                SELECT id, action, user_role, contract_id, contract_data, created_at
                FROM audit_log
                ORDER BY created_at DESC
                LIMIT 100
            ''')
            rows = cur.fetchall()
            
            logs = []
            for row in rows:
                logs.append({
                    'id': row[0],
                    'action': row[1],
                    'userRole': row[2],
                    'contractId': row[3],
                    'contractData': json.loads(row[4]) if row[4] else None,
                    'createdAt': row[5].isoformat() if row[5] else None
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'logs': logs}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            log_id = body_data.get('logId')
            
            if not log_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Log ID required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute('''
                SELECT contract_data FROM audit_log
                WHERE id = %s AND action = 'DELETE'
            ''', (log_id,))
            
            result = cur.fetchone()
            if not result or not result[0]:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Deleted contract not found'}),
                    'isBase64Encoded': False
                }
            
            contract_data = json.loads(result[0])
            
            cur.execute('''
                INSERT INTO contracts (
                    organization_name, contract_number, contract_date,
                    expiration_date, amount, sbis, eis, work_act,
                    contact_person, contact_phone
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            ''', (
                contract_data.get('organizationName'),
                contract_data.get('contractNumber'),
                contract_data.get('contractDate'),
                contract_data.get('expirationDate'),
                contract_data.get('amount'),
                contract_data.get('sbis'),
                contract_data.get('eis'),
                contract_data.get('workAct'),
                contract_data.get('contactPerson'),
                contract_data.get('contactPhone')
            ))
            
            new_id = cur.fetchone()[0]
            
            headers = event.get('headers', {})
            user_role = headers.get('x-user-role', 'unknown')
            
            cur.execute('''
                INSERT INTO audit_log (action, user_role, contract_id, contract_data)
                VALUES (%s, %s, %s, %s)
            ''', ('RESTORE', user_role, new_id, json.dumps(contract_data)))
            
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': new_id, 'message': 'Contract restored'}),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    
    finally:
        cur.close()
        conn.close()
