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
      min,
      max,
      value,
    } = this.props;
    return (
      <div className="pv3">
        <div className="flex justify-between">
          <label>{leftLabel}</label>
          <label>{rightLabel}</label>
        </div>
        <Rheostat onValuesUpdated={this.onChange} min={min} max={max} values={[value]} />
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
    tab: 'predictor',
    numClusters: 5,
    clusters: [],
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
    API.fetchMBTIClassification(classifier, this.state.mbti).then(mbti => this.setState({
      mbtiPrediction: mbti,
      requesting: false,
    }));
  }

  cluster = (numClusters) => {
    this.setState({
      requesting: true,
    });

    API.fetchMBTIClusters(numClusters).then(clusters => this.setState({
      clusters,
      requesting: false,
    }))
  }

  renderPredictorTab() {
    const { mbti, mbtiPrediction, requesting } = this.state;

    return (
      <div>
        <h3>Predictor</h3>
        <p>Enter your MBTI, and we'll suggest a team for you based on it!</p>

        <div className="pv2" />

        <img alt={this.getMBTI()} src={`https://storage.googleapis.com/neris/public/images/headers/${this.getMBTI()}-personality-type-header.png`} />
        {mbtiPrediction && <p>Your personality is similar to those on the {utils.upperCaseFirst(mbtiPrediction)} team!</p>}

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

  renderClustersTab() {
    const { clusters, numClusters, requesting } = this.state;

    return (
      <div>
        <h3>Clusters</h3>

        <p className="lh-copy">If we grouped people into <i>n</i> groups based on their personality types, what would the average personality types of these groups be?</p>

        <p className="lh-copy">Try to guess what teams these might reflect 🤔</p>

        <div className="pv2" />

        <Slider
          leftLabel="0"
          rightLabel="10"
          min={0}
          max={10}
          value={numClusters}
          onChange={(value) =>     this.setState({
            numClusters: value,
          })}
        />

        <button
          className="fw5 pointer no-underline br-pill ph3 pv2 mb2 dib white bg-dark-blue bn"
          onClick={() => this.cluster(numClusters)} disabled={requesting}
        >
          Get MBTI types of {numClusters} clusters
        </button>

        <div className="pv2" />

        {clusters.length > 0 &&
          clusters.map(cluster =>
            <img alt={cluster} src={`https://storage.googleapis.com/neris/public/images/headers/${cluster.toLowerCase()}-personality-type-header.png`} />
          )
        }
      </div>
    );
  }

  renderMethodologyTab() {
    return (
      <div>
        <h3>Methodology</h3>
        <p className="lh-copy">
          Prediction is done using linear regression, and clustering is done with k-means.
        </p>
        <p className="lh-copy">
          You can find the data used <a href="https://docs.google.com/spreadsheets/d/1JeCx31YuboKmA3-rKsTt9WeyK7KfsbXJgY9dla_HLXk/edit#gid=0">here</a>. A copy of the data on the first sheet is downloaded and lives on the server. People were bucketed into larger teams to make predictions a bit more accurate. The teams are:
        </p>
        <ul>
          <li>Eng</li>
          <li>Product (product + design)</li>
          <li>Science (lab + content + other science-y people)</li>
          <li>Support (support + gc)</li>
          <li>Bizops</li>
        </ul>
        <p className="lh-copy">
          The code lives on Github <a href="https://github.com/jjwon0/mbti/">here</a>.
        </p>
      </div>
    );
  }

  render() {
    const { tab } = this.state;

    return (
      <div className="pa4 mw6 center">
        <h1>Color MBTI</h1>
        <ul className="pl0 pb4">
          <li className="dark-blue pointer dim dib mr2" onClick={() => this.setState({tab: 'predictor'})}>Predictor</li>
          <li className="dark-blue pointer dim dib mr2" onClick={() => this.setState({tab: 'clusters'})}>Clusters</li>
          <li className="dark-blue pointer dim dib mr2" onClick={() => this.setState({tab: 'methodology'})}>Methodology</li>
        </ul>
        {tab === 'predictor' && this.renderPredictorTab()}
        {tab === 'clusters' && this.renderClustersTab()}
        {tab === 'methodology' && this.renderMethodologyTab()}
      </div>
    );
  }
}

export default App;
