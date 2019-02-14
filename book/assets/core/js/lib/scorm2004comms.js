/**
 * The scorm2004comms contains the functionality to communite with an LMS using scorm 2004 standards
 * functions include initializing, setting and getting values, and saving score and progress.
 *
 * @class scorm2004comms
 * @example
 * //Require the scorm2004comms module
 * define(["scorm2004comms"], function(scorm2004comms) {
 *
 *     //initialize scorm session
 *     scorm2004comms.initialize()
 *
 * });
 */
define(function() {
  //-------------------------------------------------------------------------------------------------
  // Following code edited by Mark Hopkins, Skills2Learn. Last updated 2013-03-13
  // Outdated Fscommand script removed as all functions now can call Flash using the ExternalInterface class in Flash 8/9. (assumed from scorm12comms.js)
  //-------------------------------------------------------------------------------------------------
  // FS SCORM - fscommand adapter for ADL SCORM 2004 and Flash MX 2004 Learning Interactions
  // version 1.0    12/10/04
  // Modified by Andrew Chemey, Macromedia
  // Based on FS SCORM adapater version 1.2.4:
  //         Fragments Copyright 2002 Pathlore Software Corporation All rights Reserved
  //         Fragments Copyright 2002 Macromedia Inc. All rights reserved.
  //         Fragments Copyright 2003 Click2learn, Inc. All rights reserved.
  //         Developed by Tom King, Macromedia, Leonard Greenberg, Pathlore, and Claude Ostyn, Click2learn, Inc.
  //         Includes code by Jeff Burton and Andrew Chemey, Macromedia (01/09/02)
  // -----------------------------------------------------------------
  // Change these preset values to suit your taste and requirements.
  // Way to search for API object (0 - starts with bottom up; 1 - starts top down)
  var g_bShowApiErrors = false; // change to true to show error messages
  // Translate these strings if g_bShowApiErrors is true and you need to localize the application
  var g_strAPINotFound = "Management system interface not found.";
  var g_strAPITooDeep = "Cannot find API - too deeply nested.";
  var g_strAPIInitFailed = "Found API but LMSInitialize failed.";
  var g_strAPISetError = "Trying to set value but API not available.";
  var g_strDisableErrorMsgs = "Select cancel to disable future warnings.";
  // This value is normally given by the LMS, but in case it is not this is the default value to use to determine passed/failed.
  // Set this null if the Flash actionscript uses its own method to determine passed/fail, otherwise set to a value from 0 to 1 inclusive (may be a floating point value, e.g "0.75".
  var g_SCO_MasteryScore = null; // allowable values: 0.0..1.0, or null
  //==================================================================
  // WARNING!!!
  // Do not modify anything below this line unless you know exactly what you are doing!
  // You should not have to change these two values as the Flash template presets are based on them.
  var g_nSCO_ScoreMin = 0; // must be a number
  var g_nSCO_ScoreMax = 100; // must be a number > nSCO_Score_Min
  // Per SCORM specification, the LMS provided mastery score, if any, will override the SCO in interpreting whether the score should be interpreted when the pass/fail status is determined.
  // The template tries to obtain the mastery score, and if it is available, to set the status to passed or failed accordingly when the SCO sends a score.
  // The LMS may not actually make the determination until the SCO has been terminated.
  // Default value for this flag is true. Set it to false if don't want to predict how the LMS will set pass/fail status based on the mastery score (the LMS will win in the end anyway).
  var g_bInterpretMasteryScore = true;
  // This script implements various aspects of common logic behavior of a SCO.
  /////////// API INTERFACE INITIALIZATION AND CATCHER FUNCTIONS ////////
  var g_nFindAPITries = 0;
  var g_objAPI = null;
  var g_bInitDone = false;
  var g_bFinishDone = false;
  var g_bSCOBrowse = false;
  var g_dtmInitialized = new Date(); // will be adjusted after initialize
  var g_bMasteryScoreInitialized = false;

  //reference to API methods
  var SCOGetValue, SCOSetValue;

  function AlertUserOfAPIError(strText) {
    if (g_bShowApiErrors) {
      var s = strText + "\n\n" + g_strDisableErrorMsgs;
      if (!confirm(s)) {
        g_bShowApiErrors = false;
      }
    }
  }

  function findAPI(win) {
    while (win.API_1484_11 == null && win.parent != null && win.parent != win) {
      g_nFindAPITries++;
      if (g_nFindAPITries > 500) {
        AlertUserOfAPIError(g_strAPITooDeep);
        return null;
      }
      win = win.parent;
    }
    return win.API_1484_11;
  }

  function APIOK() {
    return ((typeof(g_objAPI) != "undefined") && (g_objAPI != null));
  }

  //LMSSetValue is implemented with more complex datamanagement logic below
  var g_bMinScoreAcquired = false;
  var g_bMaxScoreAcquired = false;

  function privReportRawScore(nRaw) { // called only by SCOSetValue
    if (isNaN(nRaw)) return "false";
    if (!g_bMinScoreAcquired) {
      if (g_objAPI.SetValue("cmi.score.min", g_nSCO_ScoreMin + "") != "true") return "false";
    }
    if (!g_bMaxScoreAcquired) {
      if (g_objAPI.SetValue("cmi.score.max", g_nSCO_ScoreMax + "") != "true") return "false";
    }
    if (g_objAPI.SetValue("cmi.score.raw", nRaw) != "true") return "false";
    g_bMinScoreAcquired = false;
    g_bMaxScoreAcquired = false;
    if (!g_bMasteryScoreInitialized) {
      var nTemp = SCOGetValue("cmi.scaled_passing_score");
      nTemp = (nTemp <= 0 ? 0 : nTemp * 100);
      var nMasteryScore = parseInt(nTemp, 10);
      if (!isNaN(nMasteryScore)) g_SCO_MasteryScore = nMasteryScore;
    }
    if ((g_bInterpretMasteryScore) && (!isNaN(g_SCO_MasteryScore))) {
      var stat = (nRaw >= g_SCO_MasteryScore ? "passed" : "failed");
      if (SCOSetValue("cmi.success_status", stat) != "true") return "false";
    }
    return "true";
  }

  function MillisecondsToCMIDuration(n) {
    //Convert duration from milliseconds to 0000:00:00.00 format
    var hms = "";
    var dtm = new Date();
    dtm.setTime(n);
    var h = "000" + Math.floor(n / 3600000);
    var m = "0" + dtm.getMinutes();
    var s = "0" + dtm.getSeconds();
    var cs = "0" + Math.round(dtm.getMilliseconds() / 10);
    hms = "PT" + h.substr(h.length - 4) + "H" + m.substr(m.length - 2) + "M";
    hms += s.substr(s.length - 2) + "S";
    return hms;
  }
  // SCOReportSessionTime is called automatically by this script, but you may call it at any time also from the SCO
  function SCOReportSessionTime() {
    var dtm = new Date();
    var n = dtm.getTime() - g_dtmInitialized.getTime();
    return SCOSetValue("cmi.session_time", MillisecondsToCMIDuration(n));
  }

  function getInteractionTimestamp() {

    var date = new Date(),
      year = date.getFullYear() + "",
      month = date.getMonth() + 1 + "",
      day = date.getDate() + "",
      hours = date.getHours() + "",
      minutes = date.getMinutes() + "",
      seconds = date.getSeconds() + "";

    var retDate = year + "-" + (month.length < 2 ? "0" + month : month) + "-" + (day.length < 2 ? "0" + day : day);
    var retTime = (hours.length < 2 ? "0" + hours : hours) + ":" + (minutes.length < 2 ? "0" + minutes : minutes) + ":" + (seconds.length < 2 ? "0" + seconds : seconds);

    return retDate + "T" + retTime;

  }

  var API = {
    /**
     * Sets a value in the LMS
     * @memberof scorm2004comms
     * @param {String} nam //can be any value from the scorm 2004 standard runtime ref (http://scorm.com/scorm-explained/technical-scorm/run-time/run-time-reference/)
     * @param {String} val //can be any acceptable value for 'nam' as per runtime ref
     * @example
     * ...
     *
     * scorm2004comms.setValue('cmi.completion_status', 'completed');
     *
     * ...
     * @returns {String} true or false as string indicating if successful
     *
     */
    setValue: function(nam, val) {
      var err = "";
      if (!APIOK()) {
        AlertUserOfAPIError(g_strAPISetError + "\n" + nam + "\n" + val);
        err = "false";
      } else if (nam == "cmi.score.raw") err = privReportRawScore(val);
      if (err == "") {
        err = g_objAPI.SetValue(nam, val.toString() + "");
        if (err != "true") return err;
      }
      if (nam == "cmi.score.min") {
        g_bMinScoreAcquired = true;
        g_nSCO_ScoreMin = val;
      } else if (nam == "cmi.score.max") {
        g_bMaxScoreAcquired = true;
        g_nSCO_ScoreMax = val;
      }
      return err
    },

    /**
     * Gets a value from the LMS
     * @memberof scorm2004comms
     * @param {String} nam //can be any value from the scorm 1.2 standard runtime ref (http://scorm.com/scorm-explained/technical-scorm/run-time/run-time-reference/)
     * @example
     * ...
     *
     * scorm2004comms.getValue('cmi.suspend_data');
     *
     * ...
     * @returns {String} value returned from LMS
     *
     */
    getValue: function(nam) {
      return ((APIOK()) ? g_objAPI.GetValue(nam.toString()) : "");
    },

    /**
     * initializes communications with LMS, must be called before any other
     * scorm functions
     * @memberof scorm2004comms
     *
     * @example
     * ...
     *
     * scorm2004comms.initialize();
     *
     * ...
     * @returns {String} true or false as string indicating if successful
     *
     */
    initialize: function() {

      var err = true;
      if (!g_bInitDone) {
        if (window.parent && window.parent != window) {
          g_objAPI = findAPI(window.parent);
        }
        if (g_objAPI == null && window.opener != null) {
          g_objAPI = findAPI(window.opener);
        }
        if (!APIOK()) {
          AlertUserOfAPIError(g_strAPINotFound);
          err = false;
        } else {
          err = g_objAPI.Initialize("");
          if (err == "true") {
            g_bSCOBrowse = (g_objAPI.GetValue("cmi.mode") == "browse");
            if (!g_bSCOBrowse) {
              var compStatus = g_objAPI.GetValue("cmi.completion_status");
              if (compStatus == "not attempted" || compStatus == "unknown") {
                err = g_objAPI.SetValue("cmi.completion_status", "incomplete");
                g_objAPI.Commit("");
              }
            }
          } else {
            AlertUserOfAPIError(g_strAPIInitFailed);
          }
          g_objAPI.SetValue("cmi.exit", "suspend");
        }
        if (typeof(SCOInitData) != "undefined") {
          // The SCOInitData function can be defined in another script of the SCO
          SCOInitData();
        }
        g_dtmInitialized = new Date();
      }
      g_bInitDone = true;
      return (err + ""); // Force type to string
    },

    /**
     * terminates communications with LMS
     * @memberof scorm2004comms
     *
     * @example
     * ...
     *
     * scorm2004comms.finish();
     *
     * ...
     * @returns {String} true or false as string indicating if successful
     *
     */
    finish: function() {
      if ((APIOK()) && (g_bFinishDone == false)) {
        SCOReportSessionTime();

        if (typeof(SCOSaveData) != "undefined") {
          // The SCOSaveData function can be defined in another script of the SCO
          SCOSaveData();
        }
        g_bFinishDone = (g_objAPI.Terminate("") == "true");

      }

      this.setValue("adl.nav.request", "exitAll");
      this.setValue("cmi.exit", "normal");

      return (g_bFinishDone + ""); // Force type to string
    },

    /**
     * Persists all data to LMS
     * @memberof scorm2004comms
     * @example
     * ...
     *
     * scorm2004comms.commit();
     *
     * ...
     * @returns {String} true or false as string indicating if successful
     *
     */
    commit: function() {
      return ((APIOK()) ? g_objAPI.Commit("") : "false");
    },

    /**
     * Sets a min, max and raw score values in the LMS
     * @memberof scorm2004comms
     * @param {String} min //number as string - minimum achievable score
     * @param {String} max /number as string - maximum achievable score
     * @param {String} raw //number as string - learners score
     * @example
     * ...
     *
     * scorm2004comms.setScore('0', '100', '80')
     *
     * ...
     */
    setScore: function(min, max, raw) {
      if (!min) throw new Error("min score is not defined");
      if (!max) throw new Error("max score is not defined");
      if (!raw) throw new Error("raw score is not defined");

      this.setValue("cmi.score.min", min + "");
      this.setValue("cmi.score.max", max + "");
      this.setValue("cmi.score.raw", raw + "");

      this.commit();
    },

    /**
     * Sets completion status of course in LMS
     * @memberof scorm2004comms
     * @param {String} status //status to set in LMS, must be acceptabe value for 'cmi.completion_status' as per scorm 1.2 standard runtime ref (http://scorm.com/scorm-explained/technical-scorm/run-time/run-time-reference/)
     * @example
     * ...
     *
     * scorm2004comms.setCompletionStatus('completed')
     *
     * ...
     */
    setCompletionStatus: function(status) {
      if (!status) throw new Error("status is not defined");

      status += "";

      if (status != "completed" && status != "incomplete" && status != "not attempted" && status != "unknown")
        throw new Error("invalid status: " + status);

      this.setValue("cmi.completion_status", status);

      this.commit();
    },

    /**
     * Sets success status of course in LMS
     * @memberof scorm2004comms
     * @param {String} status //status to set in LMS, must be acceptabe value for 'cmi.success_status' as per scorm 1.2 standard runtime ref (http://scorm.com/scorm-explained/technical-scorm/run-time/run-time-reference/)
     * @example
     * ...
     *
     * scorm2004comms.setSuccessStatus('passed')
     *
     * ...
     */
    setSuccessStatus: function(status) {
      if (!status) throw new Error("status is not defined");

      status += "";

      if (status != "passed" && status != "failed" && status != "unknown")
        throw new Error("invalid status: " + status);

      this.setValue("cmi.success_status", status);

      this.commit();
    },

    /**
     * Sets interaction data in the LMS
     * @memberof scorm2004comms
     * @param {Array} interactions //array of interactions to be saved to LMS
     * @param {String} objective //name of objective associated with interaction
     * @example
     * ...
     *
     * scorm2004comms.saveInteractions([{
     *     id: "Multiple_Choice_MultiChoice_0",
     *     response: "cum_soluta_nobis_est_eligendi_optio",
     *     result: "correct",
     *     rightAnswer: "cum_soluta_nobis_est_eligendi_optio",
     *     type: "choice"
     * }], "mBook2_title")
     *
     * ...
     */
    saveInteractions: function(interactions, objective) {

      var n = parseInt(this.getInteractionCount());
      var len = interactions.length,
        interaction;

      for (; n < len; ++n) {
        interaction = interactions[n];

        this.setValue("cmi.interactions." + n + ".id", interaction.id);
        this.setValue("cmi.interactions." + n + ".type", interaction.type);
        this.setValue("cmi.interactions." + n + ".result", interaction.result);
        this.setValue("cmi.interactions." + n + ".weighting", "0");
        this.setValue("cmi.interactions." + n + ".objectives.0.id", objective);
        this.setValue("cmi.interactions." + n + ".timestamp", getInteractionTimestamp());
        this.setValue("cmi.interactions." + n + ".learner_response", interaction.response.trim().replace(/\.$/, "").replace(/\s|\.|,|\(|\)|\[|\]|\{|\}/g, "_").replace(/_{2,}/g, "_").toLowerCase());
        this.setValue("cmi.interactions." + n + ".correct_responses.0.pattern", interaction.rightAnswer.trim().replace(/\.$/, "").replace(/\s|\.|,|\(|\)|\[|\]|\{|\}/g, "_").replace(/_{2,}/g, "_").toLowerCase());
        this.setValue("cmi.interactions." + n + ".latency", "PT0S");
        this.setValue("cmi.interactions." + n + ".description", interaction.description || "");
      }

      this.commit();

    },

    /**
     * Gets LMS suspend data
     * @memberof scorm2004comms
     * @example
     * ...
     *
     * scorm2004comms.getSuspendData()
     *
     * ...
     * @returns {String} //suspend data from lms
     *
     */
    getSuspendData: function() {

      return this.getValue("cmi.suspend_data");

    },

    /**
     * Sets LMS suspend data
     * @memberof scorm2004comms
     * @param {String} dataString //string of data to set in LMS, must meet critera for 'cmi.suspend_data' as per scorm 1.2 standard runtime ref (http://scorm.com/scorm-explained/technical-scorm/run-time/run-time-reference/)
     * @example
     * ...
     *
     * scorm2004comms.setSuspendData('somedatatosaveinlms')
     *
     * ...
     */
    setSuspendData: function(dataString) {

      if (!dataString) throw new Error("Suspend data is not defined");

      this.setValue("cmi.suspend_data", dataString + "");

      this.commit();

    },

    /**
     * Gets LMS coutse completion status
     * @memberof scorm2004comms
     * @example
     * ...
     *
     * scorm2004comms.getCompletionStatus()
     *
     * ...
     * @returns {String} completion status from lms
     *
     */
    getCompletionStatus: function() {

      return this.getValue("cmi.completion_status");

    },

    /**
     * Sets interaction data in the LMS
     * @memberof scorm2004comms
     * ...
     *
     * scorm2004comms.getInteractionIndex()
     *
     * ...
     * @returns {String} number, as a string, of interactions stored in LMS
     */
    getInteractionCount: function() {
      return this.getValue("cmi.interactions._count");
    }

  };

  //store reference to API methods for internal use
  SCOSetValue = API.setValue;
  SCOGetValue = API.getValue;

  return API;

});