<?php

define('WP_CONTENT_DIR', '/var/www/wp-content');
define('WP_MEMORY_LIMIT', '64M');

$table_prefix  = getenv('TABLE_PREFIX') ?: 'wp_';

foreach ($_ENV as $key => $value) {
    $capitalized = strtoupper($key);
    if (!defined($capitalized)) {
        define($capitalized, $value);
    }
}

if (!defined('ABSPATH')) {
    define('ABSPATH', dirname(__FILE__) . '/');
}


if ($_SERVER['HTTP_X_FORWARDED_PROTO'] == 'https')
    $_SERVER['HTTPS']='on';

if (isset($_SERVER['HTTP_X_FORWARDED_HOST'])) {
echo '<br>Before:';
echo '<br>$_SERVER[\'HTTP_HOST\'] : ' . $_SERVER['HTTP_HOST'];
echo '<br>$_SERVER[\'HTTP_X_FORWARDED_HOST\']: ' . $_SERVER['HTTP_X_FORWARDED_HOST'];
echo '<br>$_SERVER[\'REQUEST_URI\']: ' . $_SERVER['REQUEST_URI'];
echo '<br>$_SERVER[\'HTTP_X_FORWARDED_SERVER\']: ' . $_SERVER['HTTP_X_FORWARDED_SERVER'];
echo '<br>$_SERVER[\'HTTP_X_FORWARDED_FOR\']: ' . $_SERVER['HTTP_X_FORWARDED_FOR'];
echo '<br>$_SERVER[\'HTTP_X_FORWARDED_FOR\']: ' . $_SERVER['HTTP_X_FORWARDED_FOR'];
echo '<br>$_SERVER[\'HTTPS\']: ' . $_SERVER['HTTPS'];
echo '<br>$_SERVER[\'REMOTE_ADDR\']: ' . $_SERVER['REMOTE_ADDR'];    
echo '<br>$_SERVER[\'SERVER_NAME\']: ' . $_SERVER['SERVER_NAME'];
echo '<br>$_SERVER[\'SERVER_PROTOCOL\']: ' . $_SERVER['SERVER_PROTOCOL']; 

    $_SERVER['HTTP_HOST'] = $_SERVER['HTTP_X_FORWARDED_HOST'];
    $_SERVER['REQUEST_URI'] = "/actions".$_SERVER['REQUEST_URI']; 
}




require_once(ABSPATH . 'wp-secrets.php');
require_once(ABSPATH . 'wp-settings.php');
