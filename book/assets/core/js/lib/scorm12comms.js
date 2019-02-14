/**
 * The scorm12comms contains the functionality to communite with an LMS using scorm 1.2 standards
 * functions include initializing, setting and getting values, and saving score and progress.
 *
 * @class scorm12comms
 * @example
 * //Require the scorm12comms module
 * define(["scorm12comms"], function(scorm12comms) {
 *
 * 	//initialize scorm session
 * 	scorm12comms.initialize()
 *
 * });
 */
define(function() {

  //-------------------------------------------------------------------------------------------------
  // Following code edited by Lee Inskip, Skills2Learn. Last updated 2010-01-21
  // Outdated Fscommand script removed as all functions now can call Flash using the ExternalInterface class in Flash 8/9.
  // privReportRawScore() updated to handle null mastery score to prevent status being changed to passed
  // SCOSetFullObjectiveData() added to set all objective data in one call
  //-------------------------------------------------------------------------------------------------
  // FS SCORM - fscommand adapter for ADL SCORM 1.2 and Flash MX 2004 Learning Interactions
  // version 1.0    08/19/03
  // Modified by Andrew Chemey, Macromedia
  // Based on FS SCORM adapater version 1.2.4:
  // 		Fragments Copyright 2002 Pathlore Software Corporation All rights Reserved
  // 		Fragments Copyright 2002 Macromedia Inc. All rights reserved.
  // 		Fragments Copyright 2003 Click2learn, Inc. All rights reserved.
  // 		Developed by Tom King, Macromedia,
  // 		             Leonard Greenberg, Pathlore,
  // 		             and Claude Ostyn, Click2learn, Inc.
  // 		Includes code by Jeff Burton and Andrew Chemey, Macromedia (01/09/02)
  // -----------------------------------------------------------------
  // Change these preset values to suit your taste and requirements.
  var g_bShowApiErrors = false; // change to true to show error messages
  // Translate these strings if g_bShowApiErrors is true
  // and you need to localize the application
  var g_strAPINotFound = "Management system interface not found.";
  var g_strAPITooDeep = "Cannot find API - too deeply nested.";
  var g_strAPIInitFailed = "Found API but LMSInitialize failed.";
  var g_strAPISetError = "Trying to set value but API not available.";
  var g_strDisableErrorMsgs = "Select cancel to disable future warnings.";
  // This value is normally given by the LMS, but in case it is not
  // this is the default value to use to determine passed/failed.
  // Set this null if the Flash actionscript uses its own method
  // to determine passed/fail, otherwise set to a value from 0 to 1
  // inclusive (may be a floating point value, e.g "0.75".
  var g_SCO_MasteryScore = null; // allowable values: 0.0..1.0, or null
  //==================================================================
  // WARNING!!!
  // Do not modify anything below this line unless you know exactly what
  // you are doing!
  // You should not have to change these two values as the Flash template
  // presets are based on them.
  var g_nSCO_ScoreMin = 0; // must be a number
  var g_nSCO_ScoreMax = 100; // must be a number > nSCO_Score_Min
  // Per SCORM specification, the LMS provided mastery score,
  // if any, will override the SCO in interpreting whether the score
  // should be interpreted when the pass/fail status is determined.
  // The template tries to obtain the mastery score, and if it
  // is available, to set the status to passed or failed accordingly
  // when the SCO sends a score. The LMS may not actually make the
  // determination until the SCO has been terminated.
  // Default value for this flag is true. Set it to false if don't
  // want to predict how the LMS will set pass/fail status based on
  // the mastery score (the LMS will win in the end anyway).
  var g_bInterpretMasteryScore = true;
  // This script implements various aspects of
  // common logic behavior of a SCO.
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

  function FindAPI(win) {
    while (win.API == null && win.parent != null && win.parent != win) {
      g_nFindAPITries++;
      if (g_nFindAPITries > 500) {
        AlertUserOfAPIError(g_strAPITooDeep);
        return null;
      }
      win = win.parent;
    }
    return win.API;
  }

  function APIOK() {
    return (typeof(g_objAPI) != "undefined" && g_objAPI != null);
  }

  //LMSSetValue is implemented with more complex data
  //management logic below
  var g_bMinScoreAcquired = false;
  var g_bMaxScoreAcquired = false;

  function privReportRawScore(nRaw) { // called only by SCOSetValue
    if (isNaN(nRaw)) return "false";
    if (!g_bMinScoreAcquired) {
      if (g_objAPI.LMSSetValue("cmi.core.score.min", g_nSCO_ScoreMin + "") != "true") return "false";
    }
    if (!g_bMaxScoreAcquired) {
      if (g_objAPI.LMSSetValue("cmi.core.score.max", g_nSCO_ScoreMax + "") != "true") return "false";
    }
    if (g_objAPI.LMSSetValue("cmi.core.score.raw", nRaw) != "true") return "false";
    g_bMinScoreAcquired = false;
    g_bMaxScoreAcquired = false;
    if (!g_bMasteryScoreInitialized) {
      var nMasteryScore = parseInt(SCOGetValue("cmi.student_data.mastery_score"), 10);
      if (!isNaN(nMasteryScore)) g_SCO_MasteryScore = nMasteryScore;
    }

    if ((g_bInterpretMasteryScore) && (!isNaN(g_SCO_MasteryScore) && g_SCO_MasteryScore != null)) {
      var stat = (nRaw >= g_SCO_MasteryScore ? "passed" : "failed");
      if (SCOSetValue("cmi.core.lesson_status", stat) != "true") return "false";
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
    hms = h.substr(h.length - 4) + ":" + m.substr(m.length - 2) + ":";
    hms += s.substr(s.length - 2) + "." + cs.substr(cs.length - 2);
    return hms;
  }
  // SCOReportSessionTime is called automatically by this script,
  // but you may call it at any time also from the SCO
  function SCOReportSessionTime() {
    var dtm = new Date();
    var n = dtm.getTime() - g_dtmInitialized.getTime();
    return SCOSetValue("cmi.core.session_time", MillisecondsToCMIDuration(n));
  }

  function getInteractionTime() {

    var date = new Date();
    var hours = date.getHours() + "";
    var minutes = date.getMinutes() + "";
    var seconds = date.getSeconds() + "";

    var ret = (hours.length < 2 ? "0" + hours : hours) + ":" + (minutes.length < 2 ? "0" + minutes : minutes) + ":" + (seconds.length < 2 ? "0" + seconds : seconds);

    return ret;
  }

  var API = {
    /**
     * initializes communications with LMS, must be called before any other
     * scorm functions
     * @memberof scorm12comms
     *
     * @example
     * ...
     *
     * scorm12comms.initialize();
     *
     * ...
     * @returns {String} true or false as string indicating if successful
     *
     */
    initialize: function() {
      var err = true;
      if (!g_bInitDone) {
        if (window.parent && window.parent != window) {
          g_objAPI = FindAPI(window.parent);
        }
        if (g_objAPI == null && window.opener != null) {
          g_objAPI = FindAPI(window.opener);
        }
        if (!APIOK()) {
          AlertUserOfAPIError(g_strAPINotFound);
          err = false;
        } else {
          err = g_objAPI.LMSInitialize("");
          if (err == "true") {
            g_bSCOBrowse = (g_objAPI.LMSGetValue("cmi.core.lesson_mode") == "browse");
            if (!g_bSCOBrowse) {
              if (g_objAPI.LMSGetValue("cmi.core.lesson_status") == "not attempted") {
                err = g_objAPI.LMSSetValue("cmi.core.lesson_status", "incomplete");
              }
            }
          } else {
            AlertUserOfAPIError(g_strAPIInitFailed);
          }
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
     * Sets a value in the LMS
     * @memberof scorm12comms
     * @param {String} nam //can be any value from the scorm 1.2 standard runtime ref (http://scorm.com/scorm-explained/technical-scorm/run-time/run-time-reference/)
     * @param {String} val //can be any acceptable value for 'nam' as per runtime ref
     * @example
     * ...
     *
     * scorm12comms.setValue('cmi.core.lesson_status', 'passed');
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
      } else if (nam == "cmi.core.score.raw") err = privReportRawScore(val);
      if (err == "") {
        err = g_objAPI.LMSSetValue(nam, val.toString() + "");
        if (err != "true") return err;
      }
      if (nam == "cmi.core.score.min") {
        g_bMinScoreAcquired = true;
        g_nSCO_ScoreMin = val;
      } else if (nam == "cmi.core.score.max") {
        g_bMaxScoreAcquired = true;
        g_nSCO_ScoreMax = val;
      }
      return err;
    },

    /**
     * Gets a value from the LMS
     * @memberof scorm12comms
     * @param {String} nam //can be any value from the scorm 1.2 standard runtime ref (http://scorm.com/scorm-explained/technical-scorm/run-time/run-time-reference/)
     * @example
     * ...
     *
     * scorm12comms.getValue('cmi.suspend_data');
     *
     * ...
     * @returns {String} value returned from LMS
     *
     */
    getValue: function(nam) {
      return ((APIOK()) ? g_objAPI.LMSGetValue(nam.toString()) : "");
    },

    /**
     * Persists all data to LMS
     * @memberof scorm12comms
     * @example
     * ...
     *
     * scorm12comms.commit();
     *
     * ...
     * @returns {String} true or false as string indicating if successful
     *
     */
    commit: function() {
      return ((APIOK()) ? g_objAPI.LMSCommit("") : "false");
    },

    /**
     * terminates communications with LMS
     * @memberof scorm12comms
     *
     * @example
     * ...
     *
     * scorm12comms.finish();
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
        g_bFinishDone = (g_objAPI.LMSFinish("") == "true");
      }
      return (g_bFinishDone + ""); // Force type to string
    },

    /**
     * Sets a min, max and raw score values in the LMS
     * @memberof scorm12comms
     *
     * @param {String} min number as string - minimum achievable score
     * @param {String} max number as string - maximum achievable score
     * @param {String} raw number as string - learners score
     * @example
     * ...
     *
     * scorm12comms.setScore('0', '100', '80')
     *
     * ...
     *
     */
    setScore: function(min, max, raw) {
      if (!min) throw new Error("min score is not defined");
      if (!max) throw new Error("max score is not defined");
      if (!raw) throw new Error("raw score is not defined");

      this.setValue("cmi.core.score.min", min + "");
      this.setValue("cmi.core.score.max", max + "");
      this.setValue("cmi.core.score.raw", raw + "");

      this.commit();
    },

    /**
     * Sets status of course in LMS
     * @memberof scorm12comms
     *
     * @param {string} status status to set in LMS, must be acceptabe value for 'cmi.core.lesson_status' as per scorm 1.2 standard runtime ref (http://scorm.com/scorm-explained/technical-scorm/run-time/run-time-reference/)
     * @example
     * ...
     *
     * scorm12comms.setStatus('passed')
     *
     * ...
     */
    setStatus: function(status) {
      if (!status) throw new Error("status is not defined");

      status += "";

      if (status != "passed" && status != "completed" && status != "failed" &&
        status != "incomplete" && status != "browsed" && status != "not attempted")
        throw new Error("invalid status: " + status);

      this.setValue("cmi.core.lesson_status", status);

      this.commit();
    },

    /**
     * Sets LMS suspend data
     * @memberof scorm12comms
     * @param {String} dataString //string of data to set in LMS, must meet critera for 'cmi.suspend_data' as per scorm 1.2 standard runtime ref (http://scorm.com/scorm-explained/technical-scorm/run-time/run-time-reference/)
     * @example
     * ...
     *
     * scorm12comms.setSuspendData('somedatatosaveinlms')
     *
     * ...
     */
    setSuspendData: function(dataString) {

      if (!dataString) throw new Error("Suspend data is not defined");

      this.setValue("cmi.suspend_data", dataString + "");

      this.commit();

    },

    /**
     * Gets LMS suspend data
     * @memberof scorm12comms
     * @example
     * ...
     *
     * scorm12comms.getSuspendData()
     *
     * ...
     * @returns {String} //suspend data from lms
     *
     */
    getSuspendData: function() {

      return this.getValue("cmi.suspend_data");

    },

    /**
     * Sets interaction data in the LMS
     * @memberof scorm12comms
     * @param {Array} interactions //array of interactions to be saved to LMS
     * @param {String} objective //name of objective associated with Interaction
     * ...
     *
     * scorm12comms.saveInteractions([{
     *     id: "Multiple_Choice_MultiChoice_0",
     *     response: "Cum soluta nobis est eligendi optio. (Correct)",
     *     result: "correct",
     *     rightAnswer: "Cum soluta nobis est eligendi optio. (Correct)",
     *     type: "choice"
     * }], "mBook2_title")
     *
     * ...
     */
    saveInteractions: function(interactions, objective) {

      if (!interactions) throw new Error("interactions is not defined");
      if (!objective && objective !== 0) throw new Error("objective is not defined");

      var n = parseInt(this.getInteractionCount());
      var len = interactions.length,
        interaction;

      for (; n < len; ++n) {
        interaction = interactions[n];

        this.setValue("cmi.interactions." + n + ".id", interaction.id);
        this.setValue("cmi.interactions." + n + ".type", interaction.type);
        this.setValue("cmi.interactions." + n + ".learner_response", interaction.response);
        this.setValue("cmi.interactions." + n + ".correct_responses.0.pattern", interaction.rightAnswer);
        this.setValue("cmi.interactions." + n + ".result", interaction.result);
        this.setValue("cmi.interactions." + n + ".weighting", "0");
        this.setValue("cmi.interactions." + n + ".objectives.0.id", objective);
        this.setValue("cmi.interactions." + n + ".time", getInteractionTime());
      }

      this.commit();

    },

    /**
     * Sets interaction data in the LMS
     * @memberof scorm12comms
     * ...
     *
     * scorm12comms.getInteractionIndex()
     *
     * ...
     * @returns {String} number, as a string, of interactions stored in LMS
     */
    getInteractionCount: function() {
      return this.getValue("cmi.interactions._count");
    }
  };

  //store reference to API methods for internal use
  SCOGetValue = API.getValue;
  SCOSetValue = API.setValue;

  return API;
});