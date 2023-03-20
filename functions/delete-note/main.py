# add your delete-note function here
import json
import boto3


def delete_handler(event, context):
    try:
        print(event)
        dynamodb_resouce = boto3.resource('dynamodb')
        table = dynamodb_resouce.table("lotion-30158991")
        return {
            'statusCode': 200,
            'body': json.dumps('Note deleted successfully!')
        }
    except Exception as e:
        return {
            'statusCode': 401,
            'body': json.dumps('Error deleting note: ' + str(e))
        }
