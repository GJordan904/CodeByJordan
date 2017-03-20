<?php
require 'DB.php';

$db = new DB("code_by_jordan");

if($_SERVER['REQUEST_METHOD'] === 'POST') {
    $_POST = json_decode(file_get_contents('php://input'), true);

}
else {
    $results = null;
    switch($_GET['action']) {
        case 'countWork':
            $stmt = "SELECT COUNT(*) FROM Works";
            $results = $db->query($stmt);
            break;
        case 'getWork':
            $stmt = "SELECT title, about, url, tags
                     FROM Works WHERE id = :id";
            $results = $db->query($stmt, array("id"=>$_GET["id"]));
            break;
    }
    $results = json_encode($results);
    header('Content-Type: application/json');
    echo $results;
}