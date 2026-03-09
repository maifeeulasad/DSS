# Setup Environment
```sh
curl -sfL https://get.k3s.io | sh -
```

# Docker
```sh
# Install Docker
sudo apt install -y docker.io

# Start and enable Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Verify installation
docker --version
docker run hello-world

# (Optional) Allow using docker without sudo for specific users
sudo usermod -aG docker $USER
newgrp docker
```

# Helm

```sh
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

# Key Generation

```sh
ssh-keygen -t rsa -b 4096 -f ~/.ssh/k3s_deploy_key
cat ~/.ssh/k3s_deploy_key.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```