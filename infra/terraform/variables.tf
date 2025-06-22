# Azure
variable "azure_subscription_id" {
  description = "Azure subscription ID"
  type        = string
}

variable "azure_client_id" {
  description = "Azure service principal client ID"
  type        = string
}

variable "azure_client_secret" {
  description = "Azure service principal client secret"
  type        = string
  sensitive   = true
}

variable "azure_tenant_id" {
  description = "Azure tenant ID"
  type        = string
}

variable "admin_ssh_key" {
  description = "SSH public key for admin user"
  type        = string
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "westeurope"
}

# Vercel
variable "vercel_api_token" {
  description = "API token for Vercel team"
  type        = string
}

# Atlas
variable "mongodbatlas_public_key" {
  description = "MongoDB Atlas public key"
  type        = string
}

variable "mongodbatlas_private_key" {
  description = "MongoDB Atlas private key"
  type        = string
  sensitive   = true
}

variable "atlas_org_id" {
  description = "MongoDB Atlas organization ID"
  type        = string
}

# Ansible
variable "jwt_secret" {
  description = "JWT secret for session authentication in app"
  type = string
}