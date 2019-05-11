import React from "react";;

export default class Form extends React.Component {
  state = {
    email: "",

  };

  change = e => {
    this.props.onChange({ [e.target.name]: e.target.value });
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  onSubmit = e => {
    e.preventDefault();
    // this.props.onSubmit(this.state);
    this.setState({
      email: "",
    });
    this.props.onChange({
      email: "",
    });

    this.generateToken();
  };

  generateToken = () => {
    fetch('http://10.0.0.212:3000/register')
      .then(response => response.json())
      .then(data => {
        console.log(data);
      });
  } 


  render() {
    return (
      <form>
        <input
          name="email"
          placeholder="Email"
          value={this.state.email}
          onChange={e => this.change(e)}
        />
        <br /><br />
        <button onClick={e => this.onSubmit(e)}>Generate token</button>
      </form>
    );
  }
}
