# WordPress Docker Container

Lightweight WordPress container with Nginx 1.10 & PHP-FPM 7.1 based on Alpine Linux.

_WordPress version currently installed:_ **4.7.4**

* Used in production for my own sites, making it stable, tested and up-to-date
* Optimized for 100 concurrent users
* Optimized to only use resources when there's traffic (by using PHP-FPM's ondemand PM)
* Best to be used with Amazon Cloudfront as SSL terminator and CDN
* Built on the lightweight Alpine Linux distribution
* Small Docker image size (+/-45MB)
* Uses PHP 7.1 for better performance, lower cpu usage & memory footprint
* Can safely be updated without loosing data
* Fully configurable because wp-config.php uses the environment variables you can pass as a argument to the container



## Usage
See docker-compose.yml how to use it in your own environment.

    docker-compose up

Or

    docker run -d -p 80:80 -v /local/folder:/var/www/wp-content -e "DB_HOST=db" -e "DB_NAME=wordpress" -e "DB_USER=wp" -e "DB_PASSWORD=secret" trafex/wordpress
