function getStaticContentUrl(itemID, mode) {
    var path = '';
    var nameExtension = '';

    if (typeof (mode) == 'string' && mode != 'n') {
        nameExtension = '-' + mode;
    }

    // ItemID: 43605 
    // /page/0/0/43/605.htm
    // 2/147/483/647
    // 2147483647

    var itemIDString = itemID;
    if (typeof (itemID) != 'string') {
        itemIDString = itemID.toString();
    }

    var folderID = ''

    switch (itemIDString.length) {
        case 1:
        case 2:
        case 3:
            folderID = "0/0/0/" + itemIDString;
            break;
        case 4:
        case 5:
        case 6:
            folderID = "0/0/" +
                    itemIDString.substring(0, itemIDString.length - 3) + "/" +
                    itemIDString.substring(itemIDString.length - 3);
            break;
        case 7:
        case 8:
        case 9:
            folderID = "0/" +
                    itemIDString.substring(0, itemIDString.length - 6) + "/" +
                    itemIDString.substring(itemIDString.length - 6, itemIDString.length - 3) + "/" +
                    itemIDString.substring(itemIDString.length - 3);
            break;
        case 10:
            folderID = itemIDString.substring(0, itemIDString.length - 9) + "/" +
                    itemIDString.substring(itemIDString.length - 9, itemIDString.length - 6) + "/" +
                    itemIDString.substring(itemIDString.length - 6, itemIDString.length - 3) + "/" +
                    itemIDString.substring(itemIDString.length - 3);
            break;
    }

    path = "/page/" + folderID + nameExtension + ".htm";
    return path;
}

var userInfo = function () {

    this.userID = 0;
    this.userAccess = 0;
    this.itemAccess = 0;
    this.partnerAccess = 0;
    this.accessLevelText = '';
    this.relationAccess = 0;
    this.relationStatus = 0;
    this.firstName = '';
    this.lastName = '';
    this.fullName = '';
    this.notificationCount = 0;
    this.notificationSummary = '';
    this.message = '';
    this.makeStatic = false;
    var thisObject = this;

    function init() {

        // Assumes jQuery and /core/elements/javascript/BrowserUtil.js have already been loaded.

        // Create a Deferred object
        var defer = $.Deferred();

        // Set this object as a promise
        defer.promise(thisObject);

        var host = BrowserUtil.host;
        var queryStringParams = $.extend({}, BrowserUtil.queryStringParams); // make a copy of the querystring collection
        var jsonUrl = "/core/item/lookup/info.aspx";

        var cookieName = "cookie";
        if (host.indexOf("localhost") >= 0 || host.indexOf("review") >= 0) {
            cookieName = "ReviewCookie";
        }

        var cookieValue = BrowserUtil.getCookie(cookieName);
        var jsonHostSet = typeof (jsonHost) != "undefined" && jsonHost.length > 0; //jsonHost is defined in the static page

        if (cookieValue != '' || jsonHostSet) {
            var url = '';
            if (jsonHostSet) { // if this is a static page
                if (host.indexOf("review") >= 0) {
                    url += 'http://' + host; // on review domain, assume a virtual path to the live static page. Use the review domain instead.
                }
                else {
                    url += jsonHost;
                }
            }

            url += jsonUrl;
            if (typeof (queryStringParams.s) == "undefined") {
                if (typeof (itemID) != "undefined" && typeof (siteID) != "undefined") {
                    queryStringParams.s = itemID + '.0.0.' + siteID;
                }
            }
            else {
                var sValues = queryStringParams.s.split('.');
                if (sValues.length > 0 && parseInt(sValues[0]) <= 0 && typeof (itemID) != "undefined" && typeof (siteID) != "undefined") {
                    queryStringParams.s = itemID + '.0.0.' + siteID; // s value item is 0 (could be a route), use the page variable
                }
            }
            if (host.indexOf("localhost") >= 0 && typeof (queryStringParams.s) == "undefined") {
                alert('The s query string value is missing');
                return;
            }
            if (host.indexOf("localhost") >= 0 && typeof (queryStringParams.db) == "undefined") {
                alert('The db query string value is missing');
                return;
            }
            if (typeof (queryStringParams.message) != "undefined") {
                delete queryStringParams.message; // No need to include the message in the url. The message can cause errors if it contains html
            }

            queryStringParams.json = 1;

            url = url + "?" + $.param(queryStringParams);
            if (jsonHostSet) {
                url += "&callback=?"; // Make a JSONP call
            }

            $.getJSON(url, function (data) {
                if (typeof (data.message) != 'undefined') {
                    thisObject.message = data.message;
                }

                if (data.status == true) {
                    thisObject.userID = data.userInfo.userID;
                    thisObject.userAccess = data.userInfo.userAccess;
                    thisObject.itemAccess = data.userInfo.itemAccess;
                    thisObject.partnerAccess = data.userInfo.partnerAccess;
                    thisObject.accessLevelText = data.userInfo.accessLevelText;
                    thisObject.firstName = data.userInfo.firstName;
                    thisObject.lastName = data.userInfo.lastName;
                    thisObject.fullName = data.userInfo.fullName;
                    thisObject.notificationCount = data.userInfo.notificationCount;
                    thisObject.notificationSummary = data.userInfo.notificationSummary;
                    thisObject.makeStatic = data.userInfo.makeStatic;
                }
                else {
                    if (host.indexOf("localhost") >= 0) {
                        // alert(data.errorDetails);
                    }
                }

                defer.resolve(thisObject); // Notify the subscribers with the populated user info (if logged in).
            });
        }
        else {
            defer.resolve(thisObject); // User not logged in. Notify the subscribers with the empty user info.
        }
    }
    init();
}
function loadUserAccess(userState) {
    // Also used by pages without .Net
    if (userState.userAccess >= 1) {
        var relationAccess = Math.max(userState.relationAccess, userState.partnerAccess);
        //alert('userState.relationAccess ' + userState.relationAccess);
        //alert('userState.partnerAccess ' + userState.partnerAccess); // Was 9 when not in group.
        $('.user-0').show(); // show elements for anonymous users
        for (var i = 1; i <= 9; i++) {
            if (relationAccess >= i) {
                $('.group-' + i).show();
            }
            if (userState.userAccess >= i) {
                $('.user-' + i).show();
            }
            if (userState.userAccess == i) {
                $('.user-' + i + '-only').show();
            }
        }
        for (var i = 0; i <= 9; i++) {
            if (relationAccess == i) {
                $('.group-' + i + '-only').show();
            }
        }
    }
    else {
        $('.user-0').show();
        $('.user-0-only').show();
    }

    for (var i = 1; i <= 9; i++) {
        if (userState.userAccess <= i) {
            $('.user-' + i + '-below').show();
        }
    }
}

