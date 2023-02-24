import {Component} from '@angular/core';
import {FuseTranslationLoaderService} from '../../../core/services/translation-loader.service';
import {ApiService} from "../../../core/services/api.service";
import {locale as english} from './i18n/en';

@Component({
  selector: 'stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent {
  stats;
  widgets: any;
  removedSids;
  registerFBAbv;
  registerFBWebDe;
  registerFBGmx;
  profilePhotos;
  coverPhotos;
  initialShares;
  storeCookie;
  suggestedFriends;
  likePage;
  initialLikes;
  postPhotos;

  constructor(private translationLoader: FuseTranslationLoaderService, private _apiService: ApiService) {
    this.translationLoader.loadTranslations(english);
    // Get the widgets from the service
    //this.widgets = this.analyticsDashboardService.widgets;
  }

  ngOnInit() {
    this.getStats();
    this.stats = [{}];
  }

  getStats() {

    this._apiService.getEvents().subscribe(data => {
        this.stats = data;
        this._apiService.getRemovedSids().subscribe((data:any) => {
            console.log('Stats: ', data);
            this.stats.push({
              name: 'removedSids',
              count: data.removedToday
            });
          },
          err => console.error(err)
        );
      },
      err => console.error(err)
    );

  }
}
