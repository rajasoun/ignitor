<?php

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

if ( isset( $_SERVER['HTTP_X_FORWARDED_PROTO'] ) && $_SERVER['HTTP_X_FORWARDED_PROTO'] == 'https')
    $_SERVER['HTTPS']='on';


if (isset($_SERVER['HTTP_X_FORWARDED_HOST'])) {
    $_SERVER['HTTP_HOST'] = $_SERVER['HTTP_X_FORWARDED_HOST'];
    $_SERVER['REQUEST_URI'] = "/tasks".$_SERVER['REQUEST_URI'];
}

require_once(ABSPATH . 'wp-secrets.php');
require_once(ABSPATH . 'wp-settings.php');
