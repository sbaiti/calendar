import React from 'react';
import PropTypes from 'prop-types';
import {
    SetClassName,
    handleFacusTaskSelected
} from './utile';

function TaskItem({
    task,
    propertyLabel,
    setScrollPos,
    isSelected,
    handleSelectTask,
    idGantt
}) {
    return (
        <div
            id={task.id}
            className={SetClassName('task__item', isSelected)}
            onClick={e => {
                e.preventDefault();
                handleFacusTaskSelected(task.id, setScrollPos, idGantt);
                handleSelectTask();
            }}
        >
            <div id={task.id} className="task__name">
                {task[propertyLabel]}
            </div>
        </div>
    );
}
TaskItem.propTypes = {
    task: PropTypes.object,
    propertyLabel: PropTypes.string,
    setScrollPos: PropTypes.func,
    isSelected: PropTypes.bool,
    handleSelectTask: PropTypes.func,
    dateFormat: PropTypes.string,
    idGantt: PropTypes.string,
    duration: PropTypes.bool,
    optionShowDate: PropTypes.string,
    unitDuration: PropTypes.string
};
export default TaskItem;