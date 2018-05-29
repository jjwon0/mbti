import React, { Component } from 'react';
import Rheostat from 'rheostat';

import * as API from './api';
import * as utils from './utils';

import './rheostat.css';

class Slider extends Component {
  onChange = ({ values }) => {
    const value = values[0];
    this.props.onChange(value);
  }

  render() {
    const {
      leftLabel,
      rightLabel,
      value,
    } = this.props;
    return (
      <div className="pv3">
        <div className="flex justify-between">
          <label>{leftLabel}</label>
          <label>{rightLabel}</label>
        </div>
        <Rheostat onValuesUpdated={this.onChange} values={[value]} />
      </div>
    );
  }
}


class App extends Component {
  state = {
    mbtiPrediction: undefined,
    mbti: {
      'i': 50,
      'e': 50,
      'n': 50,
      's': 50,
      'f': 50,
      't': 50,
      'j': 50,
      'p': 50,
    },
    requesting: false,
  }

  handleMBTIChange = (category, rightValue) => {
    const [left, right] = category.split('');

    this.setState({
      mbti: {
        ...this.state.mbti,
        [left]: 100 - rightValue,
        [right]: rightValue,
      }
    })
  }

  getMBTI = () => {
    const mbti = this.state.mbti;
    const attributes = [];

    for (let pair of ['ie', 'sn', 'ft', 'jp']) {
      const [first, second] = pair.split('');
      if (mbti[first] > mbti[second]) {
        attributes.push(first);
      } else {
        attributes.push(second);
      }
    }

    return attributes.join('');
  }

  classify = (classifier) => {
    this.setState({
      requesting: true,
    });

    API.fetchMBTIClassification(classifier, this.state.mbti).then(mbti => this.setState({
      mbtiPrediction: mbti,
      requesting: false,
    }));
  }

  render() {
    const { mbti, mbtiPrediction, requesting } = this.state;

    return (
      <div className="pa4 mw6 center">
        <h1>Color Team Predictor</h1>
        <p>Enter your MBTI, and we'll suggest a team for you based on it!</p>

        <div className="pv2" />

        <img src={`https://storage.googleapis.com/neris/public/images/headers/${this.getMBTI()}-personality-type-header.png`} />
        {mbtiPrediction && <p>You should join the {utils.upperCaseFirst(mbtiPrediction)} team!</p>}

        <Slider
          leftLabel={`Extraverted (E): ${mbti.e}%`}
          rightLabel={`Introverted (I): ${mbti.i}%`}
          value={mbti.i}
          onChange={(value) => this.handleMBTIChange('ei', value)}
        />
        <Slider
          leftLabel={`Intuitive (N): ${mbti.n}%`}
          rightLabel={`Observant (S): ${mbti.s}%`}
          value={mbti.s}
          onChange={(value) => this.handleMBTIChange('ns', value)}
        />
        <Slider
          leftLabel={`Thinking (T): ${mbti.t}%`}
          rightLabel={`Feeling (F): ${mbti.f}%`}
          value={mbti.f}
          onChange={(value) => this.handleMBTIChange('tf', value)}
        />
        <Slider
          leftLabel={`Judging (J): ${mbti.j}%`}
          rightLabel={`Prospecting (P): ${mbti.p}%`}
          value={mbti.p}
          onChange={(value) => this.handleMBTIChange('jp', value)}
        />

        <button
          className="fw5 pointer no-underline br-pill ph3 pv2 mb2 dib white bg-dark-blue bn"
          onClick={() => this.classify('bucket')} disabled={requesting}
        >
          Predict
        </button>
      </div>
    );
  }
}

export default App;
