<?php
    // Load Input
        if (isset($_POST['group_id'])) {
            $groupID = filterInput($_POST['group_id'], 'integer');

        } else if (isset($_POST['note_id'])) {
            $groupID = filterInput($_POST['note_id'], 'integer');

        } else {
            exit('Note ID missing');
        }

        if (isset($_POST['content'])) {
            $content = filterInput($_POST['content'], 'string');
        } else {
            $content = '';
        }

    // Perform Action
        $note = findNote($json, $groupID);

        switch ($endpoint) {
            case 'notes/add':
                if ($note === false) {
                    $id = count($json -> notes);
                    $json -> notes[$id]['id'] = $groupID;
                    $json -> notes[$id]['text'] = $content;
                }

            case 'notes/edit':
                if ($note !== false) {
                    $json -> notes[$note] -> text = $content;
                }

                file_put_contents($path, json_encode($json));
                echo getSuccessJSON($groupID);
                exit();

            case 'notes/delete':
                if ($note === false) {
                    echo getFailureJSON();
                    exit();
                }

                array_splice($json -> notes, $note, 1);
                file_put_contents($path, json_encode($json));
                echo getSuccessJSON($groupID);
                exit();

            case 'notes/get':
                if ($note === false) {
                    echo getFailureJSON();
                    exit();
                }

                echo getNoteJSON($json -> notes[$note] -> id, $json -> notes[$note] -> text);
                exit();

            default:
                die("Endpoint $endpoint is invalid");
        }

    // Utility
        function findNote($json, $id)
        {
            $position = 0;

            foreach ($json -> notes as $note) {
                if ($note -> id === $id) {
                    return $position;
                }

                $position++;
            }

            return false;
        }

        function getNoteJSON($id, $note)
        {
            $json['notes'][0]['note_id'] = $id;
            $json['notes'][0]['text'] = $note;
        }

        function getFailureJSON()
        {
            $json['success'] = false;
            $json['notes'] = array();
        }

        function getSuccessJSON($id)
        {
            $json['note_id'] = $id;
        }
