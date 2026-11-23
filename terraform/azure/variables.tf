variable "azure_region" {
  description = "Azure Deployment Region"
  type        = string
  default     = "eastus"
}

variable "environment" {
  description = "Target deployment environment"
  type        = string
  default     = "production"
}

variable "node_count" {
  description = "Number of worker nodes for AKS cluster"
  type        = number
  default     = 2
}

variable "demo_mode" {
  description = "Run Terraform in local simulated demonstration mode without requiring active credentials"
  type        = bool
  default     = true
}
