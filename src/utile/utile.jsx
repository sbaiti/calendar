import React from 'react';
import { reduce, keys, omit, map, uniqBy, filter } from 'lodash';
import moment from 'moment';
import { compareAsc, compareDesc, differenceInMinutes, isAfter, isBefore } from 'date-fns';


/*-------------------------------------------------
    --------------- GanttDiagrammComponent---------------
    -------------------------------------------------*/

const compareDates = asc => (...dates) =>
    asc ? compareAsc(...dates) : compareDesc(...dates);

function sortByStartDate({
    tasks,
    asc = true
}) {
    if (tasks && tasks.length) {
        tasks.sort((...dates) => compareDates(asc)(...dates.map(date => date.start)));
        return tasks;
    }
    else
        return null;
}

function prepareTasks(dataProvider, fields) {
    return reduce(dataProvider, (acc, item) => {
        const transformedItem = reduce(
            fields,
            (acc, val, key) => {
                if (['start', 'end', 'name', 'id'].includes(key) && item[val.toUpperCase()]) {
                    return {
                        ...acc,
                        [key]: item[val.toUpperCase()]
                    };
                }
                return acc;
            }, {}
        );

        if (keys(transformedItem).length > 0) {
            return [...acc, {
                ...transformedItem,
                ...item,
                dauer: differenceInMinutes(transformedItem.end, transformedItem.start)
            }];
        }
        return [...acc, {
            ...item
        }];
    }, []);
}


function transfromDataProviderToTasks(dataProvider, fields) {
    moment.locale();
    if (!fields) {
        console.error("Gantt couldn't be loaded. Please verify your fields");
        return null;
    }
    let objFields = Object.keys(fields);
    let isExist = (objFields.includes('start')) && (objFields.includes('end'))
        && (objFields.includes('name')) && (objFields.includes('id'));
    if (!isExist) {
        console.error("Gantt couldn't be loaded. Please verify your fields");
        return null;
    }
    else
        return map(prepareTasks(dataProvider || [], fields), task => ({
            ...task,
            start: moment(task.start).format(),
            end: moment(task.end).format()
        })
        );
}

function getScrollLeftPos(ref) {
    return ref.current.scrollLeft;
}

function dateChange({
    scrollPos,
    tasks
}, task, start, end, taskIndex) {
    return {
        taskChanged: task,
        scrollXPos: scrollPos,
        tasks: sortByStartDate({
            tasks: [
                ...tasks.slice(0, taskIndex),
                {
                    ...task,
                    start: start,
                    end: end,
                    isDraged: true,
                    dauer: differenceInMinutes(end, start)
                },
                ...tasks.slice(taskIndex + 1, tasks.length)
            ]
        })
    };
}

/*-------------------------------------------------
    --------------- Task info ---------------
    -------------------------------------------------*/

function handleFacusTaskSelected(id, setScrollPos) {
    const barWrappersElements = Array.from(
        document.getElementsByClassName('bar-wrapper')
    );
    const barWrappersElementsPosition = Array.from(
        document.getElementsByClassName('bar')
    );
    let listLeftScrollLeft;
    let listMultiItems;
    let month = [];
    const taskIndex = barWrappersElements.findIndex(
        elem => elem.dataset.id == id
    );
    const targetElement = barWrappersElements.filter(el =>
        el.dataset.id == id);
    month = FocusTask(targetElement[0], month);
    const pos = barWrappersElementsPosition[taskIndex + 1].x.animVal.value;
    listLeftScrollLeft = document.querySelector('.tasks__info__wrapper');
    listMultiItems = document.querySelector('.items__info__wrapper');
    if (listMultiItems) {
        setScrollPos(pos - 250, listMultiItems.scrollTop, month);
    } else {
        setScrollPos(pos - 250, listLeftScrollLeft.scrollTop, month);
    }

}

function FocusTask(task, month) {
    task.focus();
    month.push(task.getAttribute('monthActiveStart'));
    month.push(task.getAttribute('monthActiveEnd'));
    return month;
}

const TasksInfoHeader = (header) => (
    <div className="header__filter__container">
        <div className="header">
            <i>{header}</i>
        </div>
    </div>
);

