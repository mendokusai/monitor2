var React = require('react');
var ReactDOM = require('react-dom');


var HelloMessage = React.createClass({
  render: function() {
    return <h1>Hello from React</h1>
  }
});

ReactDOM.render(<HelloMessage/>, document.getElementById('hi'));