import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import HostForm from "./HostForm";

class App extends Component {

  state = {
    fields: {}
  };

  onChange = updatedValue => {
    this.setState({
      fields: {
        ...this.state.fields,
        ...updatedValue
      }
    });
  };

  render() {
    return (
      <div className="App">
        <HostForm onChange={fields => this.onChange(fields)} />
      </div>
    );
  }
}

export default App;
