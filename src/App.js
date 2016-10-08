import React, { Component } from 'react';
import { connect } from 'react-redux';
import BoardPage from './pages/BoardPage';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';


class App extends Component {

  render() {
    return (
      <div className="App">
        <BoardPage boards={this.props.state.boards}/>
        <button onClick={this.handleClick.bind(this)}>BOOM</button>
      </div>
    );
  }

  handleClick() {
    this.props.dispatch({type: 'SET_CARD_TITLE', title:'BOOM'});
  }
}


const mapStateToProps = (state) => {
  return {
    state
  }
}

App = connect(mapStateToProps)(App)
export default DragDropContext(HTML5Backend)(App);
