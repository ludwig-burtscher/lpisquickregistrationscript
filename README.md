LPIS Quick Registration Script
===========================
by Ludwig Burtscher\
based on TISS Quick Registration Script by Manuel Geier (https://github.com/mangei/tissquickregistrationscript)

## What is it about?
It is very hard to get into the course (LVA) you want if many other students also try to register for the same course. Especially on WU you have to be faster the the others. To avoid the stressful moment when the registration slots open, the use of an automatic script seems appropriate. It tries to outperform manual registration through a very fast response time.


### A brief description of the script and its possibilities
The UserScript helps you to get into the course you want on LPIS fully automatically. You can tell the script your preferred courses and it will register you for the first available course of your choice. It even deals with waitlists. When the script encounters a course in the list of your preferences and no regular spot is free, it assigns you to the waitlist before continuing the search for a potential assured spot in another course of your preference. If you don’t want the script to do everything automatically, the focus is already set on the right button, so you only need to confirm. You can also set a specific time when the script should reload the page and start. If the registration button is still disabled at that point, the script performs refreshes of the page until the button gets activated or a configured maximum of refreshes is reached.


## Requirements

* Google Chrome with [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo "Tampermonkey"), or
* Firefox with [Greasemonkey](https://addons.mozilla.org/de/firefox/addon/greasemonkey "Greasemonkey")


## Usage

1. Download the UserScript and install it to Tampermonkey/Greasemonkey.
1. Configure the script (see Configuration) to fulfill your requirements for a specific registration to a course.
1. Go to the specific course registration webpage in LPIS, where you want to register.
1. Enable the script.
1. Lean back and let the script do its job (it automatically starts if you entered a start date or starts immediately if no start date is configured).
1. Don’t forget to disable the UserScript if the registration is done.


## Configuration

See documentation within the script.