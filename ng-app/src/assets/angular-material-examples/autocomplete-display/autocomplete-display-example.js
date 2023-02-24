"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
require("rxjs/add/operator/startWith");
require("rxjs/add/operator/map");
var User = (function () {
    function User(name) {
        this.name = name;
    }
    return User;
}());
exports.User = User;
/**
 * @title Display value autocomplete
 */
var AutocompleteDisplayExample = (function () {
    function AutocompleteDisplayExample() {
        this.myControl = new forms_1.FormControl();
        this.options = [
            new User('Mary'),
            new User('Shelley'),
            new User('Igor')
        ];
    }
    AutocompleteDisplayExample.prototype.ngOnInit = function () {
        var _this = this;
        this.filteredOptions = this.myControl.valueChanges
            .startWith(null)
            .map(function (user) { return user && typeof user === 'object' ? user.name : user; })
            .map(function (name) { return name ? _this.filter(name) : _this.options.slice(); });
    };
    AutocompleteDisplayExample.prototype.filter = function (name) {
        return this.options.filter(function (option) {
            return option.name.toLowerCase().indexOf(name.toLowerCase()) === 0;
        });
    };
    AutocompleteDisplayExample.prototype.displayFn = function (user) {
        if (user) {
            return user.name;
        }
    };
    return AutocompleteDisplayExample;
}());
AutocompleteDisplayExample = __decorate([
    core_1.Component({
        selector: 'autocomplete-display-example',
        templateUrl: 'autocomplete-display-example.html',
        styleUrls: ['autocomplete-display-example.css']
    })
], AutocompleteDisplayExample);
exports.AutocompleteDisplayExample = AutocompleteDisplayExample;
//# sourceMappingURL=autocomplete-display-example.js.map