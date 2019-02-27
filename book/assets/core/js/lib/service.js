define([], function() {
    var root = "http://localhost:8000/powertrain3/mbookservice/";
    return {
        addNote: function(data, handleResponse) {
            $.ajax({
                    url: root + "notes/add",
                    method: "post",
                    data: data,
                    contentType: "application/x-www-form-urlencoded; charset=utf-8",
                    dataType: "json"
                })
                .done(function(data) {
                    if (data.success) {
                        console.log("success: note added");
                        handleResponse(data);
                    }
                })
                .fail(function(jq, text, error) {
                    console.log(jq.status + " - " + text + " - " + error);
                });
        },

        deleteNote: function(data) {
            $.ajax({
                    url: root + "notes/delete",
                    method: "post",
                    data: data,
                    contentType: "application/x-www-form-urlencoded; charset=utf-8",
                    dataType: "json"
                })
                .done(function(data) {
                    if (data.success)
                        console.log("success: note deleted");
                })
                .fail(function(jq, text, error) {
                    console.log(jq.status + " - " + text + " - " + error);
                });
        },

        editNote: function(data) {
            $.ajax({
                    url: root + "notes/edit",
                    method: "post",
                    data: data,
                    contentType: "application/x-www-form-urlencoded; charset=utf-8",
                    dataType: "json"
                })
                .done(function(data) {
                    if (data.success)
                        console.log("success: note updated");
                })
                .fail(function(jq, text, error) {
                    console.log(jq.status + " - " + text + " - " + error);
                });
        },

        loadNotes: function(data, handleResponse) {
            $.ajax({
                    url: root + "notes/get",
                    method: "post",
                    data: data,
                    contentType: "application/x-www-form-urlencoded; charset=utf-8",
                    dataType: "json"
                })
                .done(function(data) {
                    handleResponse(data);
                })
                .fail(function(jq, text, error) {
                    console.log(jq.status + " - " + text + " - " + error);
                });
        },

        checkLoggedIn: function() {
            return true;
        },

        loadNoteList: function(data, callback)
        {
            $.ajax({
                url: root + "note-list/get",
                method: "post",
                data: data,
                contentType: "application/x-www-form-urlencoded; charset=utf-8",
                dataType: "json"
            })
            .done(function(data) {
                callback(data);
            })
            .fail(function(jq, text, error) {
                console.log("Note Checkbox:", jq.status + " - " + text + " - " + error);
            });
        },

        removeNoteFromList: function(data, callback)
        {
            $.ajax({
                url: root + "note-list/delete",
                method: "post",
                data: data,
                contentType: "application/x-www-form-urlencoded; charset=utf-8",
                dataType: "json"
            })
            .done(function(data) {
                callback(data);
            })
            .fail(function(jq, text, error) {
                console.log("Note Checkbox:", jq.status + " - " + text + " - " + error);
            });
        },

        submitNoteToList: function(data, callback)
        {
            $.ajax({
                url: root + "note-list/put",
                method: "post",
                data: data,
                contentType: "application/x-www-form-urlencoded; charset=utf-8",
                dataType: "json"
            })
            .done(function(data) {
                callback(data);
            })
            .fail(function(jq, text, error) {
                console.log("Note Checkbox:", jq.status + " - " + text + " - " + error);
            });
        },

        loadNoteCheckbox: function(data, callback) {
            $.ajax({
                    url: root + "note-checkbox/get",
                    method: "post",
                    data: data,
                    contentType: "application/x-www-form-urlencoded; charset=utf-8",
                    dataType: "json"
                })
                .done(function(data) {
                    callback(data);
                })
                .fail(function(jq, text, error) {
                    console.log("Note Checkbox:", jq.status + " - " + text + " - " + error);
                });
        },

        submitNoteCheckbox: function(data, callback) {
            $.ajax({
                    url: root + "note-checkbox/put",
                    method: "post",
                    data: data,
                    contentType: "application/x-www-form-urlencoded; charset=utf-8",
                    dataType: "json"
                })
                .done(function(data) {
                    callback(data);
                })
                .fail(function(jq, text, error) {
                    console.log("Note Checkbox:", jq.status + " - " + text + " - " + error);
                });
        },

        loadNoteCameraImage: function(data, callback)
        {
            $.ajax({
                url: root + "note-camera/get",
                method: "post",
                data: data,
                contentType: "application/x-www-form-urlencoded; charset=utf-8",
                dataType: "json"
            })
            .done(function(data) {
                callback(data);
            })
            .fail(function(jq, text, error) {
                console.log("Note Checkbox:", jq.status + " - " + text + " - " + error);
            });
        },

        removeNoteCameraImage: function(data, callback)
        {
            $.ajax({
                url: root + "note-camera/delete",
                method: "post",
                data: data,
                contentType: "application/x-www-form-urlencoded; charset=utf-8",
                dataType: "json"
            })
            .done(function(data) {
                callback(data);
            })
            .fail(function(jq, text, error) {
                console.log("Note Checkbox:", jq.status + " - " + text + " - " + error);
            });
        },

        saveNoteCameraImage: function(data, callback)
        {
            $.ajax({
                url: root + "note-camera/put",
                method: "post",
                data: data,
                contentType: "application/x-www-form-urlencoded; charset=utf-8",
                dataType: "json"
            })
            .done(function(data) {
                callback(data);
            })
            .fail(function(jq, text, error) {
                console.log("Note Camera:", jq.status + " - " + text + " - " + error);
            });
        }
    };
});
