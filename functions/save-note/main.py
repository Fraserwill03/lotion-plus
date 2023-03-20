import json
import boto3

# add your save-note function here


def save_handler(event, context):
    try:
        # create a dynamodb client
        dynamodb = boto3.client('dynamodb')
        # insert the note object into the database
        # dynamodb.put_item()
        # return a success message
        return {
            'statusCode': 200,
            'body': json.dumps('Note saved successfully!')
        }
    except Exception as e:
        return {
            'statusCode': 401,
            'body': json.dumps('Error saving note: ' + str(e))
        }