// Expand/Contract top menus
function ToggleMenu(id) {
    if (document.all) {
        if (document.all[id]) {
            if(document.all[id].style.display == 'none') {
                document.all[id].style.display = '';
            } else {
                document.all[id].style.display = 'none';
            }
        }
    } else if (document.getElementById) {
        if(document.getElementById(id)) {
            if(document.getElementById(id).style.display == 'none' || document.getElementById(id).style.display == '') {
                document.getElementById(id).style.display = 'block';
                //alert("set to block " + document.getElementById(id).style.display);
            } else {
                //alert("none");
                document.getElementById(id).style.display = 'none';
            }
        }
    } 
}

$(function () { // Once JQuery has loaded
    $('#browserTopToggle').live('click', function () {
        ToggleMenu('BrowserTopDiv');
        $('.mainNavHolder').show(); // Incase hidden by mobile icon when browser narrow.
    });
    $('#toggleMenuAccount').live('click', function () {
        ToggleMenu('menuUser');
    });
});

//function renderEditTabs(userAccess, itemAccess, itemID, siteID, tabFilters) {
function renderEditTabs(userAccess, partnerAccess, itemAccess, siteID, partnerID, itemID, tabFilters) {
    //alert('renderEditTabs');
    if (partnerID > 0 && (userAccess >= 4 || itemAccess >= 4 || partnerAccess >= 3)) 
    {
        //alert('partnerID: ' + partnerID);
        // EDIT TABS
        //$("#editTabs").html(""); // Clear 

        var sValue = 's=' + partnerID + '.0.0.' + siteID;

        var editTabs = '<!-- Item Edit Buttons -->';
        // display:none;
        editTabs += '<div id="access" style="float:right;"><nav id="itemMenu" class="itemMenu-nojs itemMenuHorizontal"><ul id="menu-main" class="itemMenu">';

        // DETAILS
        editTabs += '<li class="menu-item ss-nav-menu-mega"><a class="active" href="/info/' + partnerID + '"><span class="im-title">Details</span></a>';
        //<ul class="sub-menu sub-menu-1" style="min-width:150px"><li><ul class="sub-menu sub-menu-2">
        //editTabs += '<li><a href="/info/' + partnerID + '?siteid=' + siteID + '"><span class="im-title">Group Details</span></a></li>';
        //</ul></li></ul>
        editTabs += '</li>';

        // EVENTS
        if (tabFilters["baseTypeID"] != 2 && !tabFilters["omitEvents"]) {
            editTabs += '<li class="menu-item ss-nav-menu-mega"><a href="/calendar/?p=' + partnerID + '&siteid=' + siteID + '"><span class="im-title">Calendar</span></a><ul class="sub-menu sub-menu-1" style="min-width:150px"><li><ul class="sub-menu sub-menu-2">';
            if (tabFilters["openHouseTitle"]) {
                editTabs += '<li><a href="/net/calendar/addevent.aspx?LocationID=' + partnerID + '&eventloc=2&title=' + tabFilters["openHouseTitle"] + '"><span class="im-title">Add Open House</span></a></li>';
            } else {
                editTabs += '<li><a href="/net/calendar/addevent.aspx?' + sValue + '&p=' + partnerID + '"><span class="im-title">Add New Event</span></a></li>';
            }
            editTabs += '<li><a href="/calendar?p=' + partnerID + '&siteid=' + siteID + '"><span class="im-title">Calendar</span></a></li>';
            editTabs += '<li><a href="/calendar?show=list&p=' + partnerID + '&siteid=' + siteID + '"><span class="im-title">Event List</span></a></li>';
            //editTabs += '<li><a href="/info/' + partnerID + '?eventview=previous&siteid=' + siteID + '"><span class="im-title">Previous Events</span></a></li>';
            editTabs += '</ul></li></ul></li>';
        }

        if (tabFilters["baseTypeID"] == 2) { // EVENT
            editTabs += '<li class="menu-item ss-nav-menu-mega"><a href="/net/content/contacts.aspx?' + sValue + '"><span class="im-title">Individuals</span></a><ul class="sub-menu sub-menu-1" style="min-width:140px"><li><ul class="sub-menu sub-menu-2">';
            editTabs += '<li><a href="/net/content/contacts.aspx?' + sValue + '"><span class="im-title">Related Individuals</span></a></li>';
            editTabs += '<li><a href="/account/add?relationAccess=2&siteid=' + siteID + '&p=' + partnerID + '"><span class="im-title">Add Individuals</span></a></li>';
            editTabs += '<li><a href="/send/?' + sValue + '&p=' + partnerID + '"><span class="im-title">Write Individuals</span></a></li>';
            editTabs += '</ul></li></ul></li>';
        } else if (tabFilters["baseTypeID"] == 8) {
            editTabs += '<li class="menu-item ss-nav-menu-mega"><a href="/account/add?relationAccess=2&siteid=' + siteID + '&p=' + partnerID + '&publiccontact=1"><span class="im-title">Individuals</span></a><ul class="sub-menu sub-menu-1" style="min-width:140px"><li><ul class="sub-menu sub-menu-2">';
            editTabs += '<li><a href="/net/content/contacts.aspx?' + sValue + '"><span class="im-title">Related Individuals</span></a></li>';
            editTabs += '<li><a href="/account/add?relationAccess=2&siteid=' + siteID + '&p=' + partnerID + '&publiccontact=1"><span class="im-title">Add Contacts</span></a></li>';
            editTabs += '<li><a href="/account/add?relationAccess=2&siteid=' + siteID + '&p=' + partnerID + '"><span class="im-title">Add Individuals</span></a></li>';

            editTabs += '</ul></li></ul></li>';
        } else {
            // INDIVIDUALS
            //editTabs += '<li class="menu-item ss-nav-menu-mega"><a href="/renew/' + partnerID + '?siteid=' + siteID + '"><span class="im-title">Individuals</span></a><ul class="sub-menu sub-menu-1" style="min-width:140px"><li><ul class="sub-menu sub-menu-2">';
            editTabs += '<li class="menu-item ss-nav-menu-mega"><a href="#"><span class="im-title">Individuals</span></a><ul class="sub-menu sub-menu-1" style="min-width:140px"><li><ul class="sub-menu sub-menu-2">';
            editTabs += '<li><a href="/net/content/contacts.aspx?' + sValue + '"><span class="im-title">View Group</span></a></li>';
            editTabs += '<li style="display: none;" class="user-4 group-4"><a href="/core/member/list.aspx?s=' + partnerID  + '&format=street"><span class="im-title">Search Group</span></a></li>';
            if (partnerID == 8795 || partnerID == 35) {
                editTabs += '<li><a href="/members/paid/' + partnerID  + '"><span class="im-title">Paid Members</span></a></li>';
            }
            editTabs += '<li><a href="/account/add?relationAccess=2&siteid=' + siteID + '&p=' + partnerID + '"><span class="im-title">Add Member</span></a></li>';
            editTabs += '<li><a href="/send/?' + sValue + '&p=' + partnerID + '"><span class="im-title">Write Group</span></a></li>';
            if (tabFilters["level3Title"]) {
                editTabs += '<li><a href="/send/?glevel=3&' + sValue + '&p=' + partnerID + '"><span class="im-title">' + tabFilters["level3Title"] + '</span></a></li>';
            }
            editTabs += '<li><a href="/account/add?' + sValue + '&p=' + partnerID + '"><span class="im-title">Add Individual</span></a></li>';
            
            if (tabFilters["familyGroupTitle"]) {
                editTabs += '<li><a href="/core/directory/families.aspx?' + sValue + '"><span class="im-title">' + tabFilters["familyGroupTitle"] + '</span></a></li>';
            }
            editTabs += '</ul></li></ul></li>';
        }

        // IMAGES & FILES
        editTabs += '<li style="display: none;" class="menu-item ss-nav-menu-mega user-4 group-4"><a href="/elements/' + itemID + '?siteid=' + siteID + '"><span class="im-title">Images &amp; Files</span></a><ul class="sub-menu sub-menu-1" style="min-width:120px;"><li><ul class="sub-menu sub-menu-2">';
        if (itemID != partnerID) {
            editTabs += '<li><a href="/elements/' + itemID + '?siteid=' + siteID + '"><span class="im-title">Page Attachments</span></a></li>';
            editTabs += '<li><a href="/elements/' + partnerID + '?siteid=' + siteID + '"><span class="im-title">Group Attachments</span></a></li>';
        } else {
            editTabs += '<li><a href="/elements/' + itemID + '?siteid=' + siteID + '"><span class="im-title">View Attachments</span></a></li>';
        }
        editTabs += '<li><a href="/core/item/upload.aspx?s=' + itemID + '&siteid=' + siteID + '"><span class="im-title">Add Image/File</span></a></li>';
        if (itemID != partnerID) {
            editTabs += '<li><a href="/core/item/upload.aspx?' + sValue + '"><span class="im-title">Add To Group</span></a></li>';
        }
        editTabs += '</ul></li></ul></li>';

        /*
        // MAKE CHANGES
        editTabs += '<li class="menu-item ss-nav-menu-mega"><a href="/core/item/edit.aspx?' + sValue + '"><span class="im-title">Make Changes</span></a><ul class="sub-menu sub-menu-1" style="min-width:100px"><li><ul class="sub-menu sub-menu-2">';
        if (itemID > 0) {
            editTabs += '<li><a href="/core/item/edit.aspx?s=' + itemID + '&siteid=' + siteID + '"><span class="im-title">Edit Page</span></a></li>';
        }
        if (tabFilters["editDetails"]) {
            editTabs += '<li><a href="' + tabFilters["editDetails"] + '"><span class="im-title">' + tabFilters["editDetailsTitle"] + '</span></a></li>';
        } else if (partnerID > 0) {
            editTabs += '<li><a href="/net/org/edit.aspx?' + sValue + '"><span class="im-title">Edit Group</span></a></li>';
        }
        if (tabFilters["baseTypeID"] == 2) { // Event
            //editTabs += '<li><a href="/net/calendar/editnew.aspx?' + sValue + '"><span class="im-title">Edit Event</span></a></li>';
        }
        //editTabs += '<li><a href="/core/item/add.aspx?parentid=' + partnerID + '&siteid=' + siteID + '"><span class="im-title">Add Subtopic</span></a></li>';
        //editTabs += '<li><a href="/net/location/addressedit.aspx?' + sValue + '"><span class="im-title">Edit Address</span></a></li>';
        editTabs += '<li style="display:none" class="user-9"><a href="/net/content/relatedsites.aspx?' + sValue + '"><span class="im-title">Related Websites</span></a></li>';
        if (userAccess >= 9) {
            editTabs += '<li><a href="/add-project/?s=0.' + partnerID + '.0.' + siteID + '"><span class="im-title">Add Task</span></a></li>';
        }
        editTabs += '<li><a href="/net/content/admin.aspx?s=' + itemID + '&siteid=' + siteID + '"><span class="im-title">Page Admin...</span></a></li>';
        editTabs += '</ul></li></ul></li>';
        */

        editTabs += '</ul></nav></div>';
        // <div style="clear:both"></div>
        if (userAccess >= 9) {
            //editTabs += '<div>basetTypeID: ' + tabFilters["baseTypeID"] + ', typeID ' + tabFilters["typeID"] + '</div>';
        }

        

        editTabs += '<div style="clear:both"></div><!-- End Item Edit Buttons -->';

        var appendToDiv = tabFilters['appendToDiv'];
        if (!appendToDiv) appendToDiv = '#afterTitle';
        //alert("appendToDiv: " + appendToDiv);
        $(appendToDiv).append(editTabs);
        $('#itemEditButtons').show();
    }
}


