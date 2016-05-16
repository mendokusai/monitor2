var React = require('react');
var ReactDOM = require('react-dom');

var socket = io();

var OldImage = React.createClass({
  propTypes: {
      image: React.PropTypes.string,
      imageNumber: React.PropTypes.number
  },

  getImageStyle: function(number) {
    var topPosition = (30 * number) || 10;
    var leftPosition = (30 * number) || 10;
    var z = -(number);
    return {
      top: topPosition,
      left: leftPosition,
      zIndex: z,
      opacity: 0.6
    }
  },

  render: function() {
    var imageNumber = this.props.imageNumber;
    var imageStyle = this.getImageStyle(imageNumber);
    return(
      <img id={imageNumber}
           className="old-photo"
           style={imageStyle}
           src={this.props.image} />
    );
  }
});

var MonitorInterface = React.createClass({
  propTypes: {
    oldImages: React.PropTypes.array
  },

  getInitialState: function() {
    return {
      image: "/stream/01.png",
      on: false
    };
  },

  componentDidMount: function() {
    socket.on('update_count', this._updateCounter);
    socket.on('next_photo', this._updatePhoto);
  },

  _updatePhoto(url) {
    var img_url = "/stream/" + url;
    if (this.props.oldImages > 0 || this.state.image) {
      var expiredPhoto = this.state.image;
      this.props.oldImages.push(expiredPhoto);
    }
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
      <div className="top container">
        <div className="top-photo container">
          <img src={this.state.image}/>
        </div>
        {this.oldPhotoCollection()}
      </div>
    );
  },

  oldPhotoCollection: function() {
    var olds = [];
    var number = 0;
    if (!this.props.oldImages) {
      return null;
    }
    this.props.oldImages.map(function(img) {
      olds.push(<OldImage key={number} image={img} imageNumber={number}/>);
      number++;
    });
    return(
      <div className="old container">
        {olds}
      </div>
    );
  },

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
          {this.photoCollection()}
        </div>
      </div>
    );
  }
});
// test array for non-pi trials.
// uses oldImages as a prop
//
// var old_images = [
//   "/stream/02.png",
//   "/stream/03.png",
//   "/stream/04.png",
//   "/stream/05.png",
//   "/stream/06.png",
//   "/stream/07.png",
// ];
ReactDOM.render(<MonitorInterface />,
  document.getElementById('interface')
);
