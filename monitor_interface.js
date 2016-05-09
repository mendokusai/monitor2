var React = require('react');
var ReactDOM = require('react-dom');

var socket = io();


var MonitorInterface = React.createClass({
  getInitialState: function() {
    return { 
      image: "/stream/photo01.png",
      on: false
    };
  },

  componentDidMount: function() {
    socket.on('update_count', this._updateCounter);
    socket.on('next_photo', this._updatePhoto);
  },

  _updatePhoto(url) {
    var img_url = "/stream/" + url;
    this.setState({ image: img_url });
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

  photoCollection: function() {
    return(
      <div className="top-photo container">
        <img src={this.state.image}/>
      </div>

    );
  }

  render: function() {
    return(
      <div className="container">
        Camera:
        <button
          className="btn btn-info"
          onClick={this.startCamera}>Start
        </button>
        <button
          className="btn btn-info"
          onClick={this.stopCamera}>Stop
        </button>
        <hr/>
        <div className="container">
          <img src={this.state.image}/>
        </div>
      </div>
    );
  }
});

ReactDOM.render(<MonitorInterface/>, document.getElementById('interface'));
