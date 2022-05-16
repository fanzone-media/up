import PropTypes, { InferProps } from 'prop-types';
import { Component } from 'react';
import { filter } from './filter';

const propTypes = {
  value: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  renderResults: PropTypes.func.isRequired,
  pick: PropTypes.arrayOf(PropTypes.string),
};

type Props = InferProps<typeof propTypes>;

export default class FilterResults extends Component<Props> {
  static propTypes: {
    value: PropTypes.Validator<string>;
    data: PropTypes.Validator<(object | null | undefined)[]>;
    renderResults: PropTypes.Validator<(...args: any[]) => any>;
    pick: PropTypes.Requireable<(string | null | undefined)[]>;
  };
  render() {
    const { value, data, pick } = this.props;
    return this.props.renderResults(filter(value, data, pick));
  }
}

FilterResults.propTypes = propTypes;
