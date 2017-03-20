<?php
require 'DB.php';

$db = new DB("code_by_jordan");

$results = null;
switch($_GET['action']) {
    case 'stars':
        $stmt = "SELECT id, dist, proper, mag, ci, x, y, z, lum  
                     FROM stars
                     WHERE dist < 50000
                     ORDER BY dist ASC
                     LIMIT 50000";
        $results = $db->query($stmt);
        break;
}
$results = json_encode($results);
header('Content-Type: application/json');
echo $results;