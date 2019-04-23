import date_utils from './date_utils';
import {
    $,
    createSVG,
    animateSVG
} from './svg_utils';
import moment from 'moment';
export default class Bar {
    constructor(gantt, task) {
        this.set_defaults(gantt, task);
        this.prepare(gantt);
        this.draw();
        this.bind(gantt);
    }

    set_defaults(gantt, task) {
        this.action_completed = false;
        this.gantt = gantt;
        this.task = task;
    }

    prepare(gantt) {
        this.prepare_values(gantt);
        this.prepare_helpers();
    }

    prepare_values() {
        moment.locale();
        this.invalid = this.task.invalid;
        this.height = this.gantt.options.bar_height;
        this.x = this.compute_x() + 16;
        this.y = this.compute_y();
        this.corner_radius = this.gantt.options.bar_corner_radius;
        if (this.gantt.options.view_mode === 'Hour') {
            this.duration =
                (date_utils.diff(this.task._end, this.task._start, 'hour') /
                    this.gantt.options.step) + 1;
        } else {
            this.duration =
                date_utils.diff(this.task._end, this.task._start, 'hour') /
                this.gantt.options.step;
        }
        this.width = this.gantt.options.column_width * this.duration;
        this.progress_width =
            this.gantt.options.column_width *
            this.duration *
            (this.task.progress / 100) || 0;
        this.group = createSVG('g', {
            class: 'bar-wrapper ' + (this.task.custom_class || ''),
            'data-id': this.task.id,
            id: this.gantt.options.idGantt,
            name: this.task.name,
            monthActiveStart: moment(this.task.start).format('MMMM YYYY'),
            monthActiveEnd: moment(this.task.end).format('MMMM YYYY')
        });
        this.bar_group = createSVG('g', {
            class: 'bar-group',
            append_to: this.group
        });
        this.handle_group = createSVG('g', {
            class: 'handle-group',
            append_to: this.group
        });
    }

    prepare_helpers() {
        SVGElement.prototype.getX = function () {
            return +this.getAttribute('x');
        };
        SVGElement.prototype.getY = function () {
            return +this.getAttribute('y');
        };
        SVGElement.prototype.getWidth = function () {
            return +this.getAttribute('width');
        };
        SVGElement.prototype.getHeight = function () {
            return +this.getAttribute('height');
        };
        SVGElement.prototype.getEndX = function () {
            return this.getX() + this.getWidth();
        };
    }

    draw() {
        this.draw_bar();
        //this.draw_progress_bar();
        this.draw_label();
        this.draw_resize_handles();
    }

    draw_bar() {
        if (this.task.name === '') {
            this.$bar = createSVG('rect', {
                x: this.x,
                y: this.y,
                width: this.width,
                height: this.height,
                rx: this.corner_radius,
                ry: this.corner_radius,
                style: "fill : #6495ED",
                class: 'bar',
                append_to: this.bar_group
            });

            animateSVG(this.$bar, 'width', 0, this.width);

            if (this.invalid) {
                this.$bar.classList.add('bar-invalid');
            }
        } else if (this.task.name === 'no task still after filter') {
            this.$bar = createSVG('rect', {
                x: this.x - 1000,
                y: this.y,
                width: this.width + 200,
                height: this.height,
                rx: this.corner_radius,
                ry: this.corner_radius,
                style: "fill : #7FFF00",
                class: 'bar',
                append_to: this.bar_group
            });

            animateSVG(this.$bar, 'width', 0, this.width);

            if (this.invalid) {
                this.$bar.classList.add('bar-invalid');
            }
        } else {
            this.$bar = createSVG('rect', {
                id: this.gantt.options.idGantt,
                key: 'event',
                x: this.x,
                y: this.y,
                width: this.width,
                height: this.height,
                rx: this.corner_radius,
                ry: this.corner_radius,
                style: "fill: gold",
                class: 'bar',
                append_to: this.bar_group
            });
            animateSVG(this.$bar, 'width', 0, this.width);
            if (this.invalid) {
                this.$bar.classList.add('bar-invalid');
            }
        }
    }
    // draw_progress_bar() {
    //   if (this.invalid) return;
    //   this.$bar_progress = createSVG('rect', {
    //     x: this.x,
    //     y: this.y,
    //     width: this.progress_width,
    //     height: this.height,
    //     rx: this.corner_radius,
    //     ry: this.corner_radius,
    //     class: 'bar-progress',
    //     append_to: this.bar_group
    //   });

    //   animateSVG(this.$bar_progress, 'width', 0, this.progress_width);
    // }

