output "vpc_id" {
  description = "AWS VPC Identifier"
  value       = aws_vpc.multicloud_vpc.id
}

output "ecs_cluster_name" {
  description = "AWS ECS Cluster Name"
  value       = aws_ecs_cluster.app_cluster.name
}

output "aws_region" {
  description = "Configured AWS Region"
  value       = var.aws_region
}

output "deployment_status" {
  description = "Simulated status of AWS infrastructure"
  value       = "Configured - Ready for Terraform Apply"
}
