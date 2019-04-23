import React, { Component } from 'react';
import Gantt from '../../gantt';
import PropTypes from 'prop-types';
import { isEqual } from 'lodash';
import '../../less/css.less';

class FrappeGanttWrapper extends Component {
    constructor() {
        super();
        this.ganttRef = React.createRef();
    }
    componentDidMount() {
        const {
            handleDateChange,
            handleClick,
            handleProgressChange,
            tasks,
            viewMode,
            idGantt,
            list
        } = this.props;

        this.gantt_chart = new Gantt(this.ganttRef.current, tasks, list, {
            on_click: handleClick,
            on_date_change: handleDateChange,
            on_progress_change: handleProgressChange
        }, idGantt);
        this.gantt_chart.change_view_mode(viewMode);
    }

    componentDidUpdate(prevProps) {
        if (!isEqual([prevProps], [this.props])) {
            const { handleClick, handleDateChange, handleProgressChange, tasks, list, viewMode, idGantt } = this.props;
            const param = {
                on_click: handleClick,
                on_date_change: handleDateChange,
                on_progress_change: handleProgressChange
            };
            this.gantt_chart.refresh(tasks, list,
                param
                , idGantt);
            this.gantt_chart.change_view_mode(viewMode);
        }
    }

    render() {
        return (
            <div className="gantt__wrapper">
                <div ref={this.ganttRef} />
            </div>
        );
    }
}

FrappeGanttWrapper.propTypes = {
    handleDateChange: PropTypes.func,
    handleClick: PropTypes.func,
    handleProgressChange: PropTypes.func,
    tasks: PropTypes.array,
    list: PropTypes.array,
    viewMode: PropTypes.string,
    idGantt: PropTypes.string
};
export default FrappeGanttWrapper;