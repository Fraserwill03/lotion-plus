# add your delete-note function here
import json
import boto3


def delete_handler(event, context):
    try:
        # create a dynamodb client
        dynamodb = boto3.client('dynamodb')
        # delete the note object from the database
        # dynamodb.delete_item()
        # return a success message
        return {
            'statusCode': 200,
            'body': json.dumps('Note deleted successfully!')
        }
    except Exception as e:
        return {
            'statusCode': 401,
            'body': json.dumps('Error deleting note: ' + str(e))
        }
