import json
import boto3

# add your save-note function here


def save_handler(event, context):
    try:
        print(event)
        dynamodb_resouce = boto3.resource('dynamodb')
        table = dynamodb_resouce.Table("lotion-30158991")

        return {
            'statusCode': 200,
            'body': json.dumps(event)
        }
    except Exception as e:
        return {
            'statusCode': 401,
            'body': json.dumps('Error saving note: ' + str(e))
        }
