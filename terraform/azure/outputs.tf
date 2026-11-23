output "resource_group_name" {
  description = "Azure Resource Group"
  value       = azurerm_resource_group.rg.name
}

output "aks_cluster_name" {
  description = "Azure Kubernetes Service Cluster Name"
  value       = azurerm_kubernetes_cluster.aks.name
}

output "azure_region" {
  description = "Configured Azure Region"
  value       = var.azure_region
}

output "deployment_status" {
  description = "Simulated status of Azure infrastructure"
  value       = "Configured - Ready for Terraform Apply"
}
