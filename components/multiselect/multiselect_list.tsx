// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {getOptionValue} from 'react-select/src/builtins';

import Constants from 'utils/constants.jsx';
import {cmdOrCtrlPressed} from 'utils/utils.jsx';

import LoadingScreen from 'components/loading_screen.jsx';

import {Value} from './multiselect';

type Props = {
    ariaLabelRenderer: getOptionValue<Value>;
    loading?: boolean;
    onAdd: (value: Value) => void;
    onPageChange?: (newPage: number, currentPage: number) => void;
    onSelect: (value: Value | null) => void;
    optionRenderer: (
        option: Value,
        isSelected: boolean,
        onAdd: (value: Value) => void
    ) => void;
    options: Value[];
    page: number;
    perPage: number;
}

type State = {
    selected: number;
}

const KeyCodes = Constants.KeyCodes;

export default class MultiSelectList extends React.Component<Props, State> {
    public static defaultProps = {
        options: [],
        perPage: 50,
        onAction: () => null,
    };

    private toSelect: number = -1
    private listRef = React.createRef<HTMLDivElement>()
    private selectedRef = React.createRef<HTMLDivElement>()

    public constructor(props: Props) {
        super(props);

        this.toSelect = -1;

        this.state = {
            selected: -1,
        };
    }

    public componentDidMount() {
        document.addEventListener('keydown', this.handleArrowPress);
    }

    public componentWillUnmount() {
        document.removeEventListener('keydown', this.handleArrowPress);
    }

    public UNSAFE_componentWillReceiveProps(nextProps: Props) { // eslint-disable-line camelcase
        this.setState({selected: this.toSelect});

        const options = nextProps.options;

        if (options && options.length > 0 && this.toSelect >= 0) {
            this.props.onSelect(options[this.toSelect]);
        }
    }

    public componentDidUpdate(_: Props, prevState: State) {
        if (prevState.selected === this.state.selected) {
            return;
        }

        if (this.listRef.current && this.selectedRef.current) {
            const elemTop = this.selectedRef.current.getBoundingClientRect().top;
            const elemBottom = this.selectedRef.current.getBoundingClientRect().bottom;
            const listTop = this.listRef.current.getBoundingClientRect().top;
            const listBottom = this.listRef.current.getBoundingClientRect().bottom;
            if (elemBottom > listBottom) {
                this.selectedRef.current.scrollIntoView(false);
            } else if (elemTop < listTop) {
                this.selectedRef.current.scrollIntoView(true);
            }
        }
    }

    public setSelected = (selected: number) => {
        this.toSelect = selected;
    }

    private handleArrowPress = (e: KeyboardEvent) => {
        if (cmdOrCtrlPressed(e) && e.shiftKey) {
            return;
        }

        const options = this.props.options;
        if (options.length === 0) {
            return;
        }

        let selected;
        switch (e.key) {
        case KeyCodes.DOWN[0]:
            if (this.state.selected === -1) {
                selected = 0;
                break;
            }
            selected = Math.min(this.state.selected + 1, options.length - 1);
            break;
        case KeyCodes.UP[0]:
            if (this.state.selected === -1) {
                selected = 0;
                break;
            }
            selected = Math.max(this.state.selected - 1, 0);
            break;
        default:
            return;
        }

        e.preventDefault();
        this.setState({selected});
        this.setSelected(selected);
        this.props.onSelect(options[selected]);
    }

    private defaultOptionRenderer = (option: Value, isSelected: boolean, onAdd: Props['onAdd']) => {
        var rowSelected = '';
        if (isSelected) {
            rowSelected = 'more-modal__row--selected';
        }

        return (
            <div
                ref={isSelected ? 'selected' : option.value}
                className={rowSelected}
                key={'multiselectoption' + option.value}
                onClick={() => onAdd(option)}
            >
                {option.label}
            </div>
        );
    }

    public render() {
        const options = this.props.options;
        let renderOutput;

        if (this.props.loading) {
            renderOutput = (
                <div aria-hidden={true}>
                    <LoadingScreen
                        position='absolute'
                        key='loading'
                    />
                </div>
            );
        } else if (options == null || options.length === 0) {
            renderOutput = (
                <div
                    key='no-users-found'
                    className='no-channel-message'
                >
                    <p className='primary-message'>
                        <FormattedMessage
                            id='multiselect.list.notFound'
                            defaultMessage='No items found'
                        />
                    </p>
                </div>
            );
        } else {
            let renderer: Props['optionRenderer'];
            if (this.props.optionRenderer) {
                renderer = this.props.optionRenderer;
            } else {
                renderer = this.defaultOptionRenderer;
            }

            const optionControls = options.map((o, i) => renderer(o, this.state.selected === i, this.props.onAdd));

            const selectedOption = options[this.state.selected];
            const ariaLabel = this.props.ariaLabelRenderer(selectedOption);

            renderOutput = (
                <div className='more-modal__list'>
                    <div
                        className='sr-only'
                        aria-live='polite'
                        aria-atomic='true'
                    >
                        {ariaLabel}
                    </div>
                    <div
                        ref='list'
                        id='multiSelectList'
                        role='presentation'
                        aria-hidden={true}
                    >
                        {optionControls}
                    </div>
                </div>
            );
        }

        return (
            <div
                className='multi-select__wrapper'
                aria-live='polite'
            >
                {renderOutput}
            </div>
        );
    }
}

