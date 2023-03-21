# add your get-notes function here

import json
import boto3


def get_handler(event, context):
    try:
        access_token = event['headers']['access_token']
        email = event['headers']['email']
        dynamodb = boto3.resource("dynamodb")

        response = dynamodb.batch_get_item(
            RequestItems={
                'lotion-30158991': {
                    'Keys': [
                        {
                            'access_token': access_token
                        },
                        {
                            'email': email
                        },
                    ],
                    'ConsistentRead': True
                }
            },
            ReturnConsumedCapacity='TOTAL'
        )
        return {
            'statusCode': 200,
            'body': {'response': 'Note saved successfully',
                     'notes': json.dumps(response),
                     'event': json.dump(event),
                     }

        }
    except Exception as e:
        return {
            'statusCode': 401,
            'body': json.dumps(f'Error retrieving notes: {str(e)}'),
        }
