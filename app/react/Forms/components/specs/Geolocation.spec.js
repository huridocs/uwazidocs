import React from 'react';
import { shallow } from 'enzyme';

import Geolocation from '../Geolocation';

describe('Geolocation', () => {
  let component;
  let props;

  beforeEach(() => {
    props = {
      value: { lat: 32.18, lon: -17.2 },
      onChange: jasmine.createSpy('onChange')
    };
  });

  const render = () => {
    component = shallow(<Geolocation {...props}/>);
  };

  it('should render 2 inputs with the lat and lon values', () => {
    render();
    const inputs = component.find('input');
    const latInput = inputs.first();
    const lonInput = inputs.last();
    expect(latInput.props().value).toBe(32.18);
    expect(lonInput.props().value).toBe(-17.2);
  });

  describe('when lat changes', () => {
    it('should call onChange with the new value', () => {
      render();
      const inputs = component.find('input');
      const latInput = inputs.first();
      latInput.simulate('change', { target: { value: '19' } });
      expect(props.onChange).toHaveBeenCalledWith({ lat: 19, lon: -17.2 });
    });
    describe('if lon is empty and lat is set to empty', () => {
      it('should call onChange without a value', () => {
        props.value.lon = '';
        render();
        const inputs = component.find('input');
        const latInput = inputs.first();
        latInput.simulate('change', { target: { value: '' } });
        expect(props.onChange.calls.argsFor(0)).toEqual([]);
      });
    });
  });

  describe('when lon changes', () => {
    it('should call onChange with the new value', () => {
      render();
      const inputs = component.find('input');
      const lonInput = inputs.last();
      lonInput.simulate('change', { target: { value: '28' } });
      expect(props.onChange).toHaveBeenCalledWith({ lat: 32.18, lon: 28 });
    });
    describe('if lat is empty and lon is set to empty', () => {
      it('should call onChange without a value', () => {
        props.value.lat = '';
        render();
        const inputs = component.find('input');
        const lonInput = inputs.last();
        lonInput.simulate('change', { target: { value: '' } });
        expect(props.onChange.calls.argsFor(0)).toEqual([]);
      });
    });
  });

  it('should render button to clear fields', () => {
    render();
    expect(component).toMatchSnapshot();
  });

  it('should hide clear fields button when lat and lon are empty', () => {
    props.value = { lat: '', lon: '' };
    render();
    expect(component).toMatchSnapshot();
  });

  describe('when clear fields button is clicked', () => {
    it('should call onChange without a value', () => {
      render();
      const button = component.find('.clear-field-button button').first();
      button.simulate('click');
      expect(props.onChange.calls.argsFor(0)).toEqual([]);
    });
  });
});
