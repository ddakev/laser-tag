import React, { Component } from 'react';
import './NotStartedView.css';

class NotStartedView extends Component {
  render() {
    return (
      <div className="notStartedView">
        <h2>Players</h2>
        <table id="playerTable">
          <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
          </tr>
          </thead>
          <tbody>
          {
            this.props.players.map(player => {
              return (
                <tr key={player.id}>
                  <td>{player.id}</td>
                  <td><input type="text" name={"name"+player.id} value={player.name} onChange={this.props.handleChange}/></td>
                </tr>
              );
            })
          }
          </tbody>
        </table>
        <button id="startGame" onClick={this.props.startGame}>Start Game</button>
      </div>
    );
  }
}

export default NotStartedView;
