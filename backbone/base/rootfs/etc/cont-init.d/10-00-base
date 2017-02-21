#!/usr/bin/with-contenv sh

user="dev"

USER_ID=${LOCAL_USER_ID:-1000}
echo "Starting with UID : $USER_ID"
addgroup -g $USER_ID $user
adduser -s /bin/false -D -h /home/$user -u $USER_ID -G $user $user

# unless this has already been defined, set
if [ -z "$MASTER_PASSWORD" ]; then
    MASTER_PASSWORD=`date +%s | sha256sum | base64 | head -c 16 ; echo`
    echo "set  master password to random password: $MASTER_PASSWORD"
    printf $MASTER_PASSWORD > /var/run/s6/container_environment/MASTER_PASSWORD
    export MASTER_PASSWORD="$MASTER_PASSWORD"
fi

# unless this has already been defined, set
if [ -z "$GUUID" ]; then
    GUUID="ciyqzhrlu000001pfm0tm7m2h"
    echo "GUUID = $GUUID"
    printf $GUUID > /var/run/s6/container_environment/GUUID
fi

if [ ! -d "/opt/$user/data/$GUUID" ]; then
	mkdir -p "/opt/$user/data/$GUUID"
fi

if [ ! -d "/opt/$user/log/$GUUID" ]; then
	mkdir -p "/opt/$user/log/$GUUID"
fi

# secure $user
chown -R $user:$user /opt/$user/data
chown -R $user:$user /opt/$user/log

chmod +x /etc/usr/bin/host-ip
chmod +x /etc/usr/bin/gateway-ip

