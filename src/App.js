import React, { Component } from "react";
import { GanttDiagrammComponent } from "./components";
import GanttController from "./components/GanttController/index";
import pdplus from "./data/pdplus.json";

class App extends Component {
    state = {
        viewMode: "Day",
        dataProvider: pdplus.slice(5,20),
        fields: {
            id: "ROWID",
            start: "Start",
            end: "Ende",
            name: "NAME",
        },
        propertyLabel: "name",
        listWidth: "450px",
        header: "Name of Room",
    };

    handleChangeViewMode = value =>
        this.setState({
            viewMode: value
        });

    handleInitiateStartEndDate = () =>
        this.setState({
            startDate: null,
            endDate: null
        });

    handleEditTaskLabel = newTaskLabel => {
        this.setState({
            propertyLabel: newTaskLabel
        });
    };

    handleClick = task => console.log("task", task);

    handleViewChange = mode => {
        console.log("mode", mode);
    };

    handleOnDataProviderChange() {
        this.setState(() => ({
            dataProvider: pdplus
        }));
    }

    executeFunction = () => {
        console.log("");
    };

    render() {
        const {
            dataProvider,
            fields,
            viewMode,
            listWidth,
            header,
            propertyLabel
        } = this.state;

        const { handleClick, handleEditTaskLabel, handleChangeViewMode } = this;

        const controllerProps = {
            handleChangeViewMode,
            handleEditTaskLabel,
            propertyLabel,
            viewMode
        };

        return (
            <div className="gantt">
                <GanttController {...controllerProps} />
                <GanttDiagrammComponent
                    listWidth={listWidth}
                    viewMode={viewMode ? viewMode : 'Day'}
                    header={header}
                    dataProvider={dataProvider}
                    fields={fields}
                    handleClick={handleClick}
                    executeFunction={this.executeFunction}
                />
            </div>
        );
    }
}

export default App;
