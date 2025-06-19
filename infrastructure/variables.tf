variable "region" {
  description = "AWS region"
  type        = string
  default     = "ap-south-1"
}

variable "frontend_sg_name" {
  description = "Name for frontend security group"
  type        = string
  default     = "frontend-sg"
}

variable "backend_sg_name" {
  description = "Name for backend security group"
  type        = string
  default     = "backend-sg"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
}

variable "key_pair_name" {
  description = "Name of the AWS key pair for EC2 instances"
  type        = string
  default     = "code-alpha"
}

