import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {isDevMode} from '@angular/core';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};

@Injectable()
export class ApiService {
  port = 3334;
  apiUrl = `http://http://social-robots.ddns.net:`;


  constructor(private http: HttpClient) {
    if (isDevMode()) {
      console.log('Development Mode');
      this.port = 3333;
    }
    else {
      console.log('Production Mode');
    }
    this.apiUrl += this.port;
  }

  // Uses http.get() to load data from a single API endpoint
  getContainers() {
    return this.http.post(`${this.apiUrl}/containers/list`, {
      // body here
    });
  }

  restartContainers() {
    return this.http.post(`${this.apiUrl}/containers/stopAll`, {});
  }

  stopContainer(id: string) {
    console.log('API stopContainer id: ', id);
    return this.http.post(`${this.apiUrl}/containers/stopContainer`, {
      id
    });
  }

  startContainer(id: string) {
    console.log('API startContainer id: ', id);
    return this.http.post(`${this.apiUrl}/containers/startContainer`, {
      id
    });
  }

  pauseContainer(id: string, paused: boolean) {
    console.log('API startContainer id: ', id);
    return this.http.post(`${this.apiUrl}/containers/pauseContainer`, {
      id,
      paused
    });
  }

  restartContainer(startId: string, stopId: boolean) {
    console.log('API restartContainer id: ', startId);
    return this.http.post(`${this.apiUrl}/containers/restartContainer`, {
      startId,
      stopId
    });
  }

  // Stats
  getRemovedSids() {
    return this.http.post(`${this.apiUrl}/stats/removedSids`, {});
  }

  getEvents() {
    return this.http.post(`${this.apiUrl}/stats/events`, {});
  }

  // Tasks
  getTasks() {
    return this.http.get(`${this.apiUrl}/tasks/listTasks`, {});
  }

  editTaskState(data) {
    return this.http.post(`${this.apiUrl}/tasks/editState`, data);
  }

  editTask(task, newBotsCount) {
    return this.http.post(`${this.apiUrl}/tasks/editTask`, {
      "taskID": task.taskID,
      "sidFilter": {
        "isVerified": true,
        "haveProfilePhoto": true,
        "country": task.country
      },
      "addNewSids": newBotsCount
    });
  }

  createTask(task) {
    return this.http.post(`${this.apiUrl}/tasks/createTask`, {
      "name": task.taskName,
      "routine": task.routine.name,
      "startSidsCount": task.startSidsCount,
      "priority": task.priority,
      "skipInvite": task.skipInvite,
      "skipLike": task.skipLike,
      "country": task.country,
      "limitRange": [task.limitRangeFrom, task.limitRangeFrom],
      "sidFilter": {
        "country": task.country,
        "isVerified": true,
        "haveProfilePhoto": true,
      },
      "url": task.url,
    });
  }

  getSid(sidFilter) {
    console.log('sidFilter: ', sidFilter);
    return this.http.post(`${this.apiUrl}/sids/getSid`, sidFilter);
  }

  startAllContainers() {
    return this.http.post(`${this.apiUrl}/containers/start`, {});
  }

  stopAllContainers() {
    return this.http.post(`${this.apiUrl}/containers/stopAll`, {});
  }

  getFavorites() {
    return this.http.post(`${this.apiUrl}/sids/getFavorites`, {});
  }

  setFavorites(SIDId, userID) {
    return this.http.post(`${this.apiUrl}/sids/setFavorites`, {SIDId, userID});
  }

  removeFavorites(SIDId) {
    return this.http.post(`${this.apiUrl}/sids/setFavorites`, {SIDId});
  }

  setLoginRequest(SIDId, containerID) {
    return this.http.post(`${this.apiUrl}/control/setLoginRequest`, {
      SIDId,
      containerID
    });
  }


}
