import React, { Component } from 'react';
import './RunningView.css';

class RunningView extends Component {
  

  render() {
    return (
      <div className="runningView">
        <h1>{(this.props.remainingTime / 60 < 10 ? "0" : "") + Math.floor(this.props.remainingTime / 60) + ":" + (this.props.remainingTime % 60 < 10 ? "0" : "") + this.props.remainingTime % 60}</h1>
        <table id="playerTable">
          <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Kills</th>
            <th>Deaths</th>
            <th>K/D</th>
            <th>Accuracy</th>
            <th>Score</th>
          </tr>
          </thead>
          <tbody>
          {
            this.props.players.sort((a, b) => b.score - a.score).map(player => {
              return (
                <tr key={player.id}>
                  <td>{player.id}</td>
                  <td>{player.name}</td>
                  <td>{player.kills}</td>
                  <td>{player.deaths}</td>
                  <td>{player.deaths === 0 ? (player.kills > 0 ? "Infinity" : 0) : Math.round(100 * player.kills / player.deaths) / 100}</td>
                  <td>{player.shots === 0 ? "0%" : Math.round(100 * player.kills / player.shots) / 100 + "%"}</td>
                  <td>{player.score}</td>
                </tr>
              );
            })
          }
          </tbody>
        </table>
      </div>
    );
  }
}

export default RunningView;
