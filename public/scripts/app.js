/**
 * React Example
 * Author: Brad Newman
 * For: Cardinal Code/Beer Event
 */

var Item = React.createClass({
  rawMarkup: function() {
    var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
    return { __html: rawMarkup };
  },

  render: function() {
    return (
        <div className="item">
        <h3 className="framework">
          {this.props.framework}
        </h3>
        <span dangerouslySetInnerHTML={this.rawMarkup()} />
      </div>
    );
  }
});

var FrameworkBox = React.createClass({
  loadFrameworks: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleSubmit: function(framework) {
    var frameworks = this.state.data;
    framework.id = generateUUID();
    this.setState({data: framework});
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: framework,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({data: frameworks});
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    this.loadFrameworks();
    setInterval(this.loadFrameworks, this.props.pollInterval);
  },
  render: function() {
    return (
      <div>
        <h1>Framework List</h1>
        <FrameworkList data={this.state.data} />
        <Form onSubmit={this.handleSubmit} />
      </div>
    );
  }
});

var FrameworkList = React.createClass({
  render: function() {
    var frameworkNodes = this.props.data.map(function(framework) {
      return (
        <Item framework={framework.framework} key={framework.id}>
          {framework.description}
        </Item>
      );
    });
    return (
      <div className="FrameworkList">
        {frameworkNodes}
      </div>
    );
  }
});

var Form = React.createClass({
  getInitialState: function() {
    return {framework: '', description: ''};
  },
  handleFrameworkChange: function(e) {
    this.setState({framework: e.target.value});
  },
  handleDescriptionChange: function(e) {
    this.setState({description: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var framework = this.state.framework.trim();
    var description = this.state.description.trim();
    if (!framework || !description) {
      return;
    }
    this.props.onSubmit({framework: framework, description: description});
    this.setState({framework: '', description: ''});
  },
  render: function() {
    return (
      <form onSubmit={this.handleSubmit}>
        <input
        type="text"
        placeholder="Framework"
        value={this.state.framework}
        onChange={this.handleFrameworkChange}
        />
        <input
        type="text"
        placeholder="Description"
        value={this.state.description}
        onChange={this.handleDescriptionChange}
        />
        <input type="submit" value="Post" />
      </form>
    );
  }
});

ReactDOM.render(
<FrameworkBox url="/api/frameworks" pollInterval={2000} />,
  document.getElementById('content')
);

// Utils
function generateUUID() {
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (d + Math.random()*16)%16 | 0;
    d = Math.floor(d/16);
    return (c=='x' ? r : (r&0x3|0x8)).toString(16);
  });
  return uuid;
}
