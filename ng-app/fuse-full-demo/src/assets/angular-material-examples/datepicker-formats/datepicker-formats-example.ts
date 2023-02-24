import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

import * as moment from 'moment';

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const MY_FORMATS = {
    parse  : {
        dateInput: 'LL'
    },
    display: {
        dateInput         : 'LL',
        monthYearLabel    : 'MMM YYYY',
        dateA11yLabel     : 'LL',
        monthYearA11yLabel: 'MMMM YYYY'
    }
};

/** @title Datepicker with custom formats */
@Component({
    selector   : 'datepicker-formats-example',
    templateUrl: 'datepicker-formats-example.html',
    styleUrls  : ['datepicker-formats-example.css'],
    providers  : [
        // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
        // application's root module. We provide it at the component level here, due to limitations of
        // our example generation script.
        {provide    : DateAdapter,
            useClass: MomentDateAdapter,
            deps    : [MAT_DATE_LOCALE]
        },

        {provide    : MAT_DATE_FORMATS,
            useValue: MY_FORMATS
        }
    ]
})
export class DatepickerFormatsExample
{
    date = new FormControl(moment());
}
