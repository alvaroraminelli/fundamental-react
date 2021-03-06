import Button from '../Button/Button';
import classnames from 'classnames';
import moment from 'moment';
import PropTypes from 'prop-types';
import withStyles from '../utils/WithStyles/WithStyles';
import React, { Component } from 'react';

class Calendar extends Component {

    constructor(props) {
        super(props);

        this.state = {
            todayDate: moment().startOf('day'),
            currentDateDisplayed: moment(),
            arrSelectedDates: [],
            selectedDate: moment({ year: 0 }),
            showMonths: false,
            showYears: false,
            dateClick: false
        };
    }

    // sync the selected date of the calendar with the date picker
    static getDerivedStateFromProps(updatedPropsParent, previousStates) {
        const { customDate, enableRangeSelection } = updatedPropsParent;

        if (typeof customDate === 'undefined') {
            return null;
        }

        if (!previousStates.dateClick) {
            if (typeof enableRangeSelection !== 'undefined') {
                if (customDate !== previousStates.arrSelectedDates) {
                    if (!customDate || !customDate.length) {
                        // reset calendar state when date picker input is empty and did not click on a date
                        return ({ currentDateDisplayed: moment(), arrSelectedDates: [], selectedDate: moment({ year: 0 }) });
                    }
                    // update calendar state with date picker input
                    return ({ currentDateDisplayed: customDate[0], arrSelectedDates: customDate, selectedDate: moment({ year: 0 }) });
                }
            } else if (customDate !== previousStates.currentDateDisplayed) {
                if (!customDate) {
                    // reset calendar state when date picker input is empty and did not click on a date
                    return ({ currentDateDisplayed: moment(), selectedDate: moment({ year: 0 }) });
                }
                // update calendar state with date picker input
                return ({ currentDateDisplayed: customDate, selectedDate: customDate });
            }
        }
        return ({ dateClick: false });
    }

    showMonths = () => {
        this.setState({
            showMonths: !this.state.showMonths,
            showYears: false,
            dateClick: true
        });
    }

    isEnabledDate = (day) => {
        const {
            disableWeekends,
            disableAfterDate,
            disableBeforeDate,
            blockedDates,
            disableWeekday,
            disablePastDates,
            disableFutureDates,
            disabledDates
        } = this.props;
        return (
            !this.disableWeekday(day, disableWeekday) &&
            !(disableWeekends && (day.day() === 0 || day.day() === 6)) &&
            !(disableBeforeDate && day.isBefore(moment(disableBeforeDate))) &&
            !(disableAfterDate && day.isAfter(moment(disableAfterDate))) &&
            !(disablePastDates && day.isBefore(moment(), 'day')) &&
            !(disableFutureDates && day.isAfter(moment(), 'day')) &&
            !this.isDateBetween(day, blockedDates && blockedDates.map(date => moment(date))) &&
            !this.isDateBetween(day, disabledDates && disabledDates.map(date => moment(date)))
        );
    }

    isSelected = (day) => {
        const { arrSelectedDates, selectedDate } = this.state;
        return (
            (
                day.isSame(selectedDate, 'day') ||
                (this.props.enableRangeSelection && (
                    (typeof arrSelectedDates[0] !== 'undefined' ? arrSelectedDates[0].isSame(day, 'day') : false) ||
                    (typeof arrSelectedDates[1] !== 'undefined' ? arrSelectedDates[1].isSame(day, 'day') : false)
                ))
            ) && this.isEnabledDate(day)
        );
    }

    isInSelectedRange = (day) => {
        return this.props.enableRangeSelection && this.isDateBetween(day, this.state.arrSelectedDates, this.props.enableRangeSelection);
    }

    isSelectedRangeFirst = (day) => {
        return this.props.enableRangeSelection && (typeof this.state.arrSelectedDates[0] !== 'undefined') && this.state.arrSelectedDates[0].isSame(day);
    }

    isSelectedRangeLast = (day) => {
        return this.props.enableRangeSelection && (typeof this.state.arrSelectedDates[1] !== 'undefined' && this.state.arrSelectedDates[1].isSame(day));
    }

    showYears = () => {
        this.setState({
            showMonths: false,
            showYears: !this.state.showYears,
            dateClick: true
        });
    }

