import React, {
  Component
} from 'react';
import FrappeGanttWrapper from './wrapperGantt';
import TaskInfoOneSelect from './TaskInfoOneSelect/TaskInfoOneSelect';
import Resizable from 're-resizable';
import PropTypes from 'prop-types';
import moment from 'moment';
import { isEqual, throttle, findIndex } from 'lodash';
import '../less/profil-gantt.less';
import {
  sortByStartDate,
  transfromDataProviderToTasks,
  getScrollLeftPos,
  dateChange,
  filterTasksByStartEndDate,
  returnPosScroll,
  selectEventUpdated,
  translateActiveMonth,
  setItem,
  scrollingLeftTheGantt,
  prepareTaskBeforeRequest,
  dateChangeGroupedTask,
  getPosMonth,
  focusMonthTaskActive,
  fixHour,
  generate_id
} from '../utile/utile';

class GanttDiagrammComponent extends Component {
  constructor(props) {
    super(props);
    this.scrollableContainerRef = React.createRef();
    this.ganttListRef = React.createRef();
    this.state = {
      tasks: null,
      list: null,
      headerWidth: null,
      startFilter: null,
      endFilter: null,
      scrollXPos: null,
      scrollTop: null,
    };
    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleFilterChangeStart = this.handleFilterChangeStart.bind(this);
    this.handleFilterChangeEnd = this.handleFilterChangeEnd.bind(this);
    this.setScrollPos = this.setScrollPos.bind(this);
    this.getCurrentAndTargetRefs = this.getCurrentAndTargetRefs.bind(this);
    this.scrollTopFunction = this.scrollTopFunction.bind(this);
    this.debouncedScrollController = this.debouncedScrollController.bind(this);
  }

  /*-------------------------------------------------
  --------------- Component life cycle ---------------
    -------------------------------------------------*/
  componentWillMount() {
    const { dataProvider, fields } = this.props;
    if (dataProvider && dataProvider.length > 0) {
      const tasks = sortByStartDate({
        tasks: transfromDataProviderToTasks(dataProvider, fields)
      });
      const list = setItem(dataProvider);
      this.setState({
        tasks,
        list,
        idGantt: generate_id(tasks[0])
      });
    }
    else return null;
  }

  componentDidMount() {
    const { tasks } = this.state;
    if (tasks) {
      if (tasks.length) {
        const gantt = document.getElementsByClassName('gantt');
        gantt[0].getAttribute('width') ?
          this.setState({
            headerWidth: gantt[0].getAttribute('width')
          }) :
          this.setState({
            headerWidth: gantt[1].getAttribute('width')
          });
      }
    }
  }

  componentWillReceiveProps(newProps) {
    if (!isEqual(newProps.dataProvider, this.props.dataProvider)) {
      this.setState({
        tasks: sortByStartDate({
          tasks: transfromDataProviderToTasks(
            newProps.dataProvider,
            newProps.fields,
            newProps.dateFormat
          )
        })
      });
    }
  }

  /*-------------------------------------------------
  --------------- Component Functions  ---------------
    -------------------------------------------------*/

  handleDateChange(task, start, end) {
    moment.locale();
    const { tasks, BlockedTimeFrame, tasksItems, groupingAttribute } = this.state;
    const { viewMode } = this.props;
    const scrollPos = getScrollLeftPos(this.scrollableContainerRef);
    const newDateStart = moment(start).locale('L').toISOString();
    const newDateEnd = moment(end).locale('L').toISOString();
    const taskChangedIndex = findIndex(tasks, { id: task.id });
    const timeStart = viewMode === 'Hour' ? newDateStart.substring(11) : (task.start).substring(11);
    const timeEnd = viewMode === 'Hour' ? fixHour(newDateEnd).substring(11) : (task.end).substring(11);
    const trueStart = newDateStart.substring(0, 11) + timeStart;
    const trueEnd = newDateEnd.substring(0, 11) + timeEnd;
    let taskrequest = { ...task, start: trueStart, end: trueEnd };
    if (groupingAttribute) {
      const taskMultiSelectIndex = findIndex(BlockedTimeFrame, { id: task.id });
      const taskMultiSelectIndexTasks = findIndex(tasksItems, { id: task.id });
      const newTasks = tasksItems;
      newTasks[taskMultiSelectIndexTasks] = taskrequest;
      this.setState(dateChangeGroupedTask(this.state, task, trueStart, trueEnd, taskMultiSelectIndex, newTasks, scrollPos, taskChangedIndex),
        () => (this.scrollableContainerRef.current.scrollLeft = scrollPos)
      );
    } else {
      this.setState(
        dateChange(this.state, task, trueStart, trueEnd, taskChangedIndex),
        () => (this.scrollableContainerRef.current.scrollLeft = scrollPos)
      );
    }
    const finalTaskResquest = prepareTaskBeforeRequest(this.props.fields, task, taskrequest, trueStart, trueEnd);
    selectEventUpdated(task);
    this.props.executeFunction(finalTaskResquest);
  }

