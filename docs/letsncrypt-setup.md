# LetsEncrypt Setup

## Installation

### Package method (Recommended)

- Update VM and install

```
sudo apt-get update
sudo apt-get upgrade
sudo apt-get install letsencrypt
```

### Git Method (For older OS versions)

- Update VM and git

```
sudo apt-get update
sudo apt-get upgrade
sudo apt-get install git-all
```

- Clone LetsEncrypt Project from github

```
git clone https://github.com/letsencrypt/letsencrypt
```

## Using LetsEncrypt

- Run the tool to get certificate

```
# for package installation
sudo letsencrypt certonly -a -d hub.gdgx.io

# for git installation
cd letsencrypt
./letsencrypt-auto certonly -a standalone -d hub.gdgx.io
```
