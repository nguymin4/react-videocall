import React, { Component } from 'react';
import Timer         from './Timer';

const UPDATE_INTERVAL = 1000;

function getDefaultState() {
  return {
    isRunning : false,
    time      : 0
  }
}

class Watch extends Component {

  constructor( props ) {
    super(props);
    this.state    = getDefaultState();
    this.timerRef = null;
  }

  componentDidMount() {
    this.start();
  }

  updateTimer(extraTime) {
    const { time } = this.state;
    this.setState({ time : time + extraTime });
  }

  start() {
    this.setState({
      isRunning : true 
    }, () => {
      this.timerRef = setInterval(
        () => { this.updateTimer( UPDATE_INTERVAL ) }, UPDATE_INTERVAL
      )
    });
  }

  stop() {
    this.setState({
      isRunning : false 
    }, () => {
      clearInterval(this.timerRef);
    });
  }
  
  render() {

    const { time } = this.state;

    return (
      <div className="watch">

        <h1>Tiempo</h1>

        <Timer time={ time } />
      </div>
    );
  }
}

export default Watch;