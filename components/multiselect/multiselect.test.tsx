// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallow} from 'enzyme';

import MultiSelect from 'components/multiselect/multiselect';

const element = (props: any) => <div/>;
const noop = (props: any) => {};

describe('components/multiselect/multiselect', () => {
    const totalCount = 8;
    const optionsNumber = 8;
    const users = [];
    for (var i = 0; i < optionsNumber; i++) {
        users.push({id: `${i}`, label: `${i}`, value: `${i}`});
    }

    const baseProps = {
        ariaLabelRenderer: element as any,
        handleAdd: noop,
        handleDelete: noop,
        handleInput: noop,
        handleSubmit: noop,
        optionRenderer: element,
        options: users,
        perPage: 5,
        saving: false,
        totalCount,
        users,
        valueRenderer: element as any,
        values: [{id: 'id', label: 'label', value: 'value'}],
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <MultiSelect {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot for page 2', () => {
        const wrapper = shallow(
            <MultiSelect {...baseProps}/>
        );

        wrapper.find('.filter-control__next').simulate('click');
        wrapper.update();
        expect(wrapper.state('page')).toEqual(1);
        expect(wrapper).toMatchSnapshot();
    });
});