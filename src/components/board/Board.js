import React, { Component } from 'react';
import MembersBox from '../members-box/MembersBox';
import BacklogLine from '../backlog-line/BacklogLine';
import ComponentLine from '../component-line/ComponentLine';
import TestLine from '../test-line/TestLine';
import DoneLine from '../done-line/DoneLine';
import ScratchLine from '../scratch-line/ScratchLine';
import CustomDragLayer from './CustomDragLayer';
import './Board.css';

class Board extends Component {
  render() {
    return (
      <div className="Board">
        <MembersBox members={this.props.state.board.members}/>
        <CustomDragLayer/>
        <div className="lines">
        {this.props.state.lines.map( (line) => {
          switch(line.type) {
            case 'backlog': return (<BacklogLine key={line.id} line={line} columns={this.props.state.columns}/>);
            case 'component': return (<ComponentLine key={line.id} line={line} columns={this.props.state.columns}/>);
            case 'test': return (<TestLine key={line.id} line={line} columns={this.props.state.columns}/>);
            case 'done': return (<DoneLine key={line.id} line={line} columns={this.props.state.columns}/>);
            case 'scratch': return (<ScratchLine key={line.id} line={line} columns={this.props.state.columns}/>);
            default: console.error("Invalid line type: " + line.type); return null;
          }
        })}
        </div>
      </div>
    );
  }
}

export default Board;
