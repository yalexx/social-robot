import {FuseNavigationModelInterface} from '../core/components/navigation/navigation.model';

export class FuseNavigationModel implements FuseNavigationModelInterface {
  public model: any[];

  constructor() {
    this.model = [
      /* {
       'id'      : 'applications',
       'title'   : 'Applications',
       'translate': 'NAV.APPLICATIONS',
       'type'    : 'group',
       'children': [*/
      {
        'id': 'stats',
        'title': 'Stats',
        'type': 'item',
        'icon': 'email',
        'url': '/stats'
      },
      {
        'id': 'control',
        'title': 'Control',
        'type': 'item',
        'icon': 'email',
        'url': '/control'
      },
      {
        'id': 'containers',
        'title': 'Containers',
        'type': 'item',
        'icon': 'email',
        'url': '/containers'
      },
      {
        'id': 'tasks',
        'title': 'Тasks',
        'type': 'item',
        'icon': 'email',
        'url': '/tasks'
      }
      /* ]
       }*/
    ];
  }
}
