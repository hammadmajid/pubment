# Mini Social Media MVP

A minimal, full-stack social media app. Features include user registration, following, posting, liking, and commenting. Built with a modern monorepo stack and ready for cloud deployment.

---

## Features

- **User**: Register, edit, or delete accounts
- **Follow**: Follow/unfollow users, view posts from followed users
- **Post**: Create text/image posts, like, and comment
- **Comment**: Comment on posts

---

## Tech Stack

- **Monorepo**: [Turborepo](https://turbo.build/)
- **Backend**: Node.js, Express, MongoDB, TypeScript, Zod
- **Frontend**: React Router, TypeScript, shadcn/ui, Tailwind CSS
- **Shared Schemas**: Zod (TypeScript)
- **Infrastructure**: Terraform (AWS), Ansible, Docker, Caddy

---

## Project Structure

```sh
.
├── apps
│   ├── client    # React frontend
│   └── server    # Express backend
├── packages
│   └── schemas   # Shared Zod schemas
├── infrastructure
│   ├── ansible   # Provisioning & deployment
│   └── main.tf   # Terraform AWS setup
├── turbo.json
└── ...

```

---

## Getting Started

### Prerequisites

- Node.js (v23+)
- pnpm (v10.6+)
- Docker (for containerization)
- AWS CLI & credentials (for deployment)
- Terraform & Ansible (for infrastructure)

### Local Development

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Start MongoDB** (locally or with Docker):

   ```bash
   docker run -p 27017:27017 mongo
   ```

3. **Start backend:**

   ```bash
   pnpm --filter=server dev
   ```

4. **Start frontend:**

   ```bash
   pnpm --filter=client dev
   ```

5. Visit [http://localhost:5173](http://localhost:5173).

---

## Building & Running with Docker

```bash
# server
docker build --file apps/server/Dockerfile -t mini-social-server .

# client
docker build --file apps/client/Dockerfile -t mini-social-client .
```

---

## Infrastructure & Deployment

### Overview

- **Terraform** provisions AWS EC2, security groups, and networking.
- **Ansible** installs Docker, clones the repo, builds images, and runs containers.
- **Caddy** serves the frontend with HTTPS and reverse proxy.

### Steps

1. **Provision AWS resources:**

   ```bash
   cd infrastructure
   terraform init
   terraform apply
   ```

2. **Generate Ansible inventory:**

   ```bash
   cd ansible
   python3 gen_inventory.py
   ```

3. **Deploy with Ansible:**

   ```bash
   ansible-playbook -i inventory.ini frontend.yml
   ansible-playbook -i inventory.ini backend.yml
   ```

- The frontend is served via Caddy on HTTPS (port 443).
- The backend is only accessible from the frontend instance (private networking).

---

## Environment Variables

- See `.env.example` files in each app for required variables.
- During deployment, Ansible templates these automatically.

---

## License

Project is licened under MIT license.
