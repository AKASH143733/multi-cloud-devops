terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

# 1. Google Cloud VPC Network
resource "google_compute_network" "vpc_network" {
  name                    = "${var.environment}-multicloud-vpc"
  auto_create_subnetworks = false
}

# 2. Subnetwork
resource "google_compute_subnetwork" "subnetwork" {
  name          = "${var.environment}-gke-subnet"
  ip_cidr_range = "10.2.0.0/16"
  region        = var.gcp_region
  network       = google_compute_network.vpc_network.id
}

# 3. Google Kubernetes Engine (GKE) Cluster
resource "google_container_cluster" "gke_cluster" {
  name     = "${var.environment}-multicloud-gke"
  location = var.gcp_region

  # Remove default node pool to manage explicitly
  remove_default_node_pool = true
  initial_node_count       = 1

  network    = google_compute_network.vpc_network.name
  subnetwork = google_compute_subnetwork.subnetwork.name
}

# 4. GKE Node Pool
resource "google_container_node_pool" "primary_nodes" {
  name       = "${var.environment}-node-pool"
  location   = var.gcp_region
  cluster    = google_container_cluster.gke_cluster.name
  node_count = var.node_count

  node_config {
    preemptible  = true
    machine_type = "e2-medium"

    oauth_scopes = [
      "https://www.googleapis.com/auth/logging.write",
      "https://www.googleapis.com/auth/monitoring",
    ]
  }
}