    changeMonth = (month) => {
        const newDate = moment(this.state.currentDateDisplayed)
            .locale(this.props.locale)
            .month(month)
            .date(1);

        if (!this.props.enableRangeSelection) {
            this.setState({
                currentDateDisplayed: newDate,
                selectedDate: newDate,
                showMonths: false,
                dateClick: true
            }, function() {
                this.props.onChange(newDate);
            });
        } else {
            this.setState({
                currentDateDisplayed: newDate,
                showMonths: false,
                dateClick: true
            });
        }
    }

    changeYear = (year) => {
        const newDate = moment(this.state.currentDateDisplayed).year(year);

        if (!this.props.enableRangeSelection) {
            this.setState({
                currentDateDisplayed: newDate,
                selectedDate: newDate,
                showYears: false,
                dateClick: true
            }, function() {
                this.props.onChange(newDate);
            });
        } else {
            this.setState({
                currentDateDisplayed: newDate,
                showYears: false,
                dateClick: true
            });
        }
    }

    generateMonths = (monthProps) => {
        const months = moment.localeData(this.props.locale).months();
        const listOfMonths = months.map((month, index) => {
            const shortenedNameMonth = moment.localeData(this.props.locale).monthsShort()[index];

            const calendarItemClasses = classnames(
                'fd-calendar__item',
                {
                    'is-selected': months[this.state.currentDateDisplayed.month()] === month,
                    'fd-calendar__item--current': months[this.state.todayDate.month()] === month
                }
            );

            return (
                <li className={calendarItemClasses} key={month}
                    name={month} onClick={() => this.changeMonth(month)}>
                    {shortenedNameMonth}
                </li>
            );
        });

        return (
            <div className='fd-calendar__months'>
                <ul {...monthProps} className='fd-calendar__list'>
                    {listOfMonths}
                </ul>
            </div>
        );
    }

    generateYears = (yearListProps) => {
        let year = this.state.currentDateDisplayed.year();
        const years = [year];
        for (let iterations = 1; iterations < 12; iterations++) {
            year = year + 1;
            years.push(year);
        }
        const listOfYears = years.map(element => {
            const yearClasses = classnames(
                'fd-calendar__item',
                {
                    'is-selected': this.state.currentDateDisplayed.year() === element,
                    'fd-calendar__item--current': this.state.todayDate.year() === element
                }
            );

            return (
                <li className={yearClasses} key={element}
                    name={element} onClick={() => this.changeYear(element)}>
                    {element}
                </li>
            );
        });
        return (
            <div className='fd-calendar__months'>
                <ul {...yearListProps} className='fd-calendar__list'>
                    {listOfYears}
                </ul>
            </div>
        );
    }

    handleNext = () => {
        const { currentDateDisplayed } = this.state;
        if (this.state.showYears) {
            const newDate = moment(currentDateDisplayed).add(12, 'year');
            this.setState({ currentDateDisplayed: newDate, dateClick: true });
        } else {
            const newDate = moment(currentDateDisplayed).add(1, 'month');
            this.setState({ currentDateDisplayed: newDate, dateClick: true });
        }
    }

    handlePrevious = () => {
        const { currentDateDisplayed } = this.state;
        if (this.state.showYears) {
            const newDate = moment(currentDateDisplayed).subtract(12, 'year');
            this.setState({ currentDateDisplayed: newDate, dateClick: true });
        } else {
            const newDate = moment(currentDateDisplayed).subtract(1, 'month');
            this.setState({ currentDateDisplayed: newDate, dateClick: true });
        }
    }

    dateClick = (day, isRangeEnabled) => {
        let selectedDates = [];
        if (typeof isRangeEnabled !== 'undefined' && isRangeEnabled) {
            selectedDates = this.state.arrSelectedDates;
            if (selectedDates.length === 2) {
                selectedDates = [day];
            } else if (typeof selectedDates[0] !== 'undefined' && day.isSameOrBefore(selectedDates[0])) {
                selectedDates = [day, selectedDates[0]];
            } else {
                selectedDates.push(day);
            }
        }

        this.setState({
            currentDateDisplayed: day,
            selectedDate: day,
            arrSelectedDates: selectedDates,
            dateClick: true
        }, function() {
            if (isRangeEnabled) {
                this.props.onChange(selectedDates);
            } else {
                this.props.onChange(day);
            }
        });
    };

