<?php
    function filterInput($input, $type)
    {
        switch ($type) {
            case 'string':
                return filter_var($input, FILTER_SANITIZE_STRING);

            case 'integer':
                return filter_var($input, FILTER_VALIDATE_INT);

            default:
                die("Filter type '$type' invalid");
        }
    }
