provider "aws" {
  region = "eu-central-1"
}

# Get default VPC
data "aws_vpc" "default" {
  default = true
}

# Frontend Security Group
resource "aws_security_group" "frontend" {
  name        = "frontend-sg"
  description = "Security group for frontend servers"
  vpc_id      = data.aws_vpc.default.id

  # SSH access from anywhere
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "SSH access"
  }

  # HTTP access from anywhere
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP access"
  }

  # HTTPS access from anywhere
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS access"
  }

  # Outbound rules
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "All outbound traffic"
  }

  tags = {
    Name = "frontend-security-group"
  }
}

# Backend Security Group
resource "aws_security_group" "backend" {
  name        = "backend-sg"
  description = "Security group for backend servers"
  vpc_id      = data.aws_vpc.default.id

  # SSH access from anywhere
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "SSH access"
  }

  # Outbound rules
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "All outbound traffic"
  }

  tags = {
    Name = "backend-security-group"
  }
}

resource "aws_security_group_rule" "backend_app_from_frontend" {
  type                     = "ingress"
  from_port                = 3000
  to_port                  = 3000
  protocol                 = "tcp"
  security_group_id        = aws_security_group.backend.id
  source_security_group_id = aws_security_group.frontend.id
  description              = "Application access from frontend"
}

# Get Ubuntu 20.04 LTS AMI
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Get default subnet for the instances
data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# Frontend EC2 Instance
resource "aws_instance" "frontend" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t2.micro"
  vpc_security_group_ids = [aws_security_group.frontend.id]
  subnet_id              = data.aws_subnets.default.ids[0]

  # Enable public IP
  associate_public_ip_address = true

  # Key pair for SSH access (you'll need to create this manually in AWS Console)
  # key_name = "your-key-pair-name"  # Uncomment and set your key pair name

  tags = {
    Name = "frontend-server"
    Type = "frontend"
  }
}

# Backend EC2 Instance
resource "aws_instance" "backend" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t2.micro"
  vpc_security_group_ids = [aws_security_group.backend.id]
  subnet_id              = data.aws_subnets.default.ids[0]

  # Enable public IP for backend
  associate_public_ip_address = true

  # Key pair for SSH access (you'll need to create this manually in AWS Console)
  # key_name = "your-key-pair-name"  # Uncomment and set your key pair name

  tags = {
    Name = "backend-server"
    Type = "backend"
  }
}

