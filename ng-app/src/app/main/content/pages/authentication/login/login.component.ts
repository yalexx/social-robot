import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FuseConfigService} from '../../../../../core/services/config.service';
import {fuseAnimations} from '../../../../../core/animations';
import {Router} from "@angular/router";
import {AuthenticationService} from "../../../../../core/services/authentication.service";

@Component({
  selector: 'fuse-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: fuseAnimations
})
export class FuseLoginComponent implements OnInit {
  loginForm: FormGroup;
  loginFormErrors: any;

  constructor(private fuseConfig: FuseConfigService,
              private formBuilder: FormBuilder,
              private router: Router,
              private _authService: AuthenticationService) {
    this.fuseConfig.setSettings({
      layout: {
        navigation: 'none',
        toolbar: 'none',
        footer: 'none'
      }
    });

    this.loginFormErrors = {
      email: {},
      password: {}
    };
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.loginForm.valueChanges.subscribe(() => {
      this.onLoginFormValuesChanged();
    });
  }

  login() {
    const val = this.loginForm.value;

    if (val.email && val.password) {

      console.log('email: ', val.email);
      this._authService.login(val.email, val.password)
        .subscribe(
          (data) => {
            console.log("User is logged in", data);
            this.router.navigateByUrl('/');
          });
    }
  }

  onLoginFormValuesChanged() {
    for (const field in this.loginFormErrors) {
      if (!this.loginFormErrors.hasOwnProperty(field)) {
        continue;
      }

      // Clear previous errors
      this.loginFormErrors[field] = {};

      // Get the control
      const control = this.loginForm.get(field);

      if (control && control.dirty && !control.valid) {
        this.loginFormErrors[field] = control.errors;
      }
    }
  }
}
