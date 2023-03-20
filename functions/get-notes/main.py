# add your get-notes function here

import json
import boto3


def get_handler(event, context):
    try:
        # create a dynamodb client
        dynamodb = boto3.client('dynamodb')
        # get all the notes from the database
        # dynamodb.scan()
        # return a success message
        return {
            'statusCode': 200,
            'body': json.dumps('Notes retrieved successfully!')
        }
    except Exception as e:
        return {
            'statusCode': 401,
            'body': json.dumps('Error retrieving notes: ' + str(e))
        }
