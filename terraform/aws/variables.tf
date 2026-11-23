variable "aws_region" {
  description = "AWS Deployment Region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Target deployment environment"
  type        = string
  default     = "production"
}

variable "vpc_cidr" {
  description = "CIDR block for AWS VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "subnet_cidr" {
  description = "CIDR block for AWS Subnet"
  type        = string
  default     = "10.0.1.0/24"
}

variable "demo_mode" {
  description = "Run Terraform in local simulated demonstration mode without requiring active credentials"
  type        = bool
  default     = true
}
