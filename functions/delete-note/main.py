# add your delete-note function here
import json
import boto3
import requests

def handler(event, context):
    dynamodb_resource = boto3.resource("dynamodb")
    table = dynamodb_resource.Table("lotion-30160521")
    header = event['headers']
    note_id = event["pathParameters"]["id"]

    req = requests.get(f'https://www.googleapis.com/oauth2/v1/userinfo?access_token={header["token"]}',
                       headers={
                           "Authorization": f"Bearer {header['token']}",
                           "Accept": "application/json"
                       })
    if req.status_code == 401:
        return {
            "statusCode": 401,
            "body": json.dumps({"message": "Invalid user"})
        }
    
    try:
        table.delete_item(Key={"id": note_id})
        return {
            "statusCode": 200,
            "body": json.dumps({
                "message": "note deleted successfully"
            })
        }
    except Exception as e:
        print(f"error: {e}")
        return {
            "statusCode": 500,
            "body": json.dumps({"message": str(e)})
        }
