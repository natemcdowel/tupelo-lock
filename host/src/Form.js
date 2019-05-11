import React from "react";;

export default class Form extends React.Component {
  endpoint = 'http://10.0.0.240:2000/register?email=';
  state = {
    email: "",
    message: ""
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
    fetch( this.endpoint + this.state.email)
      .then(response => response.json())
      .then(result => {
        this.setState({message: 'Email registered! Notifying guest of access.'});
      })
      .catch(e => {
        this.setState({message: 'There was an error registering the guest.'});
      });
  } 


  render() {
    return (
      <form>
        <br />
        <input
          name="email"
          placeholder="Email"
          value={this.state.email}
          onChange={e => this.change(e)}
        />
        <br /><br />
        <span>{this.state.message}</span>
        <br /><br />
        <button onClick={e => this.onSubmit(e)}>Generate token</button>
      </form>
    );
  }
}
