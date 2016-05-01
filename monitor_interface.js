var React = require('react');
var ReactDOM = require('react-dom');

var socket = io();


var MonitorInterface = React.createClass({
  getInitialState: function() {
    socket.emit('current_count');
    return { count: 0};
  },

  componentDidMount: function() {
    socket.on('update_count', this._updateCounter);
  },

  increaseCount: function() {
    socket.emit('count');
  },

  _updateCounter(data) {
    this.setState({ count: parseInt(data) });

  },

  clickAye: function() {
    socket.emit('click', 'A');
  },

  clickBee: function() {
    socket.emit('click', 'B');
  },

  render: function() {
    return(
      <div>
        <h1>Hello from React</h1>
        <div onChange={this.updateCounter}>
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