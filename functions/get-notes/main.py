# add your get-notes function here

import json
import boto3
import requests


def get_handler(event, context):
    try:
        access_token = event['headers']['access_token']
        email_auth = event['headers']['email']
        email = event['queryStringParameters']['email']
        
        auth_headers = {
            "Authorization": access_token,
            "Accept": "application/json",
        }
        auth_res = requests.get(f'https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token={access_token}',
                                headers=auth_headers)
        auth_res = auth_res.json()
        if auth_res['email'] != email_auth:
            return {
                'statusCode': 401,
                'body': json.dumps('Unauthenticated request'),
            }

        dynamodb = boto3.resource("dynamodb")


        response = dynamodb.batch_get_item(
            RequestItems={
                'lotion-30158991': {
                    'Keys': [
                        {
                            'email': email,
                        }
                    ],
                    'ConsistentRead': True
                }
            },
            ReturnConsumedCapacity='TOTAL'
        )
        return {
            'statusCode': 200,
            'body': {'response': 'Note retreived successfully',
                     'notes': json.dumps(response),
                     }

        }
    except Exception as e:
        return {
            'statusCode': 401,
            'body': json.dumps(f'Error retrieving notes: {str(e)}'),
        }