    isDateBetween = (date, blockedDates, isRangeEnabled) => {
        if (typeof blockedDates === 'undefined' || typeof blockedDates[0] === 'undefined' || typeof blockedDates[1] === 'undefined') {
            return false;
        }
        if (typeof isRangeEnabled !== 'undefined' || isRangeEnabled) {
            if (blockedDates[0].isAfter(blockedDates[1])) {
                return blockedDates[1].isBefore(date) && blockedDates[0].isAfter(date);
            }
        }
        return blockedDates[0].isBefore(date, 'day') && blockedDates[1].isAfter(date, 'day');
    }

    disableWeekday = (date, weekDays) => {
        if (!weekDays) {
            return false;
        }

        const daysName = moment.weekdays();

        return weekDays.indexOf(daysName[date.day()]) > -1;
    }

    generateNavigation = () => {
        const months = moment.localeData(this.props.locale).months();

        return (
            <header className='fd-calendar__header'>
                <div className='fd-calendar__navigation'>
                    <div className='fd-calendar__action'>
                        <Button
                            compact
                            disableStyles={this.props.disableStyles}
                            glyph='slim-arrow-left'
                            onClick={this.handlePrevious}
                            option='light' />
                    </div>
                    <div className='fd-calendar__action'>
                        <Button
                            compact
                            disableStyles={this.props.disableStyles}
                            onClick={this.showMonths}
                            option='light'>
                            <span>
                                {months[this.state.currentDateDisplayed.month()]}
                            </span>
                        </Button>
                    </div>
                    <div className='fd-calendar__action'>
                        <Button
                            compact
                            disableStyles={this.props.disableStyles}
                            onClick={this.showYears}
                            option='light'>
                            <span>
                                {this.state.currentDateDisplayed.year()}
                            </span>
                        </Button>
                    </div>

                    <div className='fd-calendar__action'>
                        <Button
                            compact
                            disableStyles={this.props.disableStyles}
                            glyph='slim-arrow-right'
                            onClick={this.handleNext}
                            option='light' />
                    </div>
                </div>
            </header>
        );
    }

    generateWeekdays = () => {
        const weekDays = [];
        const daysName = moment.localeData(this.props.locale).weekdaysMin().map(day => day.charAt(0));

        for (let index = 0; index < 7; index++) {
            weekDays.push(
                <th className='fd-calendar__column-header' key={index}>
                    <span className='fd-calendar__day-of-week'>
                        {daysName[index]}
                    </span>
                </th>);
        }
        return <tr className='fd-calendar__row'>{weekDays}</tr>;

    }

    generateDays = (tableBodyProps) => {
        const {
            currentDateDisplayed,
            todayDate
        } = this.state;

        const blockedDates = this.props.blockedDates && this.props.blockedDates.map(date => moment(date));
        const enableRangeSelection = this.props.enableRangeSelection;

        const firstDayMonth = moment(currentDateDisplayed).startOf('month');
        const endDayMonth = moment(firstDayMonth).endOf('month');
        const firstDayWeekMonth = moment(firstDayMonth).startOf('week');
        const lastDateEndMonth = moment(endDayMonth).endOf('week');
        const rows = [];

        let days = [];
        let day = firstDayWeekMonth;
        let dateFormatted = '';

        while (day.isSameOrBefore(lastDateEndMonth)) {
            for (let iterations = 0; iterations < 7; iterations++) {
                dateFormatted = day.date();
                const copyDate = moment(day);

                const dayClasses = classnames(
                    'fd-calendar__item',
                    {
                        'fd-calendar__item--other-month': !day.isSame(currentDateDisplayed, 'month'),
                        'fd-calendar__item--current': todayDate.isSame(copyDate),
                        'is-selected': this.isSelected(day),
                        'is-selected-range-first': this.isSelectedRangeFirst(day),
                        'is-selected-range-last': this.isSelectedRangeLast(day),
                        'is-selected-range': this.isInSelectedRange(day),
                        'is-disabled': !this.isEnabledDate(day),
                        'is-blocked': this.isDateBetween(day, blockedDates)
                    }
                );

                days.push(
                    <td
                        className={dayClasses}
                        key={copyDate}
                        onClick={this.isEnabledDate(day) ? () => this.dateClick(copyDate, enableRangeSelection) : null}
                        role='gridcell' >
                        <span className='fd-calendar__text'>{dateFormatted.toString()}</span>
                    </td >
                );

                day = moment(day).add(1, 'days');
            }

            rows.push(
                <tr className='fd-calendar__row' key={day} >
                    {days}
                </tr>
            );

            days = [];
        }
        return <tbody {...tableBodyProps} className='fd-calendar__group'>{rows}</tbody>;

    }