function findIndexOfScroll(tab, pos) {
    let i = 0;
    while (i < tab.length - 1) {
        if ((pos >= tab[i]) && (pos <= tab[i + 1] - 200))
            return i;
        else
            i = i + 1;
    }
    return null;
}


function returnPosScroll(ref, className) {
    return {
        currentRef: ref.current,
        targetRef: Array.from(
            document.getElementsByClassName(className)
        )[0]
    };
}

function selectEventUpdated(task) {
    const barWrappersElements = Array.from(
        document.getElementsByClassName('task__item')
    );
    const targetElement = barWrappersElements.filter(el => el.id === task.id);
    if (targetElement.length) {
        targetElement[0].setAttribute('style', 'border : 3px solid #ff9f00');
    }
}


function translateActiveMonth(posMonth, posScroll, pos) {
    const indexScroll = findIndexOfScroll(posScroll, pos);
    if (indexScroll !== null) {
        posMonth[indexScroll].setAttribute('transform', `translate(${pos - (posMonth[indexScroll].x.animVal[0].value - 70)},0)`);
    }
}

function focusMonthTaskActive(month, idGantt, viewMode) {
    const posMonth = getPosMonth(idGantt, viewMode);
    posMonth.map(elem => {
        (elem.innerHTML !== month[0] && elem.innerHTML !== month[1]) ? elem.style.fill = "#555" : elem.style.fill = "#ff9f00";
    });
}

function getPosMonth(idGantt, viewMode) {
    let posMonth;
    if (viewMode === 'Month') {
        posMonth = Array.from(document.getElementsByClassName('lower-text'));
    }
    else {
        posMonth = Array.from(document.getElementsByClassName('upper-text'));
    }
    return posMonth;

}

function scrollingLeftTheGantt(idGantt, scrollableContainerRef) {
    scrollableContainerRef.current.scrollLeft = document.querySelector(
        '.clonedHeader'
    ).scrollLeft;
}

function prepareTaskBeforeRequest(fields, task, taskrequest, trueStart, trueEnd) {
    taskrequest[fields.start] = trueStart;
    taskrequest[fields.end] = trueEnd;
    taskrequest[fields.id] = task.id;
    taskrequest[fields.name] = task.name;
    taskrequest.BDATUM = null;
    taskrequest.MELDESTATUS = 0;
    taskrequest = omit(taskrequest, ['start', 'end', 'id', 'isDraged', 'name', 'dependencies']);
    if (fields.start === 'START') {
        // taskrequest.VERSION = 0;
        taskrequest.DAUER = 0;
        taskrequest.COMPLETE = 0;
        taskrequest.MDATUM = null;
        taskrequest.EDATUM = null;
    }
    return taskrequest;
}

function generate_id(task) {
    return (
        task.name +
        '_' +
        Math.random()
            .toString(36)
            .slice(2, 12)
    );
}

function SetClassName(className, isSelected) {
    if (isSelected) {
        let spans = Array.from(document.getElementsByClassName(className + '__selected'));
        if (spans.length) {
            spans.map((div) => {
                { div.className = className; }
            }
            );
        }
        return className + '__selected';
    } else
        return className;
}

function setItem(tasks) {
    return uniqBy(tasks, 'NAME');
}

function filterTasksByStartEndDate(tasks, start, end) {
    if (start && end)

        return filter(tasks, task => isAfter(task.start, start) && isBefore(task.end, end));
    else if (start)

        return filter(tasks, task => isAfter(task.start, start));

    else if (end)
        return filter(tasks, task => isBefore(task.end, end));
    else
        return tasks;
}

export {
    sortByStartDate,
    transfromDataProviderToTasks,
    getScrollLeftPos,
    dateChange,
    TasksInfoHeader,
    handleFacusTaskSelected,
    returnPosScroll,
    selectEventUpdated,
    translateActiveMonth,
    scrollingLeftTheGantt,
    prepareTaskBeforeRequest,
    getPosMonth,
    focusMonthTaskActive,
    generate_id,
    filterTasksByStartEndDate,
    setItem,
    SetClassName
};