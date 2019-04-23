
const DAY = 'day';
import differenceInMilliseconds from 'date-fns/difference_in_milliseconds';

export default {
    diff(date_a, date_b, scale = DAY) {
        let milliseconds, seconds, hours, minutes, days, months, years;
        date_a = new Date(date_a.getFullYear(), date_a.getMonth(), date_a.getDate(), 0, 0, 0);
        date_b = new Date(date_b.getFullYear(), date_b.getMonth(), date_b.getDate(), 0, 0, 0);
        milliseconds = differenceInMilliseconds(date_a, date_b);
        seconds = milliseconds / 1000;
        minutes = seconds / 60;
        hours = minutes / 60;
        days = hours / 24;
        months = days / 30;
        years = months / 12;
        if (!scale.endsWith('s')) {
            scale += 's';
        }

        return Math.floor({
            milliseconds,
            seconds,
            minutes,
            hours,
            days,
            months,
            years
        }[scale]);
    }
};