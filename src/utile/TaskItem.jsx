import React from 'react';
import PropTypes from 'prop-types';
import {
    SetClassName,
    handleFacusTaskSelected
} from './utile';

function TaskItem({
    task,
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
                <i className="fa fa-bed" aria-hidden="true" /> {task.name}
            </div>
        </div>
    );
}
TaskItem.propTypes = {
    task: PropTypes.object,
    setScrollPos: PropTypes.func,
    isSelected: PropTypes.bool,
    handleSelectTask: PropTypes.func,
    idGantt: PropTypes.string,
};
export default TaskItem;