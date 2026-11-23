terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region                      = var.aws_region
  skip_credentials_validation = var.demo_mode
  skip_requesting_account_id  = var.demo_mode
  skip_metadata_api_check     = var.demo_mode
}

# 1. Virtual Private Cloud (VPC)
resource "aws_vpc" "multicloud_vpc" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "${var.environment}-multicloud-vpc"
    Environment = var.environment
    ManagedBy   = "Terraform"
    Platform    = "Multi-Cloud DevOps"
  }
}

# 2. Public Subnet
resource "aws_subnet" "public_subnet" {
  vpc_id                  = aws_vpc.multicloud_vpc.id
  cidr_block              = var.subnet_cidr
  map_public_ip_on_launch = true
  availability_zone       = "${var.aws_region}a"

  tags = {
    Name = "${var.environment}-public-subnet"
  }
}

# 3. Internet Gateway
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.multicloud_vpc.id

  tags = {
    Name = "${var.environment}-igw"
  }
}

# 4. Security Group for Container Workload
resource "aws_security_group" "app_sg" {
  name        = "${var.environment}-multicloud-sg"
  description = "Allow inbound HTTP traffic to containerized application"
  vpc_id      = aws_vpc.multicloud_vpc.id

  ingress {
    description = "HTTP Inbound"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Flask Application Port"
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.environment}-security-group"
  }
}

# 5. ECS Cluster for Container Orchestration
resource "aws_ecs_cluster" "app_cluster" {
  name = "${var.environment}-multicloud-ecs-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}