  setScrollPos(posLeft, posTop, month) {
    this.setState({
      scrollXPos: posLeft,
      scrollTop: posTop
    }, () => {
      if (this.scrollableContainerRef)
        this.scrollableContainerRef.current.scrollLeft = posLeft;
      this.scrollableContainerRef.current.scrollTop = posTop;
      focusMonthTaskActive(month, this.props.viewMode);
    });
  }

  getCurrentAndTargetRefs({ scrollSrc }, ref) {
    const posScroll = {
      currentRef: ref.current,
      targetRef: this.scrollableContainerRef.current
    };
    const { groupingAttribute } = this.state;
    if (!groupingAttribute) {
      if (scrollSrc === 'GANTT_LIST')
        return posScroll;
      else
        return returnPosScroll(ref, 'tasks__info__wrapper');
    } else {
      if (scrollSrc === 'GANTT_LIST') {
        return posScroll;
      } else
        return returnPosScroll(ref, 'items__info__wrapper');
    }
  }

  scrollTopFunction(...args) {
    const { currentRef, targetRef } = this.getCurrentAndTargetRefs(...args);
    const { scrollTop } = currentRef;
    targetRef.scrollTop = scrollTop;
    let pos;
    const { idGantt } = this.state;
    pos = this.scrollableContainerRef.current.scrollLeft;
    document.querySelector('.clonedHeader').scrollLeft = pos;
    if (this.props.viewMode === 'Day') {
      const posMonth = getPosMonth(idGantt);
      const posScroll = posMonth.map(elem => elem.x.animVal[0].value);
      translateActiveMonth(posMonth, posScroll, pos);
    }
  }

  debouncedScrollController = throttle(this.scrollTopFunction, 30);

  handleFilterChangeStart(date) {
    moment.locale();
    if (date) {
      this.setState({
        startFilter: moment(date).format('L').toISOString()
      });
    }
    else {
      this.setState({
        startFilter: null
      });
    }
  }

  handleFilterChangeEnd(date) {
    moment.locale();
    if (date) {
      this.setState({
        endFilter: moment(date).format('L').toISOString()
      });
    }
    else {
      this.setState({
        endFilter: null
      });
    }
  }

  render() {
    if (this.state.tasks === null) {
      return (
        <div className="gantt__filter">
          <h1> keine reservierung begründet !</h1>
        </div>
      );
    }
    if (!this.state.tasks) { return null; }

    const { viewMode, handleClick, listWidth, header } = this.props;

    const { tasks, idGantt, startFilter, endFilter, headerWidth, scrollTop, list } = this.state;

    const filteredTasks = filterTasksByStartEndDate(tasks, startFilter, endFilter);

    const effectiveTasks = startFilter || endFilter ? filteredTasks : tasks;

    return (
      <div className="gantt__container">
        <Resizable
          defaultSize={{ width: listWidth }}
          enable={{
            top: false,
            right: true,
            bottom: false,
            left: false,
            topRight: false,
            bottomRight: false,
            bottomLeft: false,
            topLeft: false
          }}
        >
          <div className="gantt__list">
            <TaskInfoOneSelect
              tasks={effectiveTasks}
              header={header}
              idGantt={idGantt}
              setScrollPos={this.setScrollPos}
              scrollTop={scrollTop}
              debouncedScrollController={this.debouncedScrollController}
            />
          </div>
        </Resizable>
        <div className="header__and__gantt">
          <div className="clonedHeader"
            id={idGantt}
            onScroll={throttle(() => {
              scrollingLeftTheGantt(idGantt, this.scrollableContainerRef);
            }, 40)}>
            <svg className="date" width={headerWidth} id={idGantt} />
          </div>
          <div
            className="gantt__component"
            id={idGantt}
            ref={this.scrollableContainerRef}
            onScroll={() =>
              this.debouncedScrollController(
                { scrollSrc: 'GANTT_COMPONENT' },
                this.scrollableContainerRef
              )
            }
          >
            <FrappeGanttWrapper
              list={list}
              idGantt={idGantt}
              tasks={effectiveTasks}
              handleClick={handleClick}
              handleDateChange={this.handleDateChange}
              viewMode={viewMode}
            />
          </div>
        </div>
      </div>
    );
  }
}
GanttDiagrammComponent.propTypes = {
  dataProvider: PropTypes.array,
  viewMode: PropTypes.string,
  fields: PropTypes.object,
  handleClick: PropTypes.func,
  executeFunction: PropTypes.func,
  listWidth: PropTypes.string,
  header: PropTypes.string
};
export default GanttDiagrammComponent;