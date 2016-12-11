<?php
require 'DB.php';

$db = new DB("Planetoids");

if($_SERVER['REQUEST_METHOD'] === 'POST') {
    $_POST = json_decode(file_get_contents('php://input'), true);
    $insert = null;
    switch ($_POST['action']) {
        case 'addUser':
            $stmt = "INSERT INTO Users(name) VALUES(:name)";
            $db->query($stmt, array("name" => $_POST['name']));
            $insert = -1;
            break;
        case 'addScore':
            $stmt = "INSERT INTO HighScores(userId, score, level) VALUES(:userId, :score, :level)";
            $insert = $db->query($stmt, array("userId"=>$_POST["userId"], "score"=>$_POST["score"], "level"=>$_POST["level"]));
            break;
        case 'setUserScore':
            $stmt = "UPDATE Users SET highScore = :score WHERE id = :id";
            $insert = $db->query($stmt, array("score"=>$_POST["score"], "id"=>$_POST["userId"]));
            ChromePhp::log($insert);
            break;
    }
    if($insert > 0) {
        header('Content-Type: application/json');
        echo json_encode(array("success"=>true));
    }
    else if($insert === -1) {
        header('Content-Type: application/json');
        echo json_encode(array("id"=>$db->getLastId()));
    }
    else {
        header('Content-Type: application/json');
        echo json_encode(array("success"=>false));
    }
}
else {
    $results = null;
    switch($_GET['action']) {
        case 'getLeaders':
            $stmt = "SELECT HighScores.score, HighScores.level, Users.name
                     FROM HighScores
                     INNER JOIN Users ON HighScores.userId = Users.id
                     ORDER BY HighScores.score DESC
                     LIMIT 5";
            $results = $db->query($stmt);
            break;
        case 'userExists':
            $stmt = "SELECT name FROM Users WHERE name = :name";
            $results = $db->query($stmt, array("name"=>$_GET["name"]));
            if(count($results) < 1) $results = array("exists" => false);
            else $results = array("exists" => true);
            break;
        case 'getUserScore':
            $stmt = "SELECT highScore FROM Users WHERE name = :name";
            $results = $db->query($stmt, array("name"=>$_GET["name"]));
            break;
        case 'getUserId':
            $results = $db->getLastId();
    }
    $results = json_encode($results);
    header('Content-Type: application/json');
    echo $results;
}

$db->disconnect();
