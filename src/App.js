import React, { Component } from 'react';
import io from 'socket.io-client';
import './App.css';
import NotStartedView from './NotStartedView.js';
import StartingView from './StartingView.js';
import RunningView from './RunningView.js';
import EndedView from './EndedView.js';

const GameMode = {
    NOT_STARTED: "NOT_STARTED",
    STARTING: "STARTING",
    RUNNING: "RUNNING",
    ENDED: "ENDED",
};

class App extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      players: [],
      gameMode: GameMode.NOT_STARTED,
      socket: null,
      remainingTime: 0,
    };
    
    this.handleChange = this.handleChange.bind(this);
    this.initiateGame = this.initiateGame.bind(this);
    this.startGame = this.startGame.bind(this);
    this.restartGame = this.restartGame.bind(this);
  }
  
  componentDidMount() {
    const socket = io("http://localhost:8080");
    this.setState({socket: socket});
    
    socket.on('new player', data => {
      console.log(data);
      this.setState({players: data.players});
    });
    
    socket.on('gamestate', data => {
      console.log(data);
      this.setState({gameMode: data.gameState});
    });
  }
  
  handleChange(e) {
    const id = parseInt(e.target.name.substr(4, 1));
    const newPlayers = JSON.parse(JSON.stringify(this.state.players));
    console.log(id, newPlayers[id]);
    newPlayers[id].name = e.target.value;
    this.setState({players: newPlayers});
    this.state.socket.emit('add player', {players: newPlayers});
  }
  
  initiateGame() {
    this.state.socket.emit('start game', {duration: 20});
    this.setState({gameMode: GameMode.STARTING});
  }
  
  startGame() {
    this.setState({
      gameMode: GameMode.RUNNING,
      remainingTime: 20
    });
    
    const countdown = setInterval(() => {
      const newTime = this.state.remainingTime - 1;
      if(newTime === 0) {
        this.setState({gameMode: GameMode.ENDED});
        clearInterval(countdown);
      }
      else {
        this.setState({remainingTime: newTime});
      }
    }, 1000);
  }
  
  restartGame() {
    this.state.socket.emit('restart game', {});
    this.setState({gameMode: GameMode.NOT_STARTED});
  }
  
  render() {
    return (
      <div className="App">
        {
          this.state.gameMode === GameMode.NOT_STARTED
            ? <NotStartedView players={this.state.players} handleChange={this.handleChange} startGame={this.initiateGame} />
            : this.state.gameMode === GameMode.STARTING
              ? <StartingView startGame={this.startGame} />
              : this.state.gameMode === GameMode.RUNNING
                ? <RunningView players={this.state.players} remainingTime={this.state.remainingTime} />
                : <EndedView players={this.state.players} restartGame={this.restartGame} />
        }
      </div>
    );
  }
}

export default App;
