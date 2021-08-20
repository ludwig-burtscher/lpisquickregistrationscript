// ==UserScript==
// @name        LPIS Quick Registration Script
// @description Script to help you to get into the lva you want.
// @match       https://lpis.wu.ac.at/*
// @author      Ludwig Burtscher
// @copyright   2018+, Ludwig Burtscher (based on TISS Quick Registration Script from Manuel Geier; https://github.com/mangei/tissquickregistrationscript); THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE
// @grant       none
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// ==/UserScript==


(function LpisQuickRegistrationClass() {
    var self = this;

    ///////////////////////////////////////////////////////////////////////
    // Configure the script here
    //

    var options = {
        // global option to enable or disable the script [true,false]
        scriptEnabled: true,

        // list of course numbers in order of preference [String]
        lvaNumber: ["0001", "0002", "0003"],

        // automatically presses the register button if it is available [true,false]
        autoRegister: true,

        // maximum retries if button is deactivated [Integer]
        maxRetriesIfFailed: 5,

        // let the script start at a specific time [true,false]
        startAtSpecificTime: true,

        // define the specific time the script should start [Date]
        // new Date(year, month, day, hours, minutes, seconds, milliseconds)
        // note: months start with 0
        specificStartTime: new Date(2018, 2-1, 17, 14, 0, 0, 0),

        // if a specific time is defined, the script will refresh some ms sooner to adjust a delay [Integer]
        delayAdjustmentInMs: 300,

        // show log output of the script on screen [true,false]
        showLog: true
    };

    //
    // End of configuration
    ///////////////////////////////////////////////////////////////////////


    self.init = function () {
        self.lpisQuickRegistration();
    };

    self.lpisQuickRegistration = function () {
        if (options.scriptEnabled) {
            self.initPreference();

            self.pageLog("LPIS Quick Registration Script enabled");
            self.pageLog("LVA Number: " + self.getLVANumber());
            self.pageLog("LVA Name: " + self.getLVAName());
            self.pageLog("Lecturer: " + self.getLecturer());
            self.pageLog("Semester: " + self.getSemester());

            if (options.startAtSpecificTime) {
                self.pageLog("Scripts starts at: " + self.getFormattedDate(options.specificStartTime));
                self.pageLog("Delay adjustment in ms: " + options.delayAdjustmentInMs);
                self.startTimer(options.specificStartTime.getTime() - options.delayAdjustmentInMs);
            } else {
                self.analysePage();
            }
        } else {
            self.pageLog("LPIS Quick Registration Script disabled");
        }
    };


    /**
     * The following functions might need to be changed
     * if LPIS page layout changes.
     */
    //retrieves the row with the LVA specified by options.lvaNumber
    self.getLVATableRow = function () {
        return $('.b3k-data tbody tr td').filter(function() {
            return $(this).children('a').text() == options.lvaNumber[self.getPreference()];
        }).closest('tr');
    };
    self.getLVANumber = function () {
        return options.lvaNumber[self.getPreference()];
    };
    self.getLVANumbers = function () {
        return options.lvaNumber.toString();
    };
    self.getLVAName = function () {
        var row = self.getLVATableRow();
        return $(row).find('.ver_title').contents().eq(2).text();
    };
    self.getSemester = function () {
        var row = self.getLVATableRow();
        return $(row).find('.ver_id span').text();
    };
    self.getLecturer = function () {
        var row = self.getLVATableRow();
        return $(row).find('.ver_title div').text();
    };
    self.getRegistrationButton = function () {
        var row = self.getLVATableRow();
        return $(row).find(".action form input[value='anmelden']");
    };
    self.getWaitlistButton = function () {
        var row = self.getLVATableRow();
        return $(row).find(".action form input[value='eintragen']");
    };
    self.getWaitlistCancelButton = function () {
        var row = self.getLVATableRow();
        return $(row).find(".action form input[value='austragen']");
    };
    self.getCancelButton = function () {
        var row = self.getLVATableRow();
        return $(row).find(".action a").filter(function(index) {
            return $(this).text() === "ABmelden";
        });
    };


    /**
     * Action definitions for each relevant page
     */
    self.onDonePage = function () {
        self.pageOut("Successfully registered for LVA " + options.lvaNumber[self.getPreference()] + ". This is preference number " + (self.getPreference() + 1));
        self.removePreference();
    };
    //button to register on waitlist passed as argument
    self.onWaitlistPage = function (waitlistButton) {
        self.clickButton(waitlistButton);
    };
    self.onWaitlistCancelPage = function () {
        self.initPreference();
        self.incrementPreference();

        if (self.getPreference() < options.lvaNumber.length) {
            //further preferences available
            self.pageOut("Selecting next preference.");
            self.analysePage();
        } else {
            //no further preferences available
            self.pageOut("No further preferences given. Exiting.");
            return;
        }
    };
    //registration button passed as argument
    self.onLVAPage = function (registrationButton) {
        self.clickButton(registrationButton);
    };


    /**
     * Decide, which page is currently loaded
     */
    self.analysePage = function () {
        var registrationButton = self.getRegistrationButton();
        var waitlistButton = self.getWaitlistButton();
        var waitlistCancelButton = self.getWaitlistCancelButton();
        var cancelButton = self.getCancelButton();

        if (registrationButton.length > 0) {
            //there is a registration button
            if ($(registrationButton).is(':disabled')) {
                //registration button is still disabled --> refresh page
                self.initRetryCount();
                self.incrementRetryCount();

                if (self.getRetryCount() <= options.maxRetriesIfFailed) {
                    self.refreshPage();
                } else {
                    //maximum number of retries reached --> exiting
                    self.removePreference();
                    self.removeRetryCount();
                    self.pageOut("Reached specified maximum number of retries without success. Exiting.");
                    return;
                }
            } else {
                //registration button is active --> click it
                self.onLVAPage(registrationButton);
            }
        } else if (cancelButton.length > 0) {
            //successfully registered
            self.onDonePage();
        } else if (waitlistButton.length > 0) {
            //only waitlist possible
            self.onWaitlistPage(waitlistButton);
        } else if (waitlistCancelButton.length > 0) {
            //registered for waitlist --> continue with next preference
            self.onWaitlistCancelPage();
        } else {
            //encountered unrecognized page
            self.pageOut("Unrecognized page. Doing nothing.");
            self.removePreference();
            return;
        }
    };


    /**
     * Own helper functions
     */
    //highlights button, sets focus and clicks the button if autoRegister is true
    self.clickButton = function (button) {
        self.highlight(button);
        button.focus();

        if (options.autoRegister) {
            button.click();
        } else {
            self.pageOut("Did not click button because autoRegister is false");
        }
    };
    self.initPreference = function () {
        if (localStorage.getItem("preference") === null) {
            localStorage.setItem("preference", "0");
        }
    };
    self.getPreference = function() {
        return parseInt(localStorage.getItem("preference"));
    };
    self.incrementPreference = function() {
        var p = parseInt(localStorage.getItem("preference")) + 1;
        localStorage.setItem("preference", p);
    };
    self.removePreference = function () {
        localStorage.removeItem("preference");
    };
    self.initRetryCount = function () {
        if (localStorage.getItem("retry") === null) {
            localStorage.setItem("retry", "0");
        }
    };
    self.getRetryCount = function () {
        return parseInt(localStorage.getItem("retry"));
    };
    self.incrementRetryCount = function () {
        var p = parseInt(localStorage.getItem("retry")) + 1;
        localStorage.setItem("retry", p);
    };
    self.removeRetryCount = function () {
        localStorage.removeItem("retry");
    };


    /**
     * Functions taken from TISS Quick registration script
     * Copyright by Manuel Geier (https://github.com/mangei/tissquickregistrationscript)
     */
    self.startTimer = function (startTime) {
        var offset = startTime - new Date().getTime();
        if (offset > 0) {
            self.startRefreshTimer(startTime);
        } else if ((offset + 60000) > 0) {
            self.analysePage();
        } else {
            self.pageOut("Specified starting time is in the past. Did nothing.");
        }
    };
    self.startRefreshTimer = function (startTime) {
        self.printTimeToStart(startTime);

        var maxMillis = 2147483647;
        var offset = startTime - new Date().getTime();

        // prevent an overflow
        if (offset > maxMillis) {
            offset = maxMillis;
        }

        window.setTimeout(self.refreshPage, offset);
    };
    self.printTimeToStart = function (startTime) {
        var offset = (startTime - new Date().getTime()) / 1000;
        var out = "Refresh in: " + offset + " seconds";
        self.log(out);

        self.pageCountdown(out);

        window.setTimeout(function () {
            self.printTimeToStart(startTime);
        }, 1000);
    };
    self.refreshPage = function () {
        location.reload();
    };
    self.pageOut = function (text) {
        var out = self.getOutputField();
        out.text(text);
    };
    self.pageCountdown = function (text) {
        var out = self.getCountdownField();
        out.text(text);
    };
    self.pageLog = function (text) {
        self.appendToLogField(text);
    };
    self.getOutputField = function () {
        var outputField = $('#LQRScriptOutput');
        if (outputField.length === 0) {
            self.injectOutputField();
            outputField = self.getOutputField();
        }
        return outputField;
    };
    self.getCountdownField = function () {
        var countdownField = $('#LQRScriptCountdown');
        if (countdownField.length === 0) {
            self.injectCountdownField();
            countdownField = self.getCountdownField();
        }
        return countdownField;
    };
    self.getLogField = function () {
        var logField = $('#LQRScriptLog');
        if (logField.length === 0) {
            self.injectLogField();
            logField = self.getLogField();
            if (options.showLog) {
                logField.show();
            } else {
                logField.hide();
            }
        }
        return logField;
    };
    self.injectOutputField = function () {
        var el = $('.b3k-data');
        var log = $('#LQRScriptLog');
        if (log.length) {
            el = log;
        }
        el.before('<div id="LQRScriptOutput" style="color: red; font-weight: bold; font-size: 14pt; padding: 8px 0px;"></div>');
    };
    self.injectCountdownField = function () {
        var el = $('.b3k-data');
        var log = $('#LQRScriptLog');
        if (log.length) {
            el = log;
        }
        el.before('<div id="LQRScriptCountdown" style="color: blue; font-weight: bold; font-size: 14pt; padding: 8px 0px;"></div>');
    };
    self.injectLogField = function () {
        $('.b3k-data').before('<div id="LQRScriptLog" style="color: black; background-color: #FFFCD9; font-size: 10pt;"><b>Information Log:</b></div>');
    };
    self.appendToLogField = function (text) {
        var log = self.getLogField();
        var newText = log.html() + "<br />" + text;
        log.html(newText);
    };
    self.highlight = function (object) {
        object.css("background-color", "lightgreen");
    };
    self.getFormattedDate = function (date) {
        return "" + date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + ":" + date.getMilliseconds();
    };
    self.log = function (message) {
        console.log(message);
    };


    // Initialize the script
    self.init();
})();
