<?php
echo 'Date: '.date('jS F Y').'<br>';
echo 'Time: '.date('h:i:s a').'<br>';

$db = mysqli_connect('db', 'root', 'php', 'mysql')
	or die('Error: ' . mysqli_error());

$query = 'SHOW DATABASES;';
$res = mysqli_query($db, $query);

if ($res) {
	echo '<pre>' . PHP_EOL;
	while ($row = mysqli_fetch_assoc($res)) {
		var_dump($row);
	}
	echo '</pre>' . PHP_EOL;
}

echo 'Success! ' . time();
