import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для управления договорами (CRUD операции)
    Args: event - dict с httpMethod, body, queryStringParameters
          context - object с request_id, function_name
    Returns: HTTP response dict с данными договоров
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
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
                body_data.get('expirationDate'),
                body_data.get('amount'),
                body_data.get('sbis'),
                body_data.get('eis'),
                body_data.get('workAct'),
                body_data.get('contactPerson'),
                body_data.get('contactPhone')
            ))
            
            new_id = cur.fetchone()[0]
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
