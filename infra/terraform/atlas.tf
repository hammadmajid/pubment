provider "mongodbatlas" {
  public_key  = var.mongodbatlas_public_key
  private_key = var.mongodbatlas_private_key
}

resource "mongodbatlas_project" "main" {
  name   = "pubment-project"
  org_id = var.atlas_org_id
}

# Create M0 Cluster (Free tier)
resource "mongodbatlas_cluster" "main" {
  project_id   = mongodbatlas_project.main.id
  name         = "pubment-cluster"

  # Free tier cluster
  provider_name               = "TENANT"
  backing_provider_name       = "AWS"
  provider_region_name        = "EU_WEST_1"
  provider_instance_size_name = "M0"
}

# Create Database User
resource "mongodbatlas_database_user" "main" {
  username           = "pubment-user"
  password           = random_password.db_password.result
  project_id         = mongodbatlas_project.main.id
  auth_database_name = "admin"

  roles {
    role_name     = "readWrite"
    database_name = "pubment"
  }
}

# Generate random password for database user
resource "random_password" "db_password" {
  length  = 16
  special = true
}

# IP Access List - Allow backend VM
resource "mongodbatlas_project_ip_access_list" "backend" {
  project_id = mongodbatlas_project.main.id
  ip_address = azurerm_public_ip.main.ip_address
  comment    = "Backend VM access"
}

# Optional: Allow your current IP for development
# You can add this if you want to access the database from your local machine
resource "mongodbatlas_project_ip_access_list" "dev" {
  project_id = mongodbatlas_project.main.id
  cidr_block = "0.0.0.0/0"  # WARNING: This allows access from anywhere - use your specific IP in production
  comment    = "Development access"
}

# Create a database (optional, can be done via application)
resource "mongodbatlas_database_user" "app_user" {
  username           = "app-user"
  password           = random_password.app_password.result
  project_id         = mongodbatlas_project.main.id
  auth_database_name = "admin"

  roles {
    role_name     = "readWrite"
    database_name = "pubment"
  }

  roles {
    role_name     = "read"
    database_name = "admin"
  }
}

resource "random_password" "app_password" {
  length  = 16
  special = true
}
