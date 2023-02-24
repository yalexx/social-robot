import {Component, OnInit} from '@angular/core';
import {FuseTranslationLoaderService} from '../../../core/services/translation-loader.service';
import {ApiService} from "../../../core/services/api.service";
import {locale as english} from './i18n/en';
import {NgForm} from '@angular/forms';
import {forEach} from "@angular/router/src/utils/collection";

@Component({
  selector: 'tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit {
  widgets: any;
  tasks;
  taskForm = {
    skipInvite: false,
    skipLike: false,
    profilesAmount: 1000,
    dailyLimitFrom: 30,
    dailyLimitTo: 60,
    priority: false,
    country: 'bg',
  };

  routines = [
    {id: 1, name: "pageLike"},
    {id: 2, name: "pageShare"},
    {id: 3, name: "postLike"},
    {id: 4, name: "postShare"},
    {id: 5, name: "groupJoin"},
    {id: 6, name: "groupInvite"},
  ];

  filters = {
    routine: {
      pageLike: true,
      pageShare: true,
      postLike: true,
      postShare: true,
      groupJoin: true,
      groupInvite: true,
    },
    state: {
      active: true,
      finished: false,
      paused: false
    }

  };

  states = [
    'active',
    'paused',
    'finished'
  ];

  constructor(private translationLoader: FuseTranslationLoaderService, private _apiService: ApiService) {
    this.translationLoader.loadTranslations(english);
  }

  ngOnInit() {
    this.getTasks();
  }

  getTasks() {

    console.log('filters: ', this.filters);

    this._apiService.getTasks().subscribe(data => {
        console.log('Tasks: ', data);

        this.tasks = this.filterTasks(data);
      },
      err => console.error(err)
    );
  }

  calcPercentage(num1, num2) {
    return (num2 / num1 * 100).toFixed(1);
  }


  filterTasks(tasks) {

    let filteredTasks = [];

    function getAciveFilters(filters) {
      let resFilters = [];
      for (let filter in filters) {
        let value = filters[filter];
        if (value) {
          resFilters.push(filter);
        }
      }
      return resFilters;
    }

    let filterRoutines = getAciveFilters(this.filters.routine);
    let filterStates = getAciveFilters(this.filters.state);

    console.log('filterRoutines: ', filterRoutines);
    console.log('filterStates: ', filterStates);

    for (let task of tasks) {
      if (filterRoutines.includes(task.routine) && filterStates.includes(task.state)) {
        filteredTasks.push(task);
      }
    }
    return filteredTasks;
  }

  editTask(task, newBotsCount) {
    this._apiService.editTask(task, newBotsCount.value).subscribe(data => {
        console.log('Edit Task Data: ', data);
        this.getTasks();
      },
      err => console.error(err)
    );
  }

  createTask(form: NgForm) {
    console.log('form.value: ', form.value);
    this._apiService.createTask(form.value).subscribe(data => {
        console.log('Data: ', data);
        this.getTasks();
      },
      err => console.error(err)
    );
  }

  editTaskState(id, state) {
    this._apiService.editTaskState({
      taskID: id,
      state: state.slice(3, state.length)
    }).subscribe((res) => {
      console.log('editTaskState: ', res);
      this.getTasks();
    });
  }

}
