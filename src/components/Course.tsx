import * as React from 'react'
import { observer } from 'mobx-react'
import { scheduleStore } from '../ScheduleStore'
import { uiStore } from '../UIStore'
import { Departments } from '../departments'
import '../styles/Course.css'

export type CourseData = {
  id: number,
  department: string,
  number: string
  name: string,
  credits: number,
  geneds: string[],
  description: string,
}

@observer
export default class Course extends React.Component<{ data: CourseData }, {}> {

  constructor(props: { data: CourseData }) {
    super(props)
  }

  render() {
    const data = this.props.data
    let style = {
      backgroundColor: `hsl(${uiStore.getDepartmentHue(data.department)}, 80%, 80%)`
    }
    return (
      <div className="Course" id={`course-${data.id}`} style={style}>{data.department} {data.number}<span className="Course-x" onClick={uiStore.handleRemoveCourse}>x</span></div>
    )
  }
}