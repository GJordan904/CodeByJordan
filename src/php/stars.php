<?php
require 'DB.php';

$db = new DB("stars");

$results = null;
switch($_GET['action']) {
    case 'getStars':
        $stmt = "SELECT id, dist, proper, mag, ci, x, y, z, lum  
                     FROM stars
                     WHERE dist < 50000
                     ORDER BY dist ASC
                     LIMIT 10";
        $results = $db->query($stmt);
        break;
}
$results = json_encode($results);
header('Content-Type: application/json');
echo $results;