    _renderContent = (monthListProps, yearListProps, tableProps, tableHeaderProps, tableBodyProps) => {
        if (this.state.showMonths) {
            return this.generateMonths(monthListProps);
        }

        if (this.state.showYears) {
            return this.generateYears(yearListProps);
        }

        return (
            <div className='fd-calendar__dates'>
                <table {...tableProps} className='fd-calendar__table'>
                    <thead {...tableHeaderProps} className='fd-calendar__group'>
                        {this.generateWeekdays()}
                    </thead>
                    {this.generateDays(tableBodyProps)}
                </table>
            </div>
        );
    }

    render() {
        const {
            enableRangeSelection,
            disableStyles,
            disableWeekends,
            disableBeforeDate,
            disableAfterDate,
            disableWeekday,
            disablePastDates,
            disableFutureDates,
            blockedDates,
            disabledDates,
            customDate,
            className,
            localizedText,
            monthListProps,
            yearListProps,
            tableProps,
            tableHeaderProps,
            tableBodyProps,
            ...props
        } = this.props;

        const calendarClasses = classnames(
            'fd-calendar',
            className
        );

        return (
            <div {...props} className={calendarClasses}>
                {this.generateNavigation()}
                <div className='fd-calendar__content'>
                    {this._renderContent(monthListProps, yearListProps, tableProps, tableHeaderProps, tableBodyProps)}
                </div>
            </div>
        );
    }

}

Calendar.displayName = 'Calendar';

Calendar.basePropTypes = {
    blockedDates: PropTypes.arrayOf(PropTypes.instanceOf(Date)),
    customStyles: PropTypes.object,
    disableStyles: PropTypes.bool,
    disableAfterDate: PropTypes.instanceOf(Date),
    disableBeforeDate: PropTypes.instanceOf(Date),
    disabledDates: PropTypes.arrayOf(PropTypes.instanceOf(Date)),
    disableFutureDates: PropTypes.bool,
    disablePastDates: PropTypes.bool,
    disableWeekday: PropTypes.arrayOf(PropTypes.string),
    disableWeekends: PropTypes.bool
};

Calendar.propTypes = {
    ...Calendar.basePropTypes,
    monthListProps: PropTypes.object,
    tableBodyProps: PropTypes.object,
    tableHeaderProps: PropTypes.object,
    tableProps: PropTypes.object,
    yearListProps: PropTypes.object,
    onChange: PropTypes.func
};

Calendar.defaultProps = {
    locale: 'en',
    onChange: () => { }
};

Calendar.propDescriptions = {
    blockedDates: 'Blocks dates that are in between the blocked dates.',
    disableAfterDate: 'Disables dates of a calendar that come after the specified date.',
    disableBeforeDate: 'Disables dates of a calendar that come before the specified date.',
    disabledDates: 'Disables dates that are in between the disabled dates.',
    disableFutureDates: 'Set to **true** to disable dates after today\'s date.',
    disablePastDates: 'Set to **true** to disable dates before today\'s date.',
    disableWeekday: 'Disables dates that match a weekday.',
    disableWeekends: 'Set to **true** to disables dates that match a weekend.',
    monthListProps: 'Additional props to be spread to the month\'s `<ul>` element.',
    tableBodyProps: 'Additional props to be spread to the `<tbody>` element.',
    tableHeaderProps: 'Additional props to be spread to the `<thead>` element.',
    tableProps: 'Additional props to be spread to the `<table>` element.',
    yearListProps: 'Additional props to be spread to the year\'s `<ul>` element.'
};

export { Calendar as __Calendar };

export default withStyles(Calendar, { cssFile: 'calendar', font: true });
