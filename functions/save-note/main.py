import json
import boto3

# add your save-note function here


def save_handler(event, context):
    try:
        access_token = event['headers']['access_token']
        email = event['headers']['email']
        note_data = json.loads(event['body'])

        instance_to_save = {'access_token': access_token,
                            'email': email, **note_data}

        dynamodb_resouce = boto3.resource('dynamodb')
        table = dynamodb_resouce.Table("lotion-30158991")
        response = table.put_item(
            Item=instance_to_save
        )

        return {
            'statusCode': 200,
            'body': {'response': f'Note saved successfully. Response: {response}',
                     'event': json.dump(event),
                     }
        }
    except Exception as e:
        return {'statusCode': 401, 'body': json.dumps(f'Error saving note: {str(e)}')}
