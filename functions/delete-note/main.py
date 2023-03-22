# add your delete-note function here
import json
import boto3



def delete_handler(event, context):
    try:
        access_token = event['headers']['access_token']
        note_id = event['headers']['id']

        dynamodb_resouce = boto3.resource('dynamodb')
        table = dynamodb_resouce.Table("lotion-30158991")
        table.delete_item(
            Key={'access_token': access_token, 'id': note_id})

        return {
            'statusCode': 200,
            'body': {'response': 'Note deleted successfully',
                     'event': json.dump(event),
                     }
        }
    except Exception as e:
        return {
            'statusCode': 401,
            'body': json.dumps(f'Error deleting note: {str(e)}'),
        }
