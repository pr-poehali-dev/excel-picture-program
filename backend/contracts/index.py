import json
import os
import psycopg2
from typing import Dict, Any

def log_action(cur, action: str, user_role: str, contract_id: int = None, contract_data: dict = None):
    cur.execute('''
        INSERT INTO audit_logs (action, user_role, contract_id, contract_data)
        VALUES (%s, %s, %s, %s)
    ''', (action, user_role, contract_id, json.dumps(contract_data) if contract_data else None))

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для управления договорами (CRUD операции)
    Args: event - dict с httpMethod, body, queryStringParameters
          context - object с request_id, function_name
    Returns: HTTP response dict с данными договоров
    '''
    method: str = event.get('httpMethod', 'GET')
    headers = event.get('headers', {})
    user_role = headers.get('X-User-Role') or headers.get('x-user-role', 'unknown')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-User-Role',
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
                SELECT id, organization_name, contract_number, contract_date, 
                       expiration_date, amount, sbis, eis, work_act, 
                       contact_person, contact_phone
                FROM contracts
                ORDER BY id DESC
            ''')
            rows = cur.fetchall()
            
            contracts = []
            for row in rows:
                contracts.append({
                    'id': row[0],
                    'organizationName': row[1],
                    'contractNumber': row[2],
                    'contractDate': row[3],
                    'expirationDate': row[4],
                    'amount': row[5],
                    'sbis': row[6],
                    'eis': row[7],
                    'workAct': row[8],
                    'contactPerson': row[9],
                    'contactPhone': row[10]
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'contracts': contracts}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            expiration_date = body_data.get('expirationDate')
            if not expiration_date or expiration_date.strip() == '':
                expiration_date = '9999-12-31'
            
            cur.execute('''
                INSERT INTO contracts (
                    organization_name, contract_number, contract_date,
                    expiration_date, amount, sbis, eis, work_act,
                    contact_person, contact_phone
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            ''', (
                body_data.get('organizationName'),
                body_data.get('contractNumber'),
                body_data.get('contractDate'),
                expiration_date,
                body_data.get('amount'),
                body_data.get('sbis'),
                body_data.get('eis'),
                body_data.get('workAct'),
                body_data.get('contactPerson'),
                body_data.get('contactPhone')
            ))
            
            new_id = cur.fetchone()[0]
            
            log_action(cur, 'CREATE', user_role, new_id, body_data)
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': new_id, 'message': 'Contract created'}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            contract_id = body_data.get('id')
            
            if not contract_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Contract ID required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute('''
                UPDATE contracts SET
                    organization_name = %s,
                    contract_number = %s,
                    contract_date = %s,
                    expiration_date = %s,
                    amount = %s,
                    sbis = %s,
                    eis = %s,
                    work_act = %s,
                    contact_person = %s,
                    contact_phone = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            ''', (
                body_data.get('organizationName'),
                body_data.get('contractNumber'),
                body_data.get('contractDate'),
                body_data.get('expirationDate'),
                body_data.get('amount'),
                body_data.get('sbis'),
                body_data.get('eis'),
                body_data.get('workAct'),
                body_data.get('contactPerson'),
                body_data.get('contactPhone'),
                contract_id
            ))
            
            log_action(cur, 'UPDATE', user_role, contract_id, body_data)
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Contract updated'}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters', {})
            contract_id = params.get('id')
            
            if not contract_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Contract ID required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute('SELECT * FROM contracts WHERE id = %s', (contract_id,))
            contract_row = cur.fetchone()
            
            if contract_row:
                contract_data = {
                    'id': contract_row[0],
                    'organizationName': contract_row[1],
                    'contractNumber': contract_row[2],
                    'contractDate': contract_row[3],
                    'expirationDate': contract_row[4],
                    'amount': contract_row[5],
                    'sbis': contract_row[6],
                    'eis': contract_row[7],
                    'workAct': contract_row[8],
                    'contactPerson': contract_row[9],
                    'contactPhone': contract_row[10]
                }
                log_action(cur, 'DELETE', user_role, int(contract_id), contract_data)
            
            cur.execute('DELETE FROM contracts WHERE id = %s', (contract_id,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Contract deleted'}),
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