    draw_label() {
        if (this.task.name !== '') {
            createSVG('text', {
                x: this.x + this.width / 2,
                y: this.y + this.height / 2,
                innerHTML: this.task.name,
                class: 'bar-label',
                append_to: this.bar_group
            });
            // labels get BBox in the next tick
            requestAnimationFrame(() => this.update_label_position());
        } else {
            createSVG('text', {
                x: this.x + this.width / 2,
                y: this.y + this.height / 2,
                innerHTML: '',
                class: 'bar-label',
                append_to: this.bar_group
            });
            // labels get BBox in the next tick
            requestAnimationFrame(() => this.update_label_position());
        }
    }

    makeLabel(tab, task) {
        let label = '';
        if (tab.length === 1)
            return task[tab[0]];
        for (let i = 0; i < tab.length - 1; i++) {
            if (i == 0)
                label = task[tab[i]];
            label = label + ' ' + '|' + ' ' + task[tab[i]];
        }
        return label;
    }



    draw_resize_handles() {
        if (this.invalid) return;

        const bar = this.$bar;
        const handle_width = 8;

        createSVG('rect', {
            x: bar.getX() + bar.getWidth() - 9,
            y: bar.getY() + 1,
            width: handle_width,
            height: this.height - 2,
            rx: this.corner_radius,
            ry: this.corner_radius,
            class: 'handle right',
            append_to: this.handle_group
        });

        createSVG('rect', {
            x: bar.getX() + 1,
            y: bar.getY() + 1,
            width: handle_width,
            height: this.height - 2,
            rx: this.corner_radius,
            ry: this.corner_radius,
            class: 'handle left',
            append_to: this.handle_group
        });

        if (this.task.progress && this.task.progress < 100) {
            this.$handle_progress = createSVG('polygon', {
                points: this.get_progress_polygon_points().join(','),
                class: 'handle progress',
                append_to: this.handle_group
            });
        }
    }

    get_progress_polygon_points() {
        const bar_progress = this.$bar_progress;
        return [
            bar_progress.getEndX() - 5,
            bar_progress.getY() + bar_progress.getHeight(),
            bar_progress.getEndX() + 5,
            bar_progress.getY() + bar_progress.getHeight(),
            bar_progress.getEndX(),
            bar_progress.getY() + bar_progress.getHeight() - 8.66
        ];
    }

    bind(gantt) {
        if (this.invalid) return;
        this.setup_click_event(gantt);
    }

    setup_click_event(gantt) {
        $.on(this.group, 'focus click', e => {
            if (this.action_completed) {
                // just finished a move action, wait for a few seconds
                return;
            }

            if (e.type === 'click') {
                this.gantt.trigger_event('click', [this.task]);
            }

            this.gantt.unselect_all();
            this.group.classList.toggle('active');

            this.show_popup(gantt.options.dateFormat);
        });
    }

    show_popup(dateFormat) {
        if (this.gantt.bar_being_dragged) return;
        let start_date;
        let end_date;
        let dauer;
        let mode = this.gantt.options.view_mode;
        moment.locale(dateFormat);
        start_date = moment(this.task._start).format('DD MMMM');
        end_date = moment(this.task._end).format('DD MMMM');
        dauer = Math.round(Number(this.task.dauer / 1440).toFixed(0));

        const subtitle = start_date + ' - ' + end_date;

        this.gantt.show_popup({
            target_element: this.$bar,
            title: this.task.name,
            subtitle: subtitle,
            dauer: dauer + ' ' + mode,
            task: this.task
        });
    }

    update_bar_position({
        x = null,
        width = null
    }) {
        const bar = this.$bar;
        if (x) {
            // get all x values of parent task
            // const xs = this.task.dependencies.map(dep => {
            //     return this.gantt.get_bar(dep).$bar.getX();
            // });
            // child task must not go before parent
            // const valid_x = xs.reduce((prev, curr) => {
            //     return x >= curr;
            // }, x);
            // if (!valid_x) {
            //     width = null;
            //     return;
            // }
            this.update_attr(bar, 'x', x);
        }
        if (width && width >= this.gantt.options.column_width) {
            this.update_attr(bar, 'width', width);
        }
        this.update_label_position();
        this.update_handle_position();
        //this.update_progressbar_position();
        this.update_arrow_position();
        if (this.gantt.bar_being_dragged === this.task.id) {
            this.show_popup();
        }
    }

