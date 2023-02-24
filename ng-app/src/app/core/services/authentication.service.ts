import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/share';
import * as moment from 'moment';


import 'rxjs/add/operator/do';
@Injectable()
export class AuthenticationService {

  constructor(private http: HttpClient) {
  }

  login(email: string, password: string) {
    return this.http.post(`http://http://social-robots.ddns.net:3334/user/login`, {
      email, password
    }).do((res) => {
      this.setSession(res)
    });

  }

  private setSession(authResult) {
    console.log('setSession: ', authResult);
    const expiresAt = moment().add(authResult.expiresIn, 'second');
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('user_id', authResult.id);
    localStorage.setItem('user_email', authResult.email);
    localStorage.setItem("expires_at", JSON.stringify(expiresAt.valueOf()));
  }

  public logout() {
    localStorage.removeItem("id_token");
    localStorage.removeItem("expires_at");
    window.location.reload();
  }

  public isLoggedIn() {
    return moment().isBefore(this.getExpiration());
  }

  isLoggedOut() {
    return !this.isLoggedIn();
  }

  getExpiration() {
    const expiration = localStorage.getItem("expires_at");
    const expiresAt = JSON.parse(expiration);
    return moment(expiresAt);
  }


}

