var React = require('react');
var ReactDOM = require('react-dom');

var socket = io();


var MonitorInterface = React.createClass({
  getInitialState: function() {
    socket.emit('current_count');
    return { 
      count: 0,
      image: "/stream/01.png",
      on: false
    };
  },

  componentDidMount: function() {
    socket.on('update_count', this._updateCounter);
    socket.on('next_photo', this._updatePhoto);
  },

  increaseCount: function() {
    socket.emit('count');
  },

  _updatePhoto(url) {
    this.setState({ image: url });
  },

  _updateCounter(data) {
    this.setState({ count: parseInt(data) });

  },

  startCamera: function() {
    if (!this.state.on) {
      this.setState({ on: true });
      socket.emit('start_cam');
    }
  },

  stopCamera: function() {
    if (this.state.on) {
      this.setState({ on: false });
      socket.emit('stop_cam');
    }
  },

  clickAye: function() {
    socket.emit('click', 'A');
  },

  clickBee: function() {
    socket.emit('click', 'B');
  },

  render: function() {
    return(
      <div className="container">
        <img src={this.state.image}/>
        <hr/>
        Camera:
        <button
          className="btn btn-info"
          onClick={this.startCamera}>Start
        </button>
        <button
          className="btn btn-info"
          onClick={this.stopCamera}>Stop
        </button>
        <div onChange={this._updateCounter}>
          Counter: {this.state.count}
        </div>
        <button
          className="btn btn-danger"
          onClick={this.increaseCount}>Counter
        </button>
        <button
          className="btn btn-danger"
          onClick={this.clickAye}>AYE
        </button>
        <button
          className="btn btn-danger"
          onClick={this.clickBee}>BEE
        </button>
      </div>
    );
  }
});

ReactDOM.render(<MonitorInterface/>, document.getElementById('interface'));