    date_changed() {
        moment.locale();
        let changed = false;
        const {
            new_start_date,
            new_end_date
        } = this.compute_start_end_date();

        if (Number(this.task._start) !== Number(new_start_date)) {
            changed = true;
            this.task._start = new_start_date;
        }

        if (Number(this.task._end) !== Number(new_end_date)) {
            changed = true;
            this.task._end = new_end_date;
        }

        if (!changed) return;

        this.gantt.trigger_event('date_change', [
            this.task,
            new_start_date,
            moment(new_end_date).subtract(1, 'seconds').toDate()
        ]);
    }

    progress_changed() {
        const new_progress = this.compute_progress();
        this.task.progress = new_progress;
        this.gantt.trigger_event('progress_change', [this.task, new_progress]);
    }

    set_action_completed() {
        this.action_completed = true;
        setTimeout(() => (this.action_completed = false), 1000);
    }

    compute_start_end_date() {
        const bar = this.$bar;
        const x_in_units = bar.getX() / this.gantt.options.column_width;
        const new_start_date = moment(this.gantt.gantt_start).add((x_in_units + 1) * this.gantt.options.step, 'hours').toDate();


        moment.locale();
        const width_in_units = bar.getWidth() / this.gantt.options.column_width;
        let new_end_date;
        const start = new_start_date;
        if (start.getHours() === 1 && this.gantt.options.view_mode !== 'Hour') {
            start.setHours(9, 0, 0, 0);
            new_end_date = moment(start).add((width_in_units - 1) * this.gantt.options.step, 'hours').toDate();
        }
        else {
            new_end_date = moment(new_start_date).add((width_in_units - 1) * this.gantt.options.step, 'hours').toDate();
        }

        if (this.gantt.options.view_mode !== 'Hour') {
            new_start_date.setHours(0, 0, 0, 0);
        }
        return {
            new_start_date,
            new_end_date
        };
    }

    compute_progress() {
        const progress =
            (this.$bar_progress.getWidth() / this.$bar.getWidth()) * 100;
        return parseInt(progress, 10);
    }

    compute_x() {
        const {
            step,
            column_width
        } = this.gantt.options;
        const task_start = this.task._start;
        const gantt_start = this.gantt.gantt_start;
        let x;
        const diff = date_utils.diff(task_start, gantt_start, 'hour');
        x = (diff / step) * column_width;
        return x;
    }

    compute_y() {
        return (
            // this.gantt.options.header_height +
            this.gantt.options.padding +
            this.task._index * (this.height + this.gantt.options.padding)
        );
    }

    get_snap_position(dx) {
        let odx = dx,
            rem,
            position;

        if (this.gantt.view_is('Week')) {
            rem = dx % (this.gantt.options.column_width / 7);
            position =
                odx -
                rem +
                (rem < this.gantt.options.column_width / 14 ?
                    0 :
                    this.gantt.options.column_width / 7);
        } else if (this.gantt.view_is('Month')) {
            rem = dx % (this.gantt.options.column_width / 30);
            position =
                odx -
                rem +
                (rem < this.gantt.options.column_width / 60 ?
                    0 :
                    this.gantt.options.column_width / 30);
        } else {
            rem = dx % this.gantt.options.column_width;
            position =
                odx -
                rem +
                (rem < this.gantt.options.column_width / 2 ?
                    0 :
                    this.gantt.options.column_width);
        }
        return position;
    }

    update_attr(element, attr, value) {
        value = +value;
        if (!isNaN(value)) {
            element.setAttribute(attr, value);
        }
        return element;
    }

    // update_progressbar_position() {
    //   this.$bar_progress.setAttribute('x', this.$bar.getX());
    //    this.$bar_progress.setAttribute(
    //      'width',
    //      this.$bar.getWidth() * (this.task.progress / 100)
    //    );
    // }

    update_label_position() {
        const bar = this.$bar,
            label = this.group.querySelector('.bar-label');

        if (label.getBBox().width > bar.getWidth()) {
            label.classList.add('big');
            label.setAttribute('x', bar.getX() + bar.getWidth() + 5);
        } else {
            label.classList.remove('big');
            label.setAttribute('x', bar.getX() + bar.getWidth() / 2);
        }
    }

    update_handle_position() {
        const bar = this.$bar;
        this.handle_group
            .querySelector('.handle.left')
            .setAttribute('x', bar.getX() + 1);
        this.handle_group
            .querySelector('.handle.right')
            .setAttribute('x', bar.getEndX() - 9);
        const handle = this.group.querySelector('.handle.progress');
        handle && handle.setAttribute('points', this.get_progress_polygon_points());
    }

    update_arrow_position() {
        this.arrows = this.arrows || [];
        for (let arrow of this.arrows) {
            arrow.update();
        }
    }
}