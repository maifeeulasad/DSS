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