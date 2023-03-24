terraform {
  required_providers {
    aws = {
      version = ">= 4.0.0"
      source = "hashicorp/aws"
    }
  }
}

# specify the provider region
provider "aws" {
  region = "ca-central-1"
}

locals {
  function_name = "save-note-30144999"
  handler_name  = "main.handler"
  artifact_name = "${local.function_name}.zip"
}

# S3 bucket
# if you omit the name, Terraform will assign a random name to it
# see the docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket
resource "aws_s3_bucket" "lambda" {
    bucket = "lambda-functions-bucket-30144999"
}

resource "null_resource" "install_dependencies" {
  provisioner "local-exec" {
    command = "pip install -r ../functions/save-note/requirements.txt -t ../functions/save-note/"
  }
    triggers = {
      dependencies_versions = filemd5("../functions/save-note/requirements.txt")
      source_versions = filemd5("../functions/save-note/main.py")
  }
}


data "archive_file" "lambda_save_note" {
  type = "zip"

  source_dir  = "../functions/save-note"
  output_path = "./save-note-30144999.zip"
}

resource "aws_s3_object" "lambda_save_note" {
  bucket = aws_s3_bucket.lambda.id

  key    = "save-note-30144999.zip"
  source = data.archive_file.lambda_save_note.output_path

  etag = filemd5(data.archive_file.lambda_save_note.output_path)
}

resource "aws_iam_role" "lambda_save" {
  name               = "iam-for-lambda-${local.function_name}"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_lambda_function" "lambda_save" {
  s3_bucket = aws_s3_bucket.lambda.bucket
  # the artifact needs to be in the bucket first. Otherwise, this will fail.
  s3_key        = local.artifact_name
  role          = aws_iam_role.lambda_save.arn
  function_name = local.function_name
  handler       = local.handler_name
  runtime = "python3.9"
  source_code_hash = "${base64encode(aws_s3_object.lambda_save_note.etag)}"

}

resource "aws_iam_policy" "logs_save" {
  name        = "lambda-logging-${local.function_name}"
  description = "IAM policy for logging from a lambda"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*",
      "Effect": "Allow"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "lambda_logs_save" {
  role       = aws_iam_role.lambda_save.name
  policy_arn = aws_iam_policy.logs_save.arn
}

data "archive_file" "lambda_get_notes" {
  type = "zip"

  source_dir  = "../functions/get-notes"
  output_path = "./get-notes-30144999.zip"
}

resource "aws_s3_object" "lambda_get_notes" {
  bucket = aws_s3_bucket.lambda.id

  key    = "get-notes-30144999.zip"
  source = data.archive_file.lambda_get_notes.output_path

  etag = filemd5(data.archive_file.lambda_get_notes.output_path)
}

resource "aws_iam_role" "lambda_get" {
  name               = "iam-for-lambda-get-notes-30144999"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_lambda_function" "lambda_get" {
  s3_bucket = aws_s3_bucket.lambda.bucket
  # the artifact needs to be in the bucket first. Otherwise, this will fail.
  s3_key        = "get-notes-30144999.zip"
  role          = aws_iam_role.lambda_get.arn
  function_name = "get-notes-30144999"
  handler       = local.handler_name
  runtime = "python3.9"
  source_code_hash = "${base64encode(aws_s3_object.lambda_get_notes.etag)}"

}

resource "aws_iam_policy" "logs_get" {
  name        = "lambda-logging-get-notes-30144999"
  description = "IAM policy for logging from a lambda"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*",
      "Effect": "Allow"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "lambda_logs_get" {
  role       = aws_iam_role.lambda_get.name
  policy_arn = aws_iam_policy.logs_get.arn
}

data "archive_file" "lambda_delete_note" {
  type = "zip"

  source_dir  = "../functions/delete-note"
  output_path = "./delete-note-30144999.zip"
}

resource "aws_s3_object" "lambda_delete_note" {
  bucket = aws_s3_bucket.lambda.id

  key    = "delete-note-30144999.zip"
  source = data.archive_file.lambda_delete_note.output_path

  etag = filemd5(data.archive_file.lambda_delete_note.output_path)
}

resource "aws_iam_role" "lambda_delete" {
  name               = "iam-for-lambda-delete-note-30144999"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_lambda_function" "lambda_delete" {
  s3_bucket = aws_s3_bucket.lambda.bucket
  # the artifact needs to be in the bucket first. Otherwise, this will fail.
  s3_key        = "delete-note-30144999.zip"
  role          = aws_iam_role.lambda_delete.arn
  function_name = "delete-note-30144999"
  handler       = local.handler_name
  runtime = "python3.9"
  source_code_hash = "${base64encode(aws_s3_object.lambda_delete_note.etag)}"

}

resource "aws_iam_policy" "logs_delete" {
  name        = "lambda-logging-delete-note-30144999"
  description = "IAM policy for logging from a lambda"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*",
      "Effect": "Allow"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "lambda_logs_delete" {
  role       = aws_iam_role.lambda_delete.name
  policy_arn = aws_iam_policy.logs_delete.arn
}
# output the name of the bucket after creation
output "bucket_name" {
  value = aws_s3_bucket.lambda.bucket
}

data "aws_caller_identity" "current" {}

resource "aws_dynamodb_table" "lotion-30160521" {
  name         = "lotion-30160521"
  billing_mode = "PROVISIONED"

  # up to 8KB read per second (eventually consistent)
  read_capacity = 1

  # up to 1KB per second
  write_capacity = 1

  hash_key = "email"
  range_key = "uuid"

  # the hash_key data type is string
  attribute {
    name = "email"
    type = "S"
  }

  attribute {
    name = "uuid"
    type = "S"
  }
}

resource "aws_iam_policy" "dynamodb_policy" {
  name        = "dynamodb-policy"
  policy      = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem"
        ]
        Resource = "arn:aws:dynamodb:ca-central-1:786714620860:table/lotion-30160521"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "dynamodb_policy_attachment" {
  policy_arn = aws_iam_policy.dynamodb_policy.arn
  role       = aws_iam_role.lambda_save.name
}

resource "aws_lambda_function_url" "url" {
  function_name      = aws_lambda_function.lambda_save.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["GET", "POST", "PUT", "DELETE"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"]
  }
}
output "lambda_url" {
  value = aws_lambda_function_url.url.function_url
}