import React from 'react';
import PropTypes from 'prop-types';
import TaskItem from '../../utile/TaskItem';
import {
  TasksInfoHeader
} from '../../utile/utile';
import '../../less/TaskInfoOneSelect.less';

class TaskInfoOneSelect extends React.Component {
  constructor(props) {
    super(props);
    this.taskInfoRef = React.createRef();
    this.state = {
      selectedItemId: null
    };
  }

  render() {
    const {
      tasks,
      propertyLabel,
      header,
      setScrollPos,
      scrollTop,
      debouncedScrollController,
      idGantt
    } = this.props;

    if (tasks.length >= 1) {
      return (
        <div className="task__info__container">
          {TasksInfoHeader(header)}
          <div
            className="tasks__info__wrapper"
            id={idGantt}
            ref={this.taskInfoRef}
            onScroll={() => debouncedScrollController({ scrollSrc: 'GANTT_LIST' }, this.taskInfoRef)}
          >
            {tasks.map((task, index) => (
              <TaskItem
                idGantt={idGantt}
                isSelected={task.id === this.state.selectedItemId}
                handleSelectTask={() => { this.setState({ selectedItemId: task.id }); }}
                task={task}
                propertyLabel={propertyLabel}
                key={index}
                setScrollPos={setScrollPos}
                scrollTop={scrollTop}
              />
            ))}
            <div className="list__buttom" />
          </div>
        </div>
      );
    }
    else {
      return (
        <div className="task__info__container">
          {TasksInfoHeader(header)}
          <div
            className="tasks__info__wrapper"
            id={idGantt}
            ref={this.taskInfoRef}
            onScroll={() => debouncedScrollController({ scrollSrc: 'GANTT_LIST' }, this.taskInfoRef)}
          >
            <div className="filter__msg">NO RESERVATION STILL AFTER FILTER !</div>
          </div>
        </div>
      );

    }
  }
}
TaskInfoOneSelect.propTypes = {
  tasks: PropTypes.array,
  propertyLabel: PropTypes.string,
  header: PropTypes.string,
  setScrollPos: PropTypes.func,
  scrollTop: PropTypes.number,
  debouncedScrollController: PropTypes.func,
  idGantt: PropTypes.string
};
export default TaskInfoOneSelect;