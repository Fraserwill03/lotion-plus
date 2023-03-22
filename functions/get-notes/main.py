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
        table = dynamodb.Table("lotion-30158991")

        response = table.query(
            KeyConditionExpression=boto3.dynamodb.conditions.Key('email').eq(email)
        )

        return {
            'statusCode': 200,
            'body': response
        }
    except Exception as e:
        return {
            'statusCode': 401,
            'body': json.dumps(f'Error retrieving notes: {str(e)}'),
        }
