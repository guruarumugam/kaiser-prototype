import React, { Component } from 'react';
import * as State from '../../data/State.js';
import Column from '../column/Column';
import './Line.css';

class Line extends Component {

  constructor(props) {
    super(props)
    this.state = {
      mouseOver:false
    }
  }

  render() {

    const {
      line: {
        title,
        type,
        expanded,
        maximised
      }
    } = this.props;

    return (
      <div className="Line" style={{height: (expanded?(maximised?'800px':'250px'):'30px')}} onMouseEnter={this.onMouseEnter.bind(this)} onMouseLeave={this.onMouseLeave.bind(this)}>
        <p className="title" onClick={this.handleTitleClicked.bind(this)}>
            <i className={"fa " + (expanded?"fa-caret-down":"fa-caret-right")} style={{width:'12px'}}></i>
            {title}
            <span style={{display:(this.state.mouseOver?'inline':'none')}}>
            {type == 'component' &&  <i style={{fontSize:'12px', marginLeft:'5px', color:'#87b2da'}} className="fa fa-pencil" onClick={this.handleEditClicked.bind(this)}></i>}
            <i style={{fontSize:'12px', marginLeft:'5px', color:'#87b2da'}} className="fa fa-arrows-alt" onClick={this.handleMaximiseClicked.bind(this)}></i>
          </span>
        </p>
        <div className="columns" style={{display:(expanded?'flex':'none')}}>
          {this.props.line.columnIds.map( (columnId, index) => {
            const column = State.findColumn(columnId);
            return (<Column key={column.id} column={column} columnIndex={index} />);
          })}
        </div>
      </div>
    );
  }

  handleTitleClicked() {
    State.getReduxStore().dispatch({type: 'TOGGLE_LINE_EXPANDED', lineId: this.props.line.id});
  }

  handleEditClicked(e) {
    e.stopPropagation();
    const title = prompt("Enter component title: ", this.props.line.title);
    if(title && title.length > 0) {
      State.getReduxStore().dispatch({type: 'SET_LINE_TITLE', lineId: this.props.line.id, title});
    }
  }

  handleMaximiseClicked(e) {
    e.stopPropagation();
    State.getReduxStore().dispatch({type: 'TOGGLE_LINE_MAXIMISED', lineId: this.props.line.id});
  }

  onMouseEnter() {
    this.setState({mouseOver:true});
  }

  onMouseLeave() {
    this.setState({mouseOver:false});
  }
}

export default Line;
