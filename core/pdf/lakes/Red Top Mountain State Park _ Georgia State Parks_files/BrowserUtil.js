(function (window) {

    if (typeof (window.BrowserUtil) != "undefined") {
        return;
    }

    var BrowserUtil = function () {
        /*** Properties ***/
        // An array of query string names and values
        this.queryStringParams = (function (arrayQueryString) {
            if (arrayQueryString == "") return {};
            var nameValueCollection = {};
            for (var i = 0; i < arrayQueryString.length; ++i) {
                // Break up the name/value pair into a separate name and value
                var nameValuePair = arrayQueryString[i].split('=');
                if (nameValuePair.length != 2) continue; // If there is no querystring value, then skip it.
                // Add the querystring name and value to the collection.
                nameValueCollection[nameValuePair[0]] = decodeURIComponent(nameValuePair[1].replace(/\+/g, " "));
            }
            return nameValueCollection;
        })(window.location.search.substr(1).split('&')); // Pass an array of the querystring name/value pairs to the anonymous function and execute it.

        this.host = location.host.toLowerCase();
    }

    /*** Methods ***/
    // Retrieve the value of the cookie with the specified name.
    BrowserUtil.prototype.getCookie = function (cookieName) {
        var i, currentCookieName, currentCookieValue;

        // Cookies are separated by semicolons
        var cookies = document.cookie.split(";");

        for (i = 0; i < cookies.length; i++) {
            // A name/value pair (a crumb) is separated by an equal sign
            currentCookieName = cookies[i].substr(0, cookies[i].indexOf("="));
            currentCookieValue = cookies[i].substr(cookies[i].indexOf("=") + 1);
            currentCookieName = currentCookieName.replace(/^\s+|\s+$/g, "");
            if (currentCookieName.toLowerCase() == cookieName.toLowerCase()) {
                return unescape(currentCookieValue);
            }
        }

        // A cookie with the requested name does not exist
        return "";
    }

    // Create a cookie with the specified name, value, and optional days to keep before expiration
    BrowserUtil.prototype.setCookie = function (cookieName, cookieValue, daysToKeep) {
        var expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + daysToKeep);
        var newCookieValue = escape(cookieValue) + ((daysToKeep == null || daysToKeep == '') ? "" : "; expires=" + expirationDate.toUTCString());
        document.cookie = cookieName + "=" + newCookieValue;
    }

    // Delete the cookie with the specified name.
    BrowserUtil.prototype.deleteCookie = function (cookieName) {
        document.cookie = cookieName + "=; expires=Fri, 31 Dec 1999 23:59:59 GMT;";
    }

    // Create BrowserUtil and expose it to the global object
    window.BrowserUtil = new BrowserUtil();

})(window);

if (typeof (jQuery.cachedScript) == "undefined") {
    // The jQuery.getScript() method sets the cache to false.
    // Use the cachedScript() method to get the script using the browser's cached version if there is one.
    jQuery.cachedScript = function (url, options) {
        // allow user to set any option except for dataType, cache, and url
        options = $.extend(options || {}, {
            dataType: "script",
            cache: true,
            url: url
        });
        // Use $.ajax() since it is more flexible than $.getScript
        // Return the jqXHR object so we can chain callbacks
        return jQuery.ajax(options);
    };
}

/*!
* makeLinksAbsolute jQuery plugin
* Converts relative links to absolute links using the specified domain
*/
(function ($) {
    $.fn.makeLinksAbsolute = function (options) {
        // default configuration
        var settings = $.extend({}, {
            domain: null
        }, options);

        // main function
        function processLink(element) {
            var $element = $(element);

            if (element.tagName != 'A') {
                return;
            }

            var href = $element.attr('href'); // get the href attribute value
            
            if (typeof(href) == 'undefined' ||
            href.length == 0 ||
            href.charAt(0) == '#' ||
            href.substr(0, 4) == 'http' ||
            href.substr(0, 10) == 'javascript') {
                return;
            }

            if (settings.domain.charAt(settings.domain.length - 1) == '/') {
                settings.domain = settings.domain.substr(0, settings.domain.length - 1);
            }

            href = element.href; // get the full url of this relative link

            var currentDomain = location.href.substring(0, location.href.indexOf(location.pathname)); // get the domain used for relative links
            href = href.replace(currentDomain, settings.domain); // replace the domain in the relative link
            $element.attr('href', href); // update the element's href attribute
        }

        if (settings.domain != null && settings.domain.length != 0) {
            // initialize every element
            this.each(function () {
                processLink(this);
            });
        }

        return this;
    };
})(jQuery);
