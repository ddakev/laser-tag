import React, { Component } from 'react';
import './StartingView.css';

class StartingView extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
		countdown: 3,
    };
  }
  
  componentDidMount() {
	  const decrementCountdown = () => {
		  const newcd = this.state.countdown - 1;
		  this.setState({countdown: newcd});
		  if(newcd !== 0) {
			  setTimeout(decrementCountdown, 1000);
		  }
		  else {
			  this.props.startGame();
		  }
	  };
	  setTimeout(decrementCountdown, 1000);
  }
  
  render() {
    return (
      <div className="startingView">
        {this.state.countdown}
      </div>
    );
  }
}

export default StartingView;
