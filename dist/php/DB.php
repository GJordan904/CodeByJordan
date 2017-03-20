<?php
class DB {

    private $pdo;
    private $prepQuery;
    private $connected = false;
    private $parameters;
    private $dbName;

    public function __construct($dbName){
       $this->dbName = $dbName;
       $this->connect();
       $this->parameters = array();
    }

    private function connect() {
        $config = parse_ini_file('../../configs/database.ini');

        $dsn = "mysql:host=".$config['host'].";dbname=".$this->dbName.";charset=utf8";
        $opt = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        try {
            $this->pdo = new PDO($dsn, $config['username'], $config['password'], $opt);
            $this->connected = true;
        } catch(PDOException $e) {
            echo "Unable to connect to database";
            echo $e->getMessage();
            exit;
        }
    }

    private function prep($query, $params = "") {
        if(!$this->connected) {
            $this->connect();
        }
        try {
            $this->prepQuery = $this->pdo->prepare($query);

            // Create Parameters Array, Set Type, Then Bind to Query
            $this->setParameters($params);
            if(!empty($this->parameters)) {
                foreach($this->parameters as $param => $value) {
                    $type = PDO::PARAM_STR;
                    switch($value[1]) {
                        case is_int($value[1]):
                            $type = PDO::PARAM_INT;
                            break;
                        case is_bool($value[1]):
                            $type = PDO::PARAM_BOOL;
                            break;
                        case is_null($value[1]):
                            $type = PDO::PARAM_NULL;
                            break;
                    }
                    $this->prepQuery->bindValue($value[0], $value[1], $type);
                }
            }
            $this->prepQuery->execute();
        } catch(PDOException $e){
            echo "Error preparing statement: ".$e->getMessage();
            exit;
        }
        $this->parameters = array();
    }

    private function setParameters($params) {
        if(!empty($params)) {
            $columns = array_keys($params);
            foreach($columns as $i => &$column) {
                $this->parameters[sizeof($this->parameters)] = [":" . $column, $params[$column]];
            }
        }
    }

    public function query($query, $params = null, $fetchmode = PDO::FETCH_ASSOC) {
        $query = trim(str_replace("\r", " ", $query));

        $this->prep($query, $params);

        $rawStatement = explode(" ", preg_replace("/\\s+|\t+|\n+/", " ", $query));
        $statement = strtolower($rawStatement[0]);

        if($statement === 'select' || $statement === 'show') {
            return $this->prepQuery->fetchAll($fetchmode);
        }else if($statement === 'insert' || $statement === 'update' || $statement === 'delete') {
            return $this->prepQuery->rowCount();
        }else {
            return null;
        }

    }

    public function getLastId() {
        return $this->pdo->lastInsertId();
    }

    public function disconnect() {
        $this->pdo = null;
    }
}
