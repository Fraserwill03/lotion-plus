# add your get-notes function here

import json
import boto3


def get_handler(event, context):
    try:
        print(event)

        dynamodb_resource = boto3.resource("dynamodb")
        # create a dynamodb table object
        table = dynamodb_resource.Table("lotion-30158991")
        return {
            'statusCode': 200,
            'body': json.dumps(event)
        }
    except Exception as e:
        return {
            'statusCode': 401,
            'body': json.dumps('Error retrieving notes: ' + str(e))
        }
