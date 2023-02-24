import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/map';

/**
 * @title Filter autocomplete
 */
@Component({
    selector   : 'autocomplete-filter-example',
    templateUrl: 'autocomplete-filter-example.html',
    styleUrls  : ['autocomplete-filter-example.css']
})
export class AutocompleteFilterExample
{

    myControl: FormControl = new FormControl();

    options = [
        'One',
        'Two',
        'Three'
    ];

    filteredOptions: Observable<string[]>;

    ngOnInit()
    {
        this.filteredOptions = this.myControl.valueChanges
                                   .startWith(null)
                                   .map(val => val ? this.filter(val) : this.options.slice());
    }

    filter(val: string): string[]
    {
        return this.options.filter(option =>
            option.toLowerCase().indexOf(val.toLowerCase()) === 0);
    }

}
