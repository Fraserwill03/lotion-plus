terraform {
  required_providers {
    aws = {
      version = ">= 4.0.0"
      source  = "hashicorp/aws"
    }
  }
}

# specify the provider region
provider "aws" {
  region = "ca-central-1"
}




# the locals block is used to declare constants that 
# you can use throughout your code
locals {
  delete_function_name = "delete-note-30150079"
  delete_handler_name  = "main.delete_handler"
  delete_note_artifact = "delete-note/artifact.zip"

  get_function_name  = "get-notes-30150079"
  get_handler_name   = "main.get_handler"
  get_notes_artifact = "get-notes/artifact.zip"

  save_function_name = "save-note-30150079"
  save_handler_name  = "main.save_handler"
  save_note_artifact = "save-note/artifact.zip"
}


# Create an S3 bucket
resource "aws_s3_bucket" "lambda" {}


# create a role for the Lambda function to assume
# every service on AWS that wants to call other AWS services should first assume a role.
# then any policy attached to the role will give permissions
# to the service so it can interact with other AWS services
# see the docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role
resource "aws_iam_role" "lambda" {
  name               = "iam-for-lambda-functions"
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

resource "aws_iam_policy" "dynamodb" {
  name = "dynamodb-policy"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ListAndDescribe",
      "Effect": "Allow",
      "Action": [
          "dynamodb:List*",
          "dynamodb:DescribeReservedCapacity*",
          "dynamodb:DescribeLimits",
          "dynamodb:DescribeTimeToLive"
      ],
      "Resource": "*"
    },
    {
      "Sid": "SpecificTable",
      "Effect": "Allow",
      "Action": [
          "dynamodb:BatchGet*",
          "dynamodb:DescribeStream",
          "dynamodb:DescribeTable",
          "dynamodb:Get*",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:BatchWrite*",
          "dynamodb:CreateTable",
          "dynamodb:Delete*",
          "dynamodb:Update*",
          "dynamodb:PutItem"
        ],
        "Resource": "arn:aws:dynamodb:*:*:table/lotion-30158991"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "dynamoaccess" {
  role       = aws_iam_role.lambda.name
  policy_arn = aws_iam_policy.dynamodb.arn
}


# create a Lambda function
# see the docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_function
resource "aws_lambda_function" "get-notes-30150079" {
  s3_bucket     = aws_s3_bucket.lambda.bucket
  s3_key        = local.get_notes_artifact
  role          = aws_iam_role.lambda.arn
  function_name = local.get_function_name
  handler       = local.get_handler_name

  runtime = "python3.9"
}


resource "aws_lambda_function" "save-note-30150079" {
  s3_bucket     = aws_s3_bucket.lambda.bucket
  s3_key        = local.save_note_artifact
  role          = aws_iam_role.lambda.arn
  function_name = local.save_function_name
  handler       = local.save_handler_name

  runtime = "python3.9"
}


resource "aws_lambda_function" "delete-note-30150079" {
  s3_bucket     = aws_s3_bucket.lambda.bucket
  s3_key        = local.delete_note_artifact
  role          = aws_iam_role.lambda.arn
  function_name = local.delete_function_name
  handler       = local.delete_handler_name

  runtime = "python3.9"
}

# # read the docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/dynamodb_table

resource "aws_dynamodb_table" "lotion-30158991" {
  name         = "lotion-30158991"
  billing_mode = "PROVISIONED"

  # up to 8KB read per second (eventually consistent)
  read_capacity = 1

  # up to 1KB per second
  write_capacity = 1

  # we only need a student id to find an item in the table; therefore, we 
  # don't need a sort key here
  hash_key = "email"
  # range_key = "id"


  # the hash_key data type is string 
  attribute {
    name = "email"
    type = "S"
  }
  # attribute {
  #   name = "id"
  #   type = "S"
  # }

}


# create a Function URL for Lambda 
# see the docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_function_url
resource "aws_lambda_function_url" "get-notes-url" {
  function_name      = aws_lambda_function.get-notes-30150079.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["GET"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"]
  }
}

output "get-notes-url" {
  value = aws_lambda_function_url.get-notes-url.function_url
}

resource "aws_lambda_function_url" "save-notes-url" {
  function_name      = aws_lambda_function.save-note-30150079.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["POST"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"]
  }
}

output "save-notes-url" {
  value = aws_lambda_function_url.save-notes-url.function_url
}

resource "aws_lambda_function_url" "delete-notes-url" {
  function_name      = aws_lambda_function.delete-note-30150079.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["DELETE"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"]
  }
}

output "delete-notes-url" {
  value = aws_lambda_function_url.delete-notes-url.function_url
}
