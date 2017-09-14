import * as React from 'react'
import { observer } from 'mobx-react'
import { scheduleStore } from '../ScheduleStore'
import { uiStore } from '../UIStore'
import { Departments } from '../departments'
import '../styles/Course.css'

export type CourseData = {
  id: number,
  name: string,
  genEds: string[],
  department: string,
  number: string
}

@observer
export default class Course extends React.Component<{ data: CourseData }, {}> {

  hue: number

  constructor(props: { data: CourseData }) {
    super(props)
    let hue = uiStore.departmentHues.get(props.data.department)
    if (hue === undefined) {
      hue = uiStore.lastHue += 30
      uiStore.departmentHues.set(props.data.department, hue)
    }
    this.hue = hue
  }

  render() {
    const data = this.props.data
    let style = {
      backgroundColor: `hsl(${this.hue}, 80%, 80%)`
    }
    return (
      <div className="Course" id={`${data.id}`} style={style}>{data.department} {data.number}</div>
    )
  }
}