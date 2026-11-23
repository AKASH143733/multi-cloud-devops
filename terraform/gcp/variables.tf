variable "gcp_project_id" {
  description = "Google Cloud Platform Project ID"
  type        = string
  default     = "multicloud-devops-demo-project"
}

variable "gcp_region" {
  description = "GCP Deployment Region"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Target deployment environment"
  type        = string
  default     = "production"
}

variable "node_count" {
  description = "Number of worker nodes for GKE cluster"
  type        = number
  default     = 2
}

variable "demo_mode" {
  description = "Run Terraform in local simulated demonstration mode without requiring active credentials"
  type        = bool
  default     = true
}
