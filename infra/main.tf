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


data "archive_file" "lambda_save_note" {
  type = "zip"

  source_dir  = "../functions/save-note"
  output_path = "./save-note-30144999.zip"
}

resource "aws_s3_object" "lambda_save_note" {
  bucket = "lambda-functions-bucket-30144999"

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
  bucket = "lambda-functions-bucket-30144999"

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
  bucket = "lambda-functions-bucket-30144999"

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
