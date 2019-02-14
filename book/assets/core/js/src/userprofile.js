define(['scorm12comms', 'scorm2004comms', "knockout", "service"],
function (scorm12, scorm2004, ko, service)
{
    "use strict";

    //Constructor
    function UserProfile(storageMode, trackingType, pageCount, questionCount, passMark, title, mbook)
    {

        //IMPORTANT
        //Ensures that Class is invoked with "new"
        //Stops private variables leaking into the global namespace
        if (!(this instanceof UserProfile))
        {
            throw new TypeError("UserProfile constructor cannot be called as a function.");
        }

        this.mode = storageMode;
        this.tracking = trackingType;
        this.pageCount = pageCount;
        this.questionCount = questionCount;
        this.passPercentage = passMark / questionCount * 100;
        this.objective = title.replace(/\s/g, "_");
        this.mbook = mbook;

        //used for scorm interactions
        this.interactions = [];

        //Private Variable
        this.data = {
            currentPage: 0,

            //status of each page, construct with pageStatusConstructor()
            pageStatus: [],

            answeredQuestions: 0,

            //list of answered questions
            questionStatus: [],

            //Custom data
            custom: {}
        };

    }

    UserProfile.enum = {
        StorageModes: {
            LOCAL: 0,
            SCORM12: 1,
            SCORM2004: 2,
            SERVICE: 3
        },
        Tracking: {
            PAGE_VIEWS: 0,
            ASSESSMENT: 1
        }
    };

    function pageStatusConstructor()
    {
        this.viewStatus = "unviewed";
        this.locked = false;
    }

    function getHexFromLocation()
    {
        var path = window.location.pathname;
        var hex = "";
        for (var i = 0; i < path.length; i++)
            hex += path.charCodeAt(i).toString(16);
        return hex;
    }

    UserProfile.prototype = {

        //IMPORTANT
        constructor: UserProfile,

        New: function ()
        {

            for (var i = 0; i < this.pageCount; i++)
            {
                this.data.pageStatus.push(new pageStatusConstructor);
            }

        },

        //Public Method
        Save: function ()
        {
            //FOR DEMO, DISABLE SAVING

            this.data.answeredQuestions = this.QuestionsAnswered();

            switch (this.mode)
            {
                //Local storage
                case UserProfile.enum.StorageModes.LOCAL:
                    // !!! USING SAME FUNCTIONALITY FOR SERVICE AS LOCAL STORAGE
                    // !!! FOR NOW TO AVOID BUGS
                    // !!! THIS WILL NEED UPDATING IN THE FUTURE
                case UserProfile.enum.StorageModes.SERVICE:

                    var storageID = "userProfile" + getHexFromLocation();

                    localStorage[storageID] = JSON.stringify(this.data);
                    break;

                case UserProfile.enum.StorageModes.SCORM12:

                    switch (this.tracking)
                    {

                        case UserProfile.enum.Tracking.ASSESSMENT:
                            if (this.QuestionsAnswered() == this.questionCount)
                            {

                                var score = Math.round(this.QuestionsCorrect() / this.questionCount * 100);

                                scorm12.setScore("0", "100", score + "");
                                scorm12.setStatus(score >= this.passPercentage ? "passed" : "failed");

                            }
                            break;
                        case UserProfile.enum.Tracking.PAGE_VIEWS:

                            this.allPagesViewed() && scorm12.setStatus("completed");

                            break;
                        default:
                            console.log("unrecognised tracking type");
                    }

                    scorm12.setSuspendData(this.dataToSuspendString());

                    scorm12.saveInteractions(this.interactions, this.objective);

                    break;

                case UserProfile.enum.StorageModes.SCORM2004:

                    switch (this.tracking)
                    {

                        case UserProfile.enum.Tracking.ASSESSMENT:
                            if (this.QuestionsAnswered() == this.questionCount)
                            {

                                var score = Math.round(this.QuestionsCorrect() / this.questionCount * 100);

                                scorm2004.setScore("0", "100", score + "");
                                scorm2004.setSuccessStatus(score >= this.passPercentage ? "passed" : "failed");
                                scorm2004.setCompletionStatus("completed");

                            }
                            break;

                        case UserProfile.enum.Tracking.PAGE_VIEWS:

                            this.allPagesViewed() && scorm2004.setCompletionStatus("completed");

                            break;
                        default:
                            console.log("unrecognised tracking type");
                    }

                    scorm2004.setSuspendData(this.dataToSuspendString());

                    scorm2004.saveInteractions(this.interactions, this.objective);

                    if (scorm2004.getCompletionStatus() == "completed")
                        scorm2004.finish();

                    break;
                default:
                    console.log("unrecognised mode");
            }
        },

        Read: function ()
        {

            switch (this.mode)
            {

                //Local storage
                case UserProfile.enum.StorageModes.LOCAL:
                    // !!! USING SAME FUNCTIONALITY FOR SERVICE AS LOCAL STORAGE
                    // !!! FOR NOW TO AVOID BUGS
                    // !!! THIS WILL NEED UPDATING IN THE FUTURE
                case UserProfile.enum.StorageModes.SERVICE:

                    var storageID = "userProfile" + getHexFromLocation();

                    if (localStorage.getItem(storageID))
                        this.data = JSON.parse(localStorage.getItem(storageID));
                    else
                        this.New();

                    break;

                case UserProfile.enum.StorageModes.SCORM12:
                    scorm12.initialize();

                    var suspendString = scorm12.getSuspendData();

                    if (suspendString == "")
                    {
                        this.New();
                    }
                    else
                    {
                        this.suspendStringtoData(suspendString);
                    }

                    break;
                case UserProfile.enum.StorageModes.SCORM2004:

                    scorm2004.initialize();

                    var suspendString = scorm2004.getSuspendData();

                    if (suspendString == "")
                    {
                        this.New();
                    }
                    else
                    {
                        this.suspendStringtoData(suspendString);
                    }
            }

            this.QuestionsAnswered(this.data.answeredQuestions);
        },


        PageSetViewedStatus: function (pageIndex, status)
        {
            return this.data.pageStatus[pageIndex].viewStatus = status;
        },

        PageGetViewedStatus: function (pageIndex)
        {
            if (pageIndex != undefined) {
                if (   typeof this.data === "undefined"
                    || typeof this.data.pageStatus[pageIndex] === "undefined"
                    || typeof this.data.pageStatus[pageIndex].viewStatus === "undefined") {
                    return;
                }

                return this.data.pageStatus[pageIndex].viewStatus;
            }
        },

        PageGetLockedStatus: function (pageIndex)
        {
            if (this.data.pageStatus[pageIndex] != undefined)
                return this.data.pageStatus[pageIndex].locked;
        },

        QuestionSubmit: function (id, correct)
        {
            this.data.questionStatus[id] = correct;

            var prevQuestionsAnswers = this.QuestionsAnswered();
            prevQuestionsAnswers++;
            this.QuestionsAnswered(prevQuestionsAnswers);

            this.mbook.AssessmentQuestionAnswered.fire();
        },

        /*QuestionsAnswered: function() {
            return this.data.questionStatus.length;
        },*/

        QuestionsAnswered: ko.observable(0),

        QuestionsCorrect: function ()
        {
            var count = 0;
            for (var i = 0; i < this.data.questionStatus.length; i++)
            {
                if (this.data.questionStatus[i] == true)
                    count++;
            }
            return count;
        },

        ResetQuestionData: function ()
        {
            this.data.answeredQuestions = 0;
            this.data.questionStatus = [];
            this.data.custom = {};
            this.QuestionsAnswered(0);

        },

        ModifyCustomData: function (name, object)
        {
            if (this.data.custom[name] == undefined)
                this.data.custom[name] = [];

            this.data.custom[name] = object;
        },

        GetCustomData: function (name)
        {

            if (this.data.custom[name] == undefined)
                return [];

            return this.data.custom[name];
        },

        dataToSuspendString: function ()
        {

            var suspend = this.data.currentPage + "_";

            this.data.pageStatus.forEach(function (el, i)
            {
                suspend += (el.locked ? "t" : "f") + (el.viewStatus == "viewed" ? "v" : "u") + "_";
            });

            suspend += "aq" + this.data.answeredQuestions + "_";

            this.data.questionStatus.forEach(function (el, i)
            {
                suspend += "q" + i + ":" + (el ? "t" : "f") + "_";
            });

            for (var prop in this.data.custom)
            {
                if (/questionmulti/.test(prop))
                    suspend += prop.replace(/questionmulti(\d+)/, "qm$1") + ":";

                this.data.custom[prop].forEach(function (el, i)
                {
                    suspend += el;
                });
                suspend += "_";

            }

            return suspend.replace(/_+$/, "");

        },

        suspendStringtoData: function (string)
        {
            var elements = string.split("_");

            this.data.currentPage = parseInt(elements.shift());

            var len = elements.length,
              element;

            for (var i = 0; i < len; i++)
            {
                element = elements[i];

                if (element.indexOf("qm") > -1)
                {

                    var parts = element.split(":");

                    parts[0] = parseInt(parts[0].replace(/qm(\d+)/, "$1"));

                    this.data.custom["questionmulti" + parts[0]] = [];

                    for (var j = 0; j < parts[1].length; j++)
                        this.data.custom["questionmulti" + parts[0]].push(parseInt(parts[1][j]));

                }
                else if (element.indexOf("aq") > -1)
                {
                    this.data.answeredQuestions = parseInt(element.substr(2));
                }
                else if (element.indexOf("q") > -1)
                {

                    var parts = element.split(":");

                    parts[0] = parseInt(parts[0].replace(/q(\d+)/, "$1"));

                    this.data.questionStatus[parts[0]] = parts[1] == "t" ? true : false;
                }
                else if ((element[0] == "t" || element[0] == "f") && (element[1] == "v" || element[1] == "u"))
                {
                    this.data.pageStatus.push({
                        locked: element[0] == "t" ? true : false,
                        viewStatus: element[1] == "v" ? "viewed" : "unviewed"
                    });
                }

            }

        },

        allPagesViewed: function ()
        {
            return this.data.pageStatus.every(function (el, i)
            {
                return el.viewStatus == "viewed";
            });
        },

        addInteraction: function (interaction)
        {

            if (typeof interaction != "object")
            {
                console.log("Interactions must be an object");
                return;
            }
            if (!interaction.hasOwnProperty('id') || !interaction.hasOwnProperty('type') ||
              !interaction.hasOwnProperty('response') || !interaction.hasOwnProperty('rightAnswer') ||
              !interaction.hasOwnProperty('result'))
            {
                console.log("An interaction object must have the follow properties: 'id', 'type', 'response', 'rightAnswer' and result");
                return;
            }

            var indexToInsert = 0;

            switch (this.mode)
            {
                //Local storage
                case UserProfile.enum.StorageModes.LOCAL:
                case UserProfile.enum.StorageModes.SERVICE:
                    return;
                case UserProfile.enum.StorageModes.SCORM12:
                    indexToInsert = parseInt(scorm12.getInteractionCount());
                    break;
                case UserProfile.enum.StorageModes.SCORM2004:
                    indexToInsert = parseInt(scorm2004.getInteractionCount());
                    break;
                default:
                    console.log("invalid storage mode");
            }

            this.interactions[indexToInsert] = interaction;

        },

        checkLoggedIn: function ()
        {
            switch (this.mode)
            {
                case UserProfile.enum.StorageModes.LOCAL:
                case UserProfile.enum.StorageModes.SCORM12:
                case UserProfile.enum.StorageModes.SCORM2004:
                    return;

                case UserProfile.enum.StorageModes.SERVICE:
                    return;

                default:
                    console.log("invalid storage mode");
            }
        },

        addNote: function (data, callback)
        {

            switch (this.mode)
            {
                case UserProfile.enum.StorageModes.LOCAL:
                case UserProfile.enum.StorageModes.SCORM12:
                case UserProfile.enum.StorageModes.SCORM2004:
                    return false;
                case UserProfile.enum.StorageModes.SERVICE:
                    service.addNote(data, callback);
                    return true;
                default:
                    console.log("invalid storage mode");
            }

        },

        deleteNote: function (data)
        {

            switch (this.mode)
            {
                case UserProfile.enum.StorageModes.LOCAL:
                case UserProfile.enum.StorageModes.SCORM12:
                case UserProfile.enum.StorageModes.SCORM2004:
                    return;
                case UserProfile.enum.StorageModes.SERVICE:
                    service.deleteNote(data);
                    break;
                default:
                    console.log("invalid storage mode");
            }

        },

        loadNotes: function (data, callback)
        {

            switch (this.mode)
            {
                case UserProfile.enum.StorageModes.LOCAL:
                case UserProfile.enum.StorageModes.SCORM12:
                case UserProfile.enum.StorageModes.SCORM2004:
                    return;
                case UserProfile.enum.StorageModes.SERVICE:
                    service.loadNotes(data, callback);
                    break;
                default:
                    console.log("invalid storage mode");
            }

        },

        editNote: function (data)
        {

            switch (this.mode)
            {
                case UserProfile.enum.StorageModes.LOCAL:
                case UserProfile.enum.StorageModes.SCORM12:
                case UserProfile.enum.StorageModes.SCORM2004:
                    return;
                case UserProfile.enum.StorageModes.SERVICE:
                    service.editNote(data);
                    break;
                default:
                    console.log("invalid storage mode");
            }

        },

        loadNoteList: function(data, callback)
        {
            return service.loadNoteList(data, callback);
        },

        removeNoteFromList: function(data, callback)
        {
            return service.removeNoteFromList(data, callback);
        },

        submitNoteToList: function(data, callback)
        {
            return service.submitNoteToList(data, callback);
        },

        loadNoteCheckbox: function(data, callback)
        {
            switch (this.mode) {
                case UserProfile.enum.StorageModes.LOCAL:
                case UserProfile.enum.StorageModes.SCORM12:
                case UserProfile.enum.StorageModes.SCORM2004:
                    return;

                case UserProfile.enum.StorageModes.SERVICE:
                    return service.loadNoteCheckbox(data, callback);
                    break;

                default:
                    console.log("invalid storage mode");
            }
        },

        submitNoteCheckbox: function(data, callback)
        {
            switch (this.mode) {
                case UserProfile.enum.StorageModes.LOCAL:
                case UserProfile.enum.StorageModes.SCORM12:
                case UserProfile.enum.StorageModes.SCORM2004:
                    return;

                case UserProfile.enum.StorageModes.SERVICE:
                    return service.submitNoteCheckbox(data, callback);

                default:
                    console.log("invalid storage mode");
            }
        },

        loadNoteCameraImage: function(data, callback)
        {
            return service.loadNoteCameraImage(data, callback);
        },

        removeNoteCameraImage: function(data, callback)
        {
            return service.removeNoteCameraImage(data, callback);
        },

        saveNoteCameraImage: function(data, callback)
        {
            return service.saveNoteCameraImage(data, callback);
        }

    };

    return UserProfile;

});
