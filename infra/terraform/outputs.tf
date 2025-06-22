output "public_ip_address" {
  value = azurerm_public_ip.main.ip_address
}

output "mongodb_connection_string" {
  value = replace(
    mongodbatlas_cluster.main.connection_strings[0].standard_srv,
    "mongodb+srv://",
    "mongodb+srv://${mongodbatlas_database_user.app_user.username}:${random_password.app_password.result}@"
  )
  description = "MongoDB connection string for the application"
  sensitive   = true
}

output "mongodb_cluster_name" {
  value = mongodbatlas_cluster.main.name
}

output "mongodb_project_id" {
  value = mongodbatlas_project.main.id
}

output "database_username" {
  value = mongodbatlas_database_user.app_user.username
}

output "database_password" {
  value     = random_password.app_password.result
  sensitive = true
}
