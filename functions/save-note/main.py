import json
import boto3
import requests


# add your save-note function here


def save_handler(event, context):
    try:
        access_token = event['headers']['access_token']
        email = event['headers']['email']
        note_data = json.loads(event['body'])

        auth_headers = {
            "Authorization": access_token,
            "Accept": "application/json",
        }
        auth_res = requests.get(f'https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token={access_token}',
                                headers=auth_headers)
        auth_res = auth_res.json()
        if auth_res['email'] != email:
            return {
                'statusCode': 401,
                'body': json.dumps('Unauthenticated request'),
            }

        instance_to_save = {'email': email, 'id': note_data['id'], 'body': note_data['body'], 'title': note_data['title'], 'when': note_data['when']}

        dynamodb_resource = boto3.resource('dynamodb')
        table = dynamodb_resource.Table("lotion-30158991")
        response = table.put_item(
            Item=instance_to_save
        )

        return {
            'statusCode': 201,
            'body': {'response': f'Note saved successfully. Response: {response}'
                     }
        }
    except Exception as e:
        return {'statusCode': 401, 'body': json.dumps(f'Error saving note: {str(e)}')}
