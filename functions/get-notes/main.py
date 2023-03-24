import json
import boto3
import requests


def handler(event, context):
    dynamodb_resource = boto3.resource("dynamodb")
    table = dynamodb_resource.Table("lotion-30160521")
    header = event["headers"]
    hash_key = header["email"]
    try:
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
    except Exception as e:
        return {
            "statusCode": 409,
            "body": json.dumps({"error": str(e)})
        }

    try:
        query_res = table.query(KeyConditionExpression="email = :hkey",
                                ExpressionAttributeValues={":hkey": hash_key}
                                )
        items = query_res["Items"]
        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": {
                "items": items
            }
        }
    except Exception as e:
        print(f"error: {e}")
        return {
            "statusCode": 500,
            "body": json.dumps({"message": str(e)})
        }
