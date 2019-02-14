<?php
    error_reporting(E_ALL);
    ini_set('display_errors', 1);

    header('Access-Control-Allow-Origin: *');

    // Load Classes
        require 'classes/filter.php';

    // Get Endpoint
        if (isset($_GET['url'])) {
            $endpoint = filterInput($_GET['url'], 'string');
        } else {
            exit('URL missing');
        }

    // Connect to Database
        define('databasePath', 'localhost');
        define('databaseName', 'bclweb03sql_jlr_powertrain');
        define('databaseUser', 'bclweb03sql');
        define('databasePass', 'HApufun?6');

        $database = new mysqli(databasePath, databaseUser, databasePass, databaseName);
        if ($database -> connect_error) {
            exit('Database error');
        }

    // Start Session
        session_start();

        if ($endpoint !== 'login' && isset($_SESSION['user_id']) === false) {
            exit("You must be logged in to access this resource");
        }

        if (isset($_SESSION['user_id']) === true) {
            $user_id = $_SESSION['user_id'];
            $name = $_SESSION['name'];
        }

        $json = array();
        $json['validated'] = true;
        $json['success'] = true;

    // Perform Action
        switch ($endpoint) {
            // Authentication
                case 'login':
                    if (isset($_POST['username'])) {
                        $user = filterInput($_POST['username'], 'string');
                        $user = $database -> real_escape_string($user);
                    } else {
                        exit("No username entered");
                    }

                    if (isset($_POST['password'])) {
                        $pass = filterInput($_POST['password'], 'string');
                        $pass = $database -> real_escape_string($pass);
                    } else {
                        exit("No password entered");
                    }

                    $sql = "SELECT user_id, name
                            FROM user
                            WHERE name = '$user'
                            AND password = '$pass'
                            LIMIT 1";

                    $result = $database -> query($sql);
                    if ($database -> error) {
                        header('dberror:' . $database -> error);
                    }

                    if ($result -> num_rows === 0) {
                        exit("Credentials invalid");
                    }

                    $result = $result -> fetch_object();
                    $_SESSION['user_id'] = $result -> user_id;
                    $_SESSION['name'] = $result -> name;

                    exit("true");

                case 'logout':
                    if (isset($_SESSION['user_id']) === false) {
                        exit("You are not logged in");
                    }

                    session_destroy();
                    exit("true");

            // Note Camera
                case 'note-camera/delete':
                    if (isset($_POST['camera_id'])) {
                        $camera_id = filterInput($_POST['camera_id'], 'string');
                        $camera_id = $database -> real_escape_string($camera_id);
                    } else {
                        header("error: No camera ID");
                        $json['success'] = false;
                        break;
                    }

                    $sql = "DELETE
                            FROM note_camera
                            WHERE user_id = '$user_id'
                            AND camera_id = '$camera_id'
                            LIMIT 1";

                    $result = $database -> query($sql);
                    if ($database -> error) {
                        header("error: Unable to delete camera image");
                        header('dberror:' . $database -> error);
                        $json['success'] = false;
                        break;
                    }

                    break;

                case 'note-camera/get':
                    if (isset($_POST['camera_id'])) {
                        $camera_id = filterInput($_POST['camera_id'], 'string');
                        $camera_id = $database -> real_escape_string($camera_id);
                    } else {
                        header("error: No camera ID");
                        $json['success'] = false;
                        break;
                    }

                    $sql = "SELECT image
                            FROM note_camera
                            WHERE user_id = '$user_id'
                            AND camera_id = '$camera_id'
                            LIMIT 1";

                    $result = $database -> query($sql);
                    if ($database -> error || $result -> num_rows === 0) {
                        header("error: Unable to find camera image");
                        header('dberror:' . $database -> error);
                        $json['success'] = false;
                        break;
                    }

                    $result = $result -> fetch_object();
                    $json['camera_image'] = $result -> image;
                    break;

                    break;

                case 'note-camera/put':
                    if (isset($_POST['camera_id'])) {
                        $camera_id = filterInput($_POST['camera_id'], 'string');
                        $camera_id = $database -> real_escape_string($camera_id);
                    } else {
                        header("error: No camera ID");
                        $json['success'] = false;
                        break;
                    }

                    if (isset($_POST['camera_image'])) {
                        $camera_image = filterInput($_POST['camera_image'], 'string');
                        $camera_image = $database -> real_escape_string($camera_image);
                    } else {
                        header("error: No camera image");
                        $json['success'] = false;
                        break;
                    }

                    $sql = "SELECT note_camera_id
                            FROM note_camera
                            WHERE user_id = $user_id
                            AND camera_id = '$camera_id'
                            LIMIT 1";

                    $result = $database -> query($sql);
                    if ($database -> error) {
                        header('dberror:' . $database -> error);
                        $json['success'] = false;
                        break;
                    }

                    if ($result -> num_rows === 0) {
                        $sql = "INSERT INTO note_camera
                                       (user_id, camera_id, image)
                                VALUES ($user_id, '$camera_id', '$camera_image')";
                    } else {
                        $sql = "UPDATE note_camera
                                SET image = '$camera_image'
                                WHERE user_id = $user_id
                                AND camera_id = '$camera_id'
                                LIMIT 1";
                    }

                    $result = $database -> query($sql);
                    if ($database -> error) {
                        header('dberror:' . $database -> error);
                        $json['success'] = false;
                        break;
                    }

                    break;

            // Note Checkbox
                case 'note-checkbox/get':
                    if (isset($_POST['checkbox_id'])) {
                        $note_checkbox_id = filterInput($_POST['checkbox_id'], 'string');
                    } else {
                        header("error: No checkbox ID");
                        $json['success'] = false;
                        break;
                    }

                    $sql = "SELECT checked
                            FROM note_checkbox
                            WHERE user_id = '$user_id'
                            AND checkbox_id = '$note_checkbox_id'
                            LIMIT 1";

                    $result = $database -> query($sql);
                    if ($database -> error || $result -> num_rows === 0) {
                        header("error: No results found for that checkbox");
                        header('dberror:' . $database -> error);
                        $json['success'] = false;
                        break;
                    }

                    $result = $result -> fetch_object();
                    $json['note_checkbox_id'] = $note_checkbox_id;
                    $json['checked'] = intval($result -> checked);
                    break;

                case 'note-checkbox/put':
                    if (isset($_POST['checkbox_id'])) {
                        $checkbox_id = filterInput($_POST['checkbox_id'], 'string');
                    } else {
                        header("error: No checkbox ID");
                        $json['success'] = false;
                        break;
                    }

                    if (isset($_POST['group_id'])) {
                        $group_id = filterInput($_POST['group_id'], 'string');
                    } else {
                        header("error: No checkbox group ID");
                        $json['success'] = false;
                        break;
                    }

                    if (isset($_POST['checked'])) {
                        $checked = filterInput($_POST['checked'], 'integer');
                    } else {
                        header("error: No checkbox ID");
                        $json['success'] = false;
                        break;
                    }

                    if ($checked !== 1 && $checked !== 0) {
                        header("error: Checked must be 1 or 0");
                        $json['success'] = false;
                        break;
                    }

                    $sql = "SELECT note_checkbox_id
                            FROM note_checkbox
                            WHERE user_id = $user_id
                            AND checkbox_id = '$checkbox_id'
                            LIMIT 1";

                    $result = $database -> query($sql);
                    if ($database -> error) {
                        header('dberror:' . $database -> error);
                        $json['success'] = false;
                        break;
                    }

                    if ($result -> num_rows === 0) {
                        $sql = "INSERT INTO note_checkbox
                                       (user_id, checkbox_id, note_checkbox_group_id, checked)
                                VALUES ($user_id, '$checkbox_id', '$group_id', $checked)";
                    } else {
                        $sql = "UPDATE note_checkbox
                                SET checked = $checked
                                WHERE user_id = $user_id
                                AND checkbox_id = '$checkbox_id'
                                LIMIT 1";
                    }

                    $result = $database -> query($sql);
                    if ($database -> error) {
                        header('dberror:' . $database -> error);
                        $json['success'] = false;
                        break;
                    }

                    break;

            // Note List
                case 'note-list/delete':
                    if (isset($_POST['list_id'])) {
                        $list_id = filterInput($_POST['list_id'], 'string');
                    } else {
                        header("error: No note list ID");
                        $json['success'] = false;
                        break;
                    }

                    if (isset($_POST['note_id'])) {
                        $note_id = filterInput($_POST['note_id'], 'string');
                    } else {
                        header("error: No note ID");
                        $json['success'] = false;
                        break;
                    }

                    $sql = "DELETE FROM note_list
                            WHERE user_id = $user_id
                            AND list_id = '$list_id'
                            AND note_id = '$note_id'
                            LIMIT 1";

                    $result = $database -> query($sql);
                    if ($database -> error) {
                        header("error: Unable to delete note");
                        header('dberror:' . $database -> error);
                        $json['success'] = false;
                        break;
                    }

                    break;

                case 'note-list/get':
                    if (isset($_POST['list_id'])) {
                        $list_id = filterInput($_POST['list_id'], 'string');
                    } else {
                        header("error: No note list ID");
                        $json['success'] = false;
                        break;
                    }

                    $sql = "SELECT note_id, content
                            FROM note_list
                            WHERE user_id = $user_id
                            AND list_id = '$list_id'
                            ORDER BY note_list_id ASC";

                    $results = $database -> query($sql);
                    if ($database -> error || $results -> num_rows === 0) {
                        header('results: 0');
                        header('dberror:' . $database -> error);
                        $json['success'] = false;
                        break;
                    }

                    $count = 0;
                    while($result = $results -> fetch_object()) {
                        $json['notes'][$count]['note_id'] = $result -> note_id;
                        $json['notes'][$count]['text'] = $result -> content;

                        $count++;
                    }

                    break;

                case 'note-list/put':
                    if (isset($_POST['list_id'])) {
                        $list_id = filterInput($_POST['list_id'], 'string');
                    } else {
                        header("error: No note list ID");
                        $json['success'] = false;
                        break;
                    }

                    if (isset($_POST['note_id'])) {
                        $note_id = filterInput($_POST['note_id'], 'string');
                    } else {
                        header("error: No note ID");
                        $json['success'] = false;
                        break;
                    }

                    if (isset($_POST['content'])) {
                        $content = filterInput($_POST['content'], 'string');
                    } else {
                        header("error: No note list content");
                        $json['success'] = false;
                        break;
                    }

                    $sql = "SELECT note_list_id
                            FROM note_list
                            WHERE user_id = $user_id
                            AND list_id = '$list_id'
                            AND note_id = '$note_id'
                            LIMIT 1";

                    $result = $database -> query($sql);
                    if ($database -> error) {
                        header('dberror:' . $database -> error);
                        $json['success'] = false;
                        break;
                    }

                    if ($result -> num_rows === 0) {
                        $sql = "INSERT INTO note_list
                                       (user_id, list_id, note_id, content)
                                VALUES ($user_id, '$list_id', '$note_id', '$content')";
                    } else {
                        $sql = "UPDATE note_list
                                SET content = '$content'
                                WHERE user_id = $user_id
                                AND list_id = '$list_id'
                                AND note_id = '$note_id'
                                LIMIT 1";
                    }

                    $result = $database -> query($sql);
                    if ($database -> error) {
                        header('dberror:' . $database -> error);
                        $json['success'] = false;
                        break;
                    }

                    break;

            // Notes
                case 'notes/add':
                case 'notes/edit':
                    if (isset($_POST['group_id'])) {
                        $note_id = filterInput($_POST['group_id'], 'string');

                    } else if (isset($_POST['note_id'])) {
                        $note_id = filterInput($_POST['note_id'], 'string');

                    } else {
                        header("error: No note ID");
                        $json['success'] = false;
                        break;
                    }

                    if (isset($_POST['content'])) {
                        $content = filterInput($_POST['content'], 'string');
                    } else {
                        header("error: No note content");
                        $json['success'] = false;
                        break;
                    }

                    $sql = "SELECT note_box_id
                            FROM note
                            WHERE user_id = $user_id
                            AND note_id = '$note_id'
                            LIMIT 1";

                    $result = $database -> query($sql);
                    if ($database -> error) {
                        header('dberror:' . $database -> error);
                        $json['success'] = false;
                        break;
                    }

                    if ($result -> num_rows === 0) {
                        $sql = "INSERT INTO note
                                       (user_id, note_id, content)
                                VALUES ($user_id, '$note_id', '$content')";
                    } else {
                        $sql = "UPDATE note
                                SET content = '$content'
                                WHERE user_id = $user_id
                                AND note_id = '$note_id'
                                LIMIT 1";
                    }

                    $result = $database -> query($sql);
                    if ($database -> error) {
                        header('dberror:' . $database -> error);
                        $json['success'] = false;
                        break;
                    }

                    break;

                case 'notes/get':
                    if (isset($_POST['group_id'])) {
                        $note_id = filterInput($_POST['group_id'], 'string');
                    } else {
                        header("error: No note ID");
                        $json['success'] = false;
                        break;
                    }

                    $sql = "SELECT note_id, content
                            FROM note
                            WHERE user_id = $user_id
                            AND note_id = '$note_id'
                            LIMIT 1";

                    $result = $database -> query($sql);
                    if ($database -> error || $result -> num_rows === 0) {
                        header('dberror:' . $database -> error);
                        $json['success'] = false;
                        break;
                    }

                    $result = $result -> fetch_object();
                    $json['notes'][0]['note_id'] = $result -> note_id;
                    $json['notes'][0]['text'] = $result -> content;
                    break;

            // Default
                default:
                    exit('Invalid endpoint');
        }

    // Output JSON
        header('Content-Type: application/json');
        $json = json_encode($json);
        exit($json);
