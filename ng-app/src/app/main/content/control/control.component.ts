import {Component} from '@angular/core';
import {FuseTranslationLoaderService} from '../../../core/services/translation-loader.service';
import {ApiService} from "../../../core/services/api.service";
import {locale as english} from './i18n/en';
import { isDevMode } from '@angular/core';
@Component({
  selector: 'control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.scss']
})
export class ControlComponent {

  constructor(private translationLoader: FuseTranslationLoaderService, private _apiService: ApiService) {
    this.translationLoader.loadTranslations(english);
  }

  searchProfiles: any = [];
  favoritesProfiles = [];
  country = 'bg';
  currentScreen = 36;
  public screenUrl: any;


  ngOnInit() {
    this.getFavorites();
    this.screenUrl = `http://http://social-robots.ddns.net:90${this.currentScreen}/vnc.html`;
  }

  searchUser(searchUserForm?) {
    let filter = <any>{
      sidFilter: {
        "haveProfilePhoto": {"$exists": true},
        "lastAddFriends": {"$exists": true},
        "haveInitialPhotos": {"$exists": true},
        "startShares": {"$exists": true},
        "country": "bg",
      }
    };
    if (searchUserForm.form.value.searchEmail) {
      filter = {
        sidFilter: {
          "registerEmail": searchUserForm.form.value.searchEmail,
        }
      }
    }

    this._apiService.getSid(filter).subscribe((profiles: any) => {
        this.searchProfiles = profiles;
      },
      err => console.error(err)
    );
  }

  changeScreen(screenID): any {
    this.currentScreen = screenID;
    this.screenUrl = `http://http://social-robots.ddns.net:90${this.currentScreen}/vnc.html`;
  }

  setFavorites(SIDId) {
    console.log("SIDId: ", SIDId);
    let userID = localStorage.getItem('user_id');
    console.log('user id: ', userID);
    this._apiService.setFavorites(SIDId, userID).subscribe((res: any) => {
        console.log(res);
        this.getFavorites();
      },
      err => console.error(err)
    );
  }

  getFavorites() {
    this._apiService.getFavorites().subscribe((res: any) => {
        this.favoritesProfiles = res;
      },
      err => console.error(err)
    );
  }

  removeFavorites(SIDId) {
    this._apiService.removeFavorites(SIDId).subscribe((res: any) => {
        this.getFavorites();
      },
      err => console.error(err)
    );
  }

  setLoginRequest(SIDId) {
    console.log('setLoginRequest SIDId: ', SIDId);
    let containerID = this.currentScreen;
    if(isDevMode()) {
      containerID = 0;
    }
    this._apiService.setLoginRequest(SIDId, containerID).subscribe((res: any) => {
        console.log(res);
      },
      err => console.error(err)
    );
  }
}

