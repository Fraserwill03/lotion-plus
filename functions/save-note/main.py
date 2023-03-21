import json
import boto3

# add your save-note function here


def save_handler(event, context):
    try:
        note_data = json.loads(event['body'])
        dynamodb_resouce = boto3.resource('dynamodb')
        table = dynamodb_resouce.Table("lotion-30158991")
        response = table.put_item(
            Item=note_data
        )

        return {
            'statusCode': 200,
            'body': {'response': 'Note saved successfully',
                     'event': json.dump(event),
                     }
        }
    except Exception as e:
        return {'statusCode': 401, 'body': json.dumps(f'Error saving note: {str(e)}')}
