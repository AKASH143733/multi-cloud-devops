output "gke_cluster_name" {
  description = "Google Kubernetes Engine Cluster Name"
  value       = google_container_cluster.gke_cluster.name
}

output "gcp_region" {
  description = "Configured GCP Region"
  value       = var.gcp_region
}

output "vpc_network_name" {
  description = "GCP VPC Network Name"
  value       = google_compute_network.vpc_network.name
}

output "deployment_status" {
  description = "Simulated status of GCP infrastructure"
  value       = "Configured - Ready for Terraform Apply"
}
