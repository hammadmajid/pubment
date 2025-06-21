variable "vercel_api_token" {
  description = "API token for Vercel team"
  type        = string
}

provider "vercel" {
  api_token = var.vercel_api_token
  team      = "bine"
}

resource "vercel_project" "pubment" {
  name           = "pubment"
  framework      = "react-router"
  root_directory = "apps/client"

  git_repository = {
    type = "github"
    repo = "hammadmajid/pubment"
  }
}

resource "vercel_project_environment_variable" "pubment" {
  project_id = vercel_project.pubment.id
  key        = "API_BASE_URL"
  value      = "http://${azurerm_network_interface.backend.private_ip_address}:3000"
  target     = ["production", "preview", "development"]
}

resource "vercel_project_domain" "pubment" {
  project_id = vercel_project.pubment.id
  domain     = "pubment-cl.vercel.app"
}
