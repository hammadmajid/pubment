output "frontend_security_group_id" {
  description = "ID of the frontend security group"
  value       = aws_security_group.frontend.id
}

output "backend_security_group_id" {
  description = "ID of the backend security group"
  value       = aws_security_group.backend.id
}

output "backend_security_group_arn" {
  description = "ARN of the backend security group"
  value       = aws_security_group.backend.arn
}

# EC2 Instance Outputs
output "frontend_instance_id" {
  description = "ID of the frontend EC2 instance"
  value       = aws_instance.frontend.id
}

output "frontend_instance_public_ip" {
  description = "Public IP address of the frontend instance"
  value       = aws_instance.frontend.public_ip
}

output "frontend_instance_private_ip" {
  description = "Private IP address of the frontend instance"
  value       = aws_instance.frontend.private_ip
}

output "backend_instance_id" {
  description = "ID of the backend EC2 instance"
  value       = aws_instance.backend.id
}

output "backend_instance_private_ip" {
  description = "Private IP address of the backend instance"
  value       = aws_instance.backend.private_ip
}

output "backend_instance_public_ip" {
  description = "Public IP address of the backend instance"
  value       = aws_instance.backend.public_ip
}

output "ubuntu_ami_id" {
  description = "AMI ID of the Ubuntu 20.04 LTS image used"
  value       = data.aws_ami.ubuntu.id
}

output "backend_security_group_name" {
  description = "Name of the backend security group"
  value       = aws_security_group.backend.name
}

