import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/map';

export class User
{
    constructor(public name: string)
    {
    }
}

/**
 * @title Display value autocomplete
 */
@Component({
    selector   : 'autocomplete-display-example',
    templateUrl: 'autocomplete-display-example.html',
    styleUrls  : ['autocomplete-display-example.css']
})
export class AutocompleteDisplayExample
{

    myControl = new FormControl();

    options = [
        new User('Mary'),
        new User('Shelley'),
        new User('Igor')
    ];

    filteredOptions: Observable<User[]>;

    ngOnInit()
    {
        this.filteredOptions = this.myControl.valueChanges
                                   .startWith(null)
                                   .map(user => user && typeof user === 'object' ? user.name : user)
                                   .map(name => name ? this.filter(name) : this.options.slice());
    }

    filter(name: string): User[]
    {
        return this.options.filter(option =>
            option.name.toLowerCase().indexOf(name.toLowerCase()) === 0);
    }

    displayFn(user: User): string
    {
        if ( user )
        {
            return user.name;
        }
    }

}
