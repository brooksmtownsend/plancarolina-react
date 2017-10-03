import { MouseEvent, ChangeEvent, KeyboardEvent } from 'react'
import { observable, action, computed, autorun } from 'mobx'
import { Semesters } from './utils'
import { Departments } from './departments'
import { CourseData } from './components/Course'
import { scheduleStore } from './ScheduleStore'
import { loginStore } from './LoginStore'
import './styles/AddMajorPopup.css'

interface MajorData {
  name: string
  absoluteCourses: string[]
  additionalCourses: number
  urls: string[]
}

class UIStore {
  @observable departmentHues = new Map<string, number>()

  @observable fall5Active = false
  @observable spring5Active = false
  @observable isSearchingDepartment = false
  @observable isSearchingName = false
  @observable isSearchingMajor = false
  @observable addMajorPopupActive = false
  @observable loginPopupActive = false

  @observable majorResults: string[] = []
  @observable departmentResults: string[] = []

  @observable searchDepartment = ""
  @observable searchNumber: number
  @observable searchNumberOperator = 'eq'
  @observable searchKeywords = ""
  @observable searchGeneds: string[] = []

  @observable searchResults: CourseData[] = []
  @observable numberOfSearchResults = 8

  get isWideView() {
    return window.innerWidth > 890
  }

  @computed get semesterHeight() {
    return Math.max(...scheduleStore.allSemesters.map(s => s.length)) * 28 + 30
  }

  readonly MAJOR_LABEL = "major-res"
  readonly DEPARTMENT_LABEL = "dept-res"

  lastHue = 0
  lastKeywordUpdate = Date.now()
  departmentNames: string[]
  majorNames: string[] = []
  majorData: MajorData[]
  departmentInput: HTMLInputElement
  fuzzysearch: Function
  slip: any

  constructor() {
    this.departmentNames = Object.keys(Departments).filter(x => parseInt(x, 10) > 0).map(x => Departments[x])
    this.majorData = require('./majorCountWithoutComments.json').majors
    for (let key in this.majorData) {
      this.majorNames.push(this.majorData[key].name)
    }
    this.fuzzysearch = require('fuzzysearch')
    this.slip = require('./slip.js')

    window.addEventListener('resize', e => {
      if (window.innerWidth > 890 && this.numberOfSearchResults !== 8) {
        this.numberOfSearchResults = 8
      } else if (window.innerWidth <= 890 && this.numberOfSearchResults !== 9) {
        this.numberOfSearchResults = 9
      }
    })
  }

  @action.bound getDepartmentHue(dept: string) {
    let hue = this.departmentHues.get(dept)
    if (hue === undefined) {
      hue = this.lastHue += 30
      this.departmentHues.set(dept, hue)
    }
    return hue
  }

  @action.bound registerDepartmentInput(input: HTMLInputElement) {
    this.departmentInput = input
  }

  isReorderWithinList(e: Event): boolean {
    return (e.target as HTMLDivElement).classList.contains('Course')
  }

  @action.bound registerSlipList(el: HTMLDivElement) {
    let slipList = new this.slip(el)
    el.addEventListener('slip:reorder', (e: any) => {
      if (e.detail.origin.container.classList.contains('SearchBarResults')) {
        const searchResultIndex = e.detail.originalIndex
        const semesterIndex = Semesters[e.target.id as string]
        let toIndex = e.detail.spliceIndex
        // TODO: I have no idea why I have to do this - Hank
        // if (window.innerWidth >= 890) toIndex += 3
        scheduleStore.insertSearchResult(searchResultIndex, semesterIndex, toIndex)
      } else if (this.isReorderWithinList(e)) {
        scheduleStore.reorderInList(e.target, e.detail.originalIndex, e.detail.spliceIndex)
      } else { // course was dragged to a different list
        const toList = e.target
        const fromList = e.detail.origin.container
        const toIndex = e.detail.spliceIndex
        const fromIndex = e.detail.originalIndex
        scheduleStore.changeLists(fromList, fromIndex, toList, toIndex)
      }
    })
    el.addEventListener('slip:dragoff', (e: any) => {
      console.log(e)
    })
    scheduleStore.connectSlipList(slipList)
  }

  @action.bound registerSearchBarResults(el: HTMLDivElement) {
    let slipList = new this.slip(el)
    scheduleStore.connectSlipList(slipList)
  }

