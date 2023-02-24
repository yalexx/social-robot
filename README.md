## login docker
    sudo docker login
wemaptech
forthehorde1993

## init script
chmod +x init.sh &
./init.sh

sudo usermod -a -G docker $USER

## commit container
    docker commit ebdcf8555cf2  wemaptech/client-bot
    
## push container
    docker push wemaptech/client-bot

## pull container
    sudo docker pull wemaptech/client-bot

## push container    
    sudo docker push wemaptech/client-bot

## create persistent volume
    docker volume create social-robot-new
    
## run container
    sudo docker run -p 3391:3389 -d -it --mount source=client-bot-volume,target=/social-robot,target=/home/ubuntu/.config wemaptech/client-bot

##kill process using port
    sudo kill `sudo lsof -t -i:9022`
    
## inspect container ip
    docker inspect f9c10caaab3b

## inspect all container ips    
    docker inspect -f '{{.Name}} - {{.NetworkSettings.IPAddress }}' $(docker ps -aq)
    
## add ENV variables
    sudo -H gedit /etc/environment
    
## restart docker
    service docker restart


## Allow containers to access parent host

sudo apt-get install build-essential

If View Desktop not working !
sudo iptables -A INPUT -p tcp --dport 3334 -j ACCEPT

sudo apt-get install iptables-persistent &
sudo iptables -A INPUT -i docker0 -j ACCEPT &
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT &
sudo iptables -A INPUT -p tcp --dport 3334 -j ACCEPT &
sudo iptables -A INPUT -p tcp --dport 3333 -j ACCEPT &
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT &
sudo iptables -A INPUT -p tcp --dport 8080 -j ACCEPT &
sudo iptables -A INPUT -p tcp --dport 27017 -j ACCEPT &
sudo iptables -A INPUT -p tcp --dport 3747 -j ACCEPT

sudo netfilter-persistent save

route | awk '/^default/ { print $2 }'

## run bash on container
docker exec -it  3e6252447a8c /bin/bash

docker kill $(docker ps -q)

sudo systemctl unmask mongodb
chown mongodb.mongodb -R /var/lib/mongodb
chown mongodb.mongodb -R /var/lib/mongodb

## BUILD ng-app
ng build --prod --aot false

## Apache2 redirect to index.html
etc/apache2/sites-enabled
<VirtualHost *:80>
    ServerName my-app

    DocumentRoot /var/www/html
    <Directory /var/www/html>
        RewriteEngine on

        # Don't rewrite files or directories
        RewriteCond %{REQUEST_FILENAME} -f [OR]
        RewriteCond %{REQUEST_FILENAME} -d
        RewriteRule ^ - [L]

        # Rewrite everything else to index.html
        # to allow html5 state links
        RewriteRule ^ index.html [L]
    </Directory>
</VirtualHost>

#https://portainer.io/install.html
$ docker volume create portainer_data
$ docker run -d -p 9000:9000 -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer

/usr/local/bin/noip2 -C
/usr/local/bin/noip2


npm install pm2 