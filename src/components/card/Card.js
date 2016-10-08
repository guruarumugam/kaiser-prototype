import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { DragSource, DropTarget } from 'react-dnd';
import * as State from '../../data/State';
import ItemTypes from '../../data/ItemTypes';
import './Card.css'

class Card extends Component {
  render() {
    //console.log("Card render:", this.props);
    const {
      connectDragSource,
      connectDropTarget,
      isDragging,
      card: {
        title
      }
    } = this.props;
    const opacity = isDragging ? 0 : 1;

    return connectDragSource(connectDropTarget(
      <div className="Card" style={{opacity}}>
        <div className="title" onClick={this.handleClick.bind(this)}>{title}</div>
      </div>
    ));
  }

  handleClick() {
    State.getReduxStore().dispatch({type: 'SET_CARD_TITLE', title:'BOOM'});
  }
}

const cardSource = {
  beginDrag(props) {
    return {
      id: props.id,
      index: props.index,
      columnIndex: props.columnIndex
    };
  }
};

const cardTarget = {
  hover(props, monitor, component) {
    const dragIndex = monitor.getItem().index;
    const columnIndex = monitor.getItem().columnIndex;
    const hoverIndex = props.index;

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }

    // Determine rectangle on screen
    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();

    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

    // Determine mouse position
    const clientOffset = monitor.getClientOffset();

    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;

    // Only perform the move when the mouse has crossed half of the items height
    // When dragging downwards, only move when the cursor is below 50%
    // When dragging upwards, only move when the cursor is above 50%

    // Dragging downwards
    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
      return;
    }

    // Dragging upwards
    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
      return;
    }
    // Time to actually perform the action
    State.getReduxStore().dispatch({type: 'REORDER_CARD', columnIndex, dragIndex, hoverIndex});

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = hoverIndex;
  }
};

function collectDropTarget(connect) {
  return {
    connectDropTarget:connect.dropTarget()
  };
}

function collectDragSource(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  }
}

let DraggableCard = DragSource(ItemTypes.CARD, cardSource, collectDragSource)(Card);
export default DropTarget(ItemTypes.CARD, cardTarget, collectDropTarget)(DraggableCard);
