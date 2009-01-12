/*
 * timeago: a jQuery plugin, version: 0.6.2 (10/14/2008)
 * @requires jQuery v1.2 or later
 *
 * Timeago is a jQuery plugin that makes it easy to support automatically
 * updating fuzzy timestamps (e.g. "4 minutes ago" or "about 1 day ago").
 *
 * For usage and examples, visit:
 * http://timeago.yarp.com/
 *
 * Licensed under the MIT:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright (c) 2008, Ryan McGeary (ryanonjavascript -[at]- mcgeary [*dot*] org)
 */
(function($) {
  $.timeago = function(timestamp) {
    if (timestamp instanceof Date) return inWords(timestamp);
    else if (typeof timestamp == "string") return inWords($.timeago.parse(timestamp));
    else return inWords($.timeago.parse($(timestamp).attr("title")));
  };
  var $t = $.timeago;

  $.extend($.timeago, {
    settings: {
      refreshMillis: 60000,
      allowFuture: false,
      strings: {
        prefixAgo: null,
        prefixFromNow: null,
        suffixAgo: "ago",
        suffixFromNow: "from now",
        ago: null, // DEPRECATED, use suffixAgo
        fromNow: null, // DEPRECATED, use suffixFromNow
        seconds: "less than a minute",
        minute: "about a minute",
        minutes: "%d minutes",
        hour: "about an hour",
        hours: "about %d hours",
        day: "a day",
        days: "%d days",
        month: "about a month",
        months: "%d months",
        year: "about a year",
        years: "%d years"
      }
    },
    inWords: function(distanceMillis) {
      var $l = function(key, v) { return $.timeago.translate_string(key, v) };
      var $ls = this.settings.strings;
      var prefix = $ls.prefixAgo;
      var suffix = $ls.suffixAgo || $ls.ago;
      if (this.settings.allowFuture) {
        if (distanceMillis < 0) {
          prefix = $ls.prefixFromNow;
          suffix = $ls.suffixFromNow || $ls.fromNow;
        }
        distanceMillis = Math.abs(distanceMillis);
      }

      var seconds = distanceMillis / 1000;
      var minutes = seconds / 60;
      var hours = minutes / 60;
      var days = hours / 24;
      var years = days / 365;

      //i don't know if we need to round it here.
      var rseconds = Math.round(seconds);
      var rminutes = Math.round(minutes);
      var rhours   = Math.round(hours);
      var rdays    = Math.round(days);
      var rmonths  = Math.round(days / 30);
      var ryears   = Math.round(years);

      var words = seconds < 45 && sprintf($l('seconds', rseconds), rseconds) ||
        seconds < 90 && $l('minute', 1) ||
        minutes < 45 && sprintf($l('minutes', rminutes), rminutes) ||
        minutes < 90 && $l('hour', 1) ||
        hours < 24 && sprintf($l('hours', rhours), rhours) ||
        hours < 48 && $l('day', 1) ||
        days < 30 && sprintf($l('days', rdays), rdays) ||
        days < 60 && $l('month') ||
        days < 365 && sprintf($l('months', rmonths), rmonths) ||
        years < 2 && $l('year') ||
        sprintf($l('years', ryears), ryears);

      return $.trim([prefix, words, suffix].join(" "));
    },
    parse: function(iso8601) {
      var s = $.trim(iso8601);
      s = s.replace(/-/,"/").replace(/-/,"/");
      s = s.replace(/T/," ").replace(/Z/," UTC");
      s = s.replace(/([\+-]\d\d)\:?(\d\d)/," $1$2"); // -04:00 -> -0400
      return new Date(s);
    },
    translate_string: function(key, val) {
      var str = this.settings.strings[key];
      return (isFunction(str) ? str.call(this, val) : str);
    }
  });

  $.fn.timeago = function() {
    var self = this;
    self.each(refresh);

    var $s = $t.settings;
    if ($s.refreshMillis > 0) {
      setInterval(function() { self.each(refresh); }, $s.refreshMillis);
    }
    return self;
  };

  function refresh() {
    var date = $t.parse(this.title);
    if (!isNaN(date)) {
      $(this).text(inWords(date));
    }
    return this;
  }

  function inWords(date) {
    return $t.inWords(distance(date));
  }

  function distance(date) {
    return (new Date().getTime() - date.getTime());
  }

  // lame sprintf implementation
  function sprintf(string, value) {
    return string.replace(/%d/i, value);
  }

  function isFunction(object) {
    return typeof object == "function";
  }

  // fix for IE6 suckage
  if ($.browser.msie && $.browser.version < 7.0) {
    document.createElement('abbr');
  }
})(jQuery);
