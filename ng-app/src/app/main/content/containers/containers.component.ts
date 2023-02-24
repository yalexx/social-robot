import {Component} from '@angular/core';
import {FuseTranslationLoaderService} from '../../../core/services/translation-loader.service';

import {locale as english} from './i18n/en';
import {ApiService} from "../../../core/services/api.service";

@Component({
  selector: 'containers',
  templateUrl: './containers.component.html',
  styleUrls: ['./containers.component.scss']
})
export class ContainersComponent {
  public containers;

  constructor(private translationLoader: FuseTranslationLoaderService,
              private _apiService: ApiService) {
    this.translationLoader.loadTranslations(english);
  }

  ngOnInit() {
    this.getContainers();
  }

  stopContainer(id) {
    this._apiService.stopContainer(id).subscribe();
  }

  startContainer(id) {
    this._apiService.startContainer(id).subscribe();
  }

  pauseContainer(id, value) {
    this._apiService.pauseContainer(id, value).subscribe();
    console.log('id: ', id);
    console.log('value: ', value);
  }

  restartContainer(startId, stopId) {
    this._apiService.restartContainer(startId, stopId).subscribe();
  }
  
  getContainers() {
    this._apiService.getContainers().subscribe(
      data => {
        this.containers = data['containers'];
        console.log(this.containers);

      },
      err => console.error(err),
      () => console.log('done loading foods')
    );
  }

}