  @action.bound handleAddMajorClicked(e: MouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).classList.contains('Toolbar-item') || (e.target as HTMLElement).classList.contains('Toolbar-text')) {
      this.addMajorPopupActive = !this.addMajorPopupActive
    }
  }

  @action.bound handleLoginPopupClicked(e: MouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).classList.contains('Toolbar-item') || (e.target as HTMLElement).classList.contains('Toolbar-text')) {
      this.loginPopupActive = !this.loginPopupActive
    }
  }

  @action.bound handleNumberOperatorChange(e: ChangeEvent<HTMLSelectElement>) {
    this.searchNumberOperator = e.target.value
    this.updateSearchResults()
  }

  @action.bound handleSearchingNumber(e: ChangeEvent<HTMLInputElement>) {
    let val = parseInt(e.target.value, 10)
    if (val > 0) {
      this.searchNumber = val
    } else {
      this.searchNumber = null
    }
    this.updateSearchResults()
  }

  @action.bound handleSearchingKeywords(e: ChangeEvent<HTMLInputElement>) {
    this.searchKeywords = e.target.value
    if (Date.now() - this.lastKeywordUpdate > 500) {
      this.updateSearchResults()
      this.lastKeywordUpdate = Date.now()
    }
  }

  @action.bound handleSearchingMajor(e: ChangeEvent<HTMLInputElement>) {
    this.majorResults = this.majorNames.filter(x => this.fuzzysearch(e.target.value.toLowerCase(), x.toLowerCase()))
  }

  @action.bound handleSearchingDepartmentChange(e: ChangeEvent<HTMLInputElement>) {
    this.departmentResults = this.departmentNames.filter(x => this.fuzzysearch(e.target.value.toLowerCase(), x.toLowerCase()))
    if (e.target.value === '') {
      this.isSearchingDepartment = false
      this.searchDepartment = ''
    } else {
      this.isSearchingDepartment = true
    }
  }

  @action.bound handleGenedChanged(e: Event) {
    if ((e.target as HTMLInputElement).value === '') {
      this.searchGeneds = []
    } else {
      this.searchGeneds = (e.target as HTMLInputElement).value.split(',')
    }
    this.updateSearchResults()
  }

  @action.bound handleSearchResultChosen(label: string, result: string) {
    if (label === this.MAJOR_LABEL) {
      this.handleMajorResultChosen(result)
    } else if (label === this.DEPARTMENT_LABEL) {
      this.handleDepartmentResultChosen(result)
    }
  }

  @action.bound handleRemoveCourse(e: MouseEvent<HTMLSpanElement>) {
    let course = (e.target as HTMLDivElement).parentNode
    // get index of course in semester
    let semesterIndex = Semesters[course.parentElement.id]
    let courseIndex = 0
    while ((course = course.previousSibling) != null) {
      courseIndex++
    }
    scheduleStore.removeCourseFromSemester(courseIndex, semesterIndex)
  }

  private handleMajorResultChosen(majorName: string) {
    let schedule = document.querySelector(".Schedule");
    let loader = document.createElement("div");
    loader.id = "loading-circle";
    schedule.appendChild(loader);

    this.addMajorPopupActive = false
    let data = this.majorData.filter(x => x.name === majorName)[0]
    Promise.all(data.absoluteCourses.map(c => this.fetchCourseData(c))).then(courses => {
      scheduleStore.addCourses(courses)
      schedule.removeChild(loader)
    })
  }

  private fetchCourseData(name: string): Promise<CourseData> {
    let dept = name.split(' ')[0]
    let num = name.split(' ')[1]
    return new Promise((resolve, reject) => {
      fetch(`/api/api.cgi/courses/${dept}/${num}`).then(res => {
        if (res.ok) {
          res.json().then(resolve).catch(reject)
        } else {
          reject(res)
        }
      })
    })
  }

  private handleDepartmentResultChosen(result: string) {
    this.searchDepartment = result
    this.departmentInput.value = result
    this.departmentResults = []
    this.updateSearchResults()
  }

  @computed get searchGenedsString() {
    return this.searchGeneds.join(',')
  }

  updateSearchResults() {
    console.log('updating search results...')
    let dept = this.searchDepartment || 'none'
    let op = this.searchNumberOperator || 'eq'
    let num = this.searchNumber || 'none'
    let keywords = this.searchKeywords || 'none'
    let geneds = this.searchGeneds.length > 0 ? this.searchGeneds.join(',') : 'none'
    let url = `/api/api.cgi/search/${dept}/${op}/${num}/${keywords}/${geneds}`
    fetch(url).then(res => {
      res.json().then(data => {
        this.searchResults = data.results
        console.log('updated.')
      })
    })
  }

  promptUserLogin() {
    console.log('prompt user to login')
  }

  getSemesterLabel(index: Semesters) {
    if ([Semesters.Fall1, Semesters.Fall2, Semesters.Fall3, Semesters.Fall4, Semesters.Fall5].indexOf(index) !== -1) {
      return 'Fall'
    } else {
      return 'Spring'
    }
  }
}

export const uiStore = new UIStore()