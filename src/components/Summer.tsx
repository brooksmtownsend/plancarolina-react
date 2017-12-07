import * as React from 'react';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import { scheduleStore } from '../ScheduleStore';
import { uiStore } from '../UIStore';
import { Semesters } from '../utils'
import Course from './Course'
import '../styles/Summer.css'

@observer
export default class Summer extends React.Component<{index: Semesters, opacity: number, type: 'normal' | 'mobile'}, {}> {
  divEl: HTMLDivElement

  componentDidMount() {
    uiStore.registerSlipList(this.divEl)
  }

  render() {
    const summerData = scheduleStore.getSemesterData(this.props.index)
    const style = {
      opacity: this.props.opacity,
      height: uiStore.summerHeight
    }
    return (
      <div className="Summer" style={style}>
        <span className="Summer-label">Summer</span>
        <span className="Summer-x" onClick={() => uiStore.deactivateSummer(this.props.index)}><span>x</span></span>
        <div className="Summer-courses" ref={el => this.divEl = el} id={`${Semesters[this.props.index]}`}>
          {summerData.map(data => <Course key={`course-${data.id}`} data={data} />)}
        </div>
      </div>
    )
  }
}