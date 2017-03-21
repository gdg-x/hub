# Setting up LetsEncrypt Certificate with Nginx Reverse Proxy

- setup virtual host config as in `./nginx.conf`

- create a softlink
```
  sudo ln -s /etc/nginx/sites-available/subsites /etc/nginx/sites-enabled/subsites
```

- get a cert using LetsEncrypt (Make sure LetsEncrypt is installed)
```
sudo letsencrypt certonly -a webroot --webroot-path=/var/www/html -d hub.gdgx.io

# if letencrypt was installed via git
./letsencrypt-auto certonly -a standalone -d hub.gdgx.io
```

- check if certs are present
```
sudo ls -l /etc/letsencrypt/live/hub.gdgx.io
```

- create a secure private key
```
sudo openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048
```

- create SSL cert conf file for nginx
```
sudo nano /etc/nginx/snippets/ssl-hub.gdgx.io.conf

## in the file
ssl_certificate /etc/letsencrypt/live/hub.gdgx.io/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/hub.gdgx.io/privkey.pem;
```

- create SSL params conf for nginx
```
sudo nano /etc/nginx/snippets/ssl-params.conf

## in the file
# from https://cipherli.st/
# and https://raymii.org/s/tutorials/Strong_SSL_Security_On_nginx.html

ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
ssl_prefer_server_ciphers on;
ssl_ciphers "EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH";
ssl_ecdh_curve secp384r1;
ssl_session_cache shared:SSL:10m;
ssl_session_tickets off;
ssl_stapling on;
ssl_stapling_verify on;
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;
# Disable preloading HSTS for now.  You can use the commented out header line that includes
# the "preload" directive if you understand the implications.
#add_header Strict-Transport-Security "max-age=63072000; includeSubdomains; preload";
add_header Strict-Transport-Security "max-age=63072000; includeSubdomains";
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;

ssl_dhparam /etc/ssl/certs/dhparam.pem;

```

- Test configs
```
sudo nginx -t
```

- Restart nginx server for changes to take effect
```
sudo service nginx restart
```
