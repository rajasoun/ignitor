FROM wordpress:latest
LABEL Vendor="Raja.S"

MAINTAINER Raja. S <rajasoun@icloud.com>

RUN { \
		echo '<IfModule mod_rewrite.c>'; \
		echo 'RewriteEngine On'; \
		echo 'RewriteBase /'; \
		echo 'RewriteRule ^index\.php$ - [L]'; \
		echo 'RewriteRule (.+)/$ https://tracker.learn.cisco/tasks/$1 [R=301,L]'; \
		echo 'RewriteCond %{REQUEST_FILENAME} !-f'; \
		echo 'RewriteCond %{REQUEST_FILENAME} !-d'; \
		echo 'RewriteRule . /index.php [L]'; \
		echo '</IfModule>'; \
	} > .htaccess

#RUN chown www-data:www-data /var/www/html/.htaccess
