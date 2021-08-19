const RRule = require('rrule').RRule
const RRuleSet = require('rrule').RRuleSet
const rrulestr = require('rrule').rrulestr

/**
 *  Get proper rrule from a window passed by parameter
 *  @param {String} wPeriod, period of a window
 *  @return {Object} that represents the period of the window in rrule format
 **/
 function getFreq(Wperiod) {
    switch (Wperiod) {
        case "yearly": return RRule.YEARLY
        case "monthly": return RRule.MONTHLY
        case "weekly": return RRule.WEEKLY
        case "daily": return RRule.DAILY
        case "hourly": return RRule.HOURLY
    }
}

/**
 *  Get the difference of an UTC date and the same date in a time zone
 *  @param {Date} date, a date in UTC
 *  @param {String} timeZone, a time zone supported by Intl
 *  @return {Integer} an integer that represents the difference in hours of a date in UTC and
 *  the same date in a time zone
 **/
function getTimeZoneOffset(date, timeZone) {

    // Use the Intl API to get a local ISO 8601 string for a given time zone.
    const options = { timeZone, calendar: 'iso8601', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    const dateTimeFormat = new Intl.DateTimeFormat(undefined, options);
    const parts = dateTimeFormat.formatToParts(date);
    const map = new Map(parts.map(x => [x.type, x.value]));
    const year = map.get('year');
    const month = map.get('month');
    const day = map.get('day');
    const hour = map.get('hour');
    const minute = map.get('minute');
    const second = map.get('second');
    const ms = date.getMilliseconds().toString().padStart(3, '0');
    const iso = `${year}-${month}-${day}T${hour}:${minute}:${second}.${ms}`;

    // Tell to the Date object constructor that it's a UTC time, but it's not.
    const lie = new Date(iso + 'Z');

    // Return the difference in timestamps, as hours
    // Positive values are West of GMT, opposite of ISO 8601
    // this matches the output of `Date.getTimeZoneOffset`
    return -(lie - date) / 60 / 1000 / 60;
}

/**
 * This method returns a set of periods which are based on a dates parameter.
 * @param {Set} dates set of dates
 * @param {String} timeZone agreement's time zone
 * @param {Boolean} filter to filter by division or not
 * @return {Set} set of periods
 * @alias module:gPeriods.getPeriods
 **/
module.exports.getPeriods = function getPeriods(dates, timeZone, filter, Wfrom, Wto) {
    let periods = [];
    for (var i = 0; i < dates.length - 1; i += 2) {
        dates[i + 1].setMilliseconds(999)
        dates[i].setUTCHours(dates[i].getUTCHours() + getTimeZoneOffset(dates[i], timeZone))
        dates[i + 1].setUTCHours(dates[i + 1].getUTCHours() + getTimeZoneOffset(dates[i + 1], timeZone))
        if (filter) {
            if (dates[i + 1] > Wfrom && dates[i + 1] <= Wto) {
                periods.push({
                    from: dates[i].toISOString(),
                    to: dates[i + 1].toISOString()
                });
            }
        } else {
            periods.push({
                from: dates[i].toISOString(),
                to: dates[i + 1].toISOString()
            });
        }
    }
    return periods;
}

/**
 * This method returns a set of dates which are based on a window parameter.
 * @param {Date} from start of dates
 * @param {Date} to end of dates
 * @param {Date} Wto end of window
 * @param {String} period type of period
 * @return {Set} set of dates
 * @alias module:gPeriods.getDates
 **/
module.exports.getDates = function getDates(from, to, period, Wto) {
    const periodTypes = ['yearly', 'monthly', 'weekly', 'daily', 'hourly'];

    if (periodTypes.indexOf(period) >= 0) {
        let rruleInit = new RRule({
            freq: getFreq(period),
            dtstart: from,
            until: to
        });
        let rruleFin = new RRule({
            freq: getFreq(period),
            dtstart: from,
            until: to,
            bysecond: -1
        });

        let rruleSet = new RRuleSet();
        rruleSet.rrule(rruleInit);
        rruleSet.rrule(rruleFin);
        var dates = rruleSet.all();
    } else {
        let rules = period.split("---");
        let initPeriodRule = rrulestr(rules[0]);
        let endPeriodRule = rrulestr(rules[1]);

        let rruleSet = new RRuleSet();
        rruleSet.rrule(initPeriodRule);
        rruleSet.rrule(endPeriodRule);
        var dates = rruleSet.between(new Date(from), new Date(Wto));
    }

    //Sorting dates
    dates.sort(function (a, b) {
        return a - b;
    });

    return dates;
}