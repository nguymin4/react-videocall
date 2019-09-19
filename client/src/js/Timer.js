import React, { Component } from 'react';
import PropTypes from 'proptypes';

// Add zero padding
function zeroPad(number, size = 2) {
    let s = String(number);
    while (s.length < size) { s = '0' + s;}
    return s;
  }
  
  // Convert time from miliseconds int to hh:mm:ss.S string
  function timeFormat(miliseconds) {
  
    let remaining = miliseconds / 1000;
  
    const hh = parseInt( remaining / 3600, 10 );
  
    remaining %= 3600;
  
    const mm = parseInt( remaining / 60, 10 );
    const ss = parseInt( remaining % 60, 10 );
    const S  = parseInt( (miliseconds % 1000) / 100, 10 );
  
    return `${ zeroPad( hh ) }:${ zeroPad( mm ) }:${ zeroPad( ss ) }.${ S }`;
  }

class Timer extends Component {

  render() {
    const { time } = this.props;

    return (
      <div className="Timer">
        { timeFormat( time ) }
      </div>
    );
  }
}

Timer.propTypes = {
  time : PropTypes.number
};

export default Timer;