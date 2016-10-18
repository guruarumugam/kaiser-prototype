import {createStore} from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import persistState from 'redux-localstorage';
import {sampleState} from './SampleState';
import update from 'react-addons-update';
import slug from 'slug';
import uuid from 'uuid';

let defaultState = {
  client: {
    currentUsername: 'annonymous',
    page: {
      current:'board'
    },
  },
  settings: {
    currentCardNumber:0,
    showLineSummaryBadges:false
  },
  board: {
    id: 'board1',
    title: 'Default',
    members: []
  },
  lines: [],
  columns: []
};

function reducer(state, action) {
  //console.log(">> reducer for " + action.type);
  //console.log("-- reducer state", state);
  //console.log("-- reducer action", action);
  //console.log("<< reducer for " + action.type);
  switch(action.type) {
    case 'SET_STATE': {
      return action.state;
    }
    case 'NEW_BOARD': {
      return defaultState;
    }
    case 'LOAD_SAMPLE_DATA': {
      return sampleState;
    }
    case 'NEW_LINE': {
      const id = slug(action.title);
      let newState = update(state, {
        lines: { $splice: [[1,0, {
          id,
          title: action.title,
          type: 'component',
          expanded:true,
          columnIds: [`${id}/todo`, `${id}/doing`, `${id}/paused`, `${id}/blocked`, `${id}/review`, `${id}/test-ready`, `${id}/testing`, `${id}/done`],
        }]]}
      });
      return update(newState, {
        columns: { $push: [{
          id: `${id}/todo`,
          title: "Todo",
          lineId: `${id}`,
          type:'todo',
          cards:[]
        },{
          id: `${id}/doing`,
          title: "Doing",
          lineId: `${id}`,
          type:'doing',
          cards:[]
        },{
          id: `${id}/paused`,
          title: "Paused",
          lineId: `${id}`,
          type:'paused',
          collapsed:true,
          cards:[]
        },{
          id: `${id}/blocked`,
          title: "Blocked",
          type:'blocked',
          collapsed:true,
          lineId: `${id}`,
          cards:[]
        },{
          id: `${id}/review`,
          title: "Review",
          type:'review',
          collapsed:true,
          lineId: `${id}`,
          cards:[]
        },{
          id: `${id}/test-ready`,
          title: "Test Ready",
          type:'test-ready',
          lineId: `${id}`,
          cards:[]
        },{
          id: `${id}/testing`,
          title: "Testing",
          type: 'testing',
          lineId: `${id}`,
          cards:[]
        },{
          id: `${id}/done`,
          title: "Done",
          type:'done',
          lineId: `${id}`,
          cards:[]
        }]}
      });
    }
    case 'SET_LINE_TITLE': {
      const lineIndex = findLineIndex(action.lineId);
      return update(state, {
        lines: {[lineIndex]: {
          title: {$set: action.title}
        }}
      });
    }
    case 'SET_CARD_TITLE': {
      const columnIndex = findColumnIndex(action.columnId);
      const cardIndex = findCardIndex(state.columns[columnIndex], action.cardId);
      return update(state, {
        columns: {[columnIndex]: {
          cards: {[cardIndex]: {
            title: {$set: action.title},
            editMode: {$set: action.editMode}
          }}
        }}
      });
    }
    case 'SET_CARD_TYPE': {
      const columnIndex = findColumnIndex(action.columnId);
      const cardIndex = findCardIndex(state.columns[columnIndex], action.cardId);
      return update(state, {
        columns: {[columnIndex]: {
          cards: {[cardIndex]: {
            type: {$set: action.cardType}
          }}
        }}
      });
    }
    case 'SET_CARD_EDIT_MODE': {
      const columnIndex = findColumnIndex(action.columnId);
      const cardIndex = findCardIndex(state.columns[columnIndex], action.cardId);
      return update(state, {
        columns: {[columnIndex]: {
          cards: {[cardIndex]: {
            editMode: {$set: action.editMode}
          }}
        }}
      });
    }
    case 'ADD_CARD_ASSIGNEE': {
      if(state.board.members.find( (member) => action.assignee === member.username)) {
        const columnIndex = findColumnIndex(action.columnId);
        const cardIndex = findCardIndex(state.columns[columnIndex], action.cardId);
        return update(state, {
          columns: {[columnIndex]: {
            cards: {[cardIndex]: {
              assignees: { $push: [{
                username: action.assignee
              }]}
            }}
          }}
        });
      } else {
        console.warn("No member with name " + action.assignee);
        return state;
      }
    }
    case 'DELETE_ASSIGNEE': {
      const columnIndex = findColumnIndex(action.columnId);
      const cardIndex = findCardIndex(state.columns[columnIndex], action.cardId);
      const card = findCard(state.columns[columnIndex], action.cardId);
      const assigneeIndex = findAssigneeIndex(card, action.assignee);
      return update(state, {
        columns: {[columnIndex]: {
          cards: {[cardIndex]: {
            assignees: { $splice: [[assigneeIndex, 1]]}
          }}
        }}
      });
    }
    case 'SET_COLUMN_SHOW_NEW_CARD_INPUT': {
      const columnIndex = findColumnIndex(action.columnId);
      return update(state, {
        columns: {[columnIndex]: {
          showNewCardInput: {$set: action.show}
        }}
      });
    }

    case 'TOGGLE_COLUMN_COLLAPSED': {
      const columnIndex = findColumnIndex(action.columnId);
      return update(state, {
        columns: {[columnIndex]: {
          collapsed: {$set: !state.columns[columnIndex].collapsed}
        }}
      });
    }
    case 'NEW_CARD': {
      const columnIndex = findColumnIndex(action.columnId);
      let newState = update(state, {
        settings: {
          currentCardNumber: {$set: state.settings.currentCardNumber+1}
        }
      });
      newState = update(newState, {
        columns: {[columnIndex]: {
          showNewCardInput: {$set: false}
        }}
      });
      return update(newState, {
        columns: {[columnIndex]: {
          cards: { $push: [{
            id: newState.settings.currentCardNumber,
            title: action.title,
            type:'task',
            editMode: false,
            todos: [],
            bugs: [],
            comments: [],
            assignees:[]
          }]}
        }}
      });
    }
    case 'REORDER_CARD': {
      const columnIndex = findColumnIndex(action.columnId);
      const dragCard = state.columns[columnIndex].cards[action.dragIndex];
      return update(state, {
        columns: {[columnIndex]: {
        cards: { $splice: [
            [action.dragIndex, 1],
            [action.hoverIndex, 0, dragCard]
          ]}
        }}
      });
    }
    case 'MOVE_CARD': {
      const fromColumnIndex = findColumnIndex(action.fromColumnId);
      let dragCard = findCard(state.columns[fromColumnIndex], action.cardId);
      let newState = update(state, {
        columns: {[fromColumnIndex]: {
          cards: { $splice: [[action.cardIndex, 1]]}
        }}
      });
      const toColumnIndex = findColumnIndex(action.toColumnId);
      newState = update(newState, {
        columns: {[toColumnIndex]: {
          cards: { $push: [dragCard]}
        }}
      });
      return newState;
    }
    case 'TOGGLE_LINE_EXPANDED': {
      const lineIndex = findLineIndex(action.lineId);
      return update(state, {
        lines: {[lineIndex]: {
          expanded: {$set: !state.lines[lineIndex].expanded}
        }}
      });
    }
    case 'TOGGLE_LINE_MAXIMISED': {
      const lineIndex = findLineIndex(action.lineId);
      return update(state, {
        lines: {[lineIndex]: {
          maximised: {$set: !state.lines[lineIndex].maximised}
        }}
      });
    }
    case 'DELETE_LINE': {
      const lineIndex = findLineIndex(action.lineId);
      return update(state, {
        lines: { $splice: [[lineIndex, 1]]}
      });
    }
    case 'SHOW_BOARD_PAGE': {
      return update(state, {
        client: {
          page: {
            current: {$set: 'board'},
            cardId: {$set: null}
          }
        }
      });
    }
    case 'SHOW_CARD_PAGE': {
      return update(state, {
        client: {
          page: {
            current: {$set: 'card'},
            cardId: {$set: action.cardId},
            columnId: {$set: action.columnId}
          }
        }
      });
    }
    case 'DELETE_CARD': {
      const columnIndex = findColumnIndex(action.columnId);
      const cardIndex = findCardIndex(state.columns[columnIndex], action.cardId);
      return update(state, {
        columns: {[columnIndex]: {
          cards: { $splice: [[cardIndex, 1]]}
        }}
      });
    }
    case 'NEW_TODO': {
      const columnIndex = findColumnIndex(action.columnId);
      const cardIndex = findCardIndex(state.columns[columnIndex], action.cardId);
      return update(state, {
        columns: {[columnIndex]: {
          cards: {[cardIndex]: {
            todos: { $push: [{
              id: uuid.v1(),
              title: action.title
            }]}
          }}
        }}
      });
    }
    case 'TOGGLE_TODO_DONE': {
      const columnIndex = findColumnIndex(action.columnId);
      const cardIndex = findCardIndex(state.columns[columnIndex], action.cardId);
      const card = findCard(state.columns[columnIndex], action.cardId);
      const todoIndex = findTodoIndex(card, action.todoId);
      return update(state, {
        columns: {[columnIndex]: {
          cards: {[cardIndex]: {
            todos: { [todoIndex]: {
              done: {$set: action.done}
            }}
          }}
        }}
      });
    }
    case 'DELETE_TODO': {
      const columnIndex = findColumnIndex(action.columnId);
      const cardIndex = findCardIndex(state.columns[columnIndex], action.cardId);
      const card = findCard(state.columns[columnIndex], action.cardId);
      const todoIndex = findBugIndex(card, action.todoId);
      return update(state, {
        columns: {[columnIndex]: {
          cards: {[cardIndex]: {
            todos: { $splice: [[todoIndex, 1]]}
          }}
        }}
      });
    }
    case 'NEW_BUG': {
      const columnIndex = findColumnIndex(action.columnId);
      const cardIndex = findCardIndex(state.columns[columnIndex], action.cardId);
      return update(state, {
        columns: {[columnIndex]: {
          cards: {[cardIndex]: {
            bugs: { $push: [{
              id: uuid.v1(),
              title: action.title
            }]}
          }}
        }}
      });
    }
    case 'TOGGLE_BUG_DONE': {
      const columnIndex = findColumnIndex(action.columnId);
      const cardIndex = findCardIndex(state.columns[columnIndex], action.cardId);
      const card = findCard(state.columns[columnIndex], action.cardId);
      const bugIndex = findBugIndex(card, action.bugId);
      return update(state, {
        columns: {[columnIndex]: {
          cards: {[cardIndex]: {
            bugs: { [bugIndex]: {
              done: {$set: action.done}
            }}
          }}
        }}
      });
    }
    case 'DELETE_BUG': {
      const columnIndex = findColumnIndex(action.columnId);
      const cardIndex = findCardIndex(state.columns[columnIndex], action.cardId);
      const card = findCard(state.columns[columnIndex], action.cardId);
      const bugIndex = findBugIndex(card, action.bugId);
      return update(state, {
        columns: {[columnIndex]: {
          cards: {[cardIndex]: {
            bugs: { $splice: [[bugIndex, 1]]}
          }}
        }}
      });
    }
    case 'NEW_COMMENT': {
      const columnIndex = findColumnIndex(action.columnId);
      const cardIndex = findCardIndex(state.columns[columnIndex], action.cardId);
      return update(state, {
        columns: {[columnIndex]: {
          cards: {[cardIndex]: {
            comments: { $push: [{
              id: uuid.v1(),
              username: state.client.currentUsername,
              text: action.text,
              createdAt: new Date(),
            }]}
          }}
        }}
      });
    }
    case 'TOGGLE_LINE_SUMMARY_BADGES': {
      return update(state, {
        settings: {
          showLineSummaryBadges: {$set: !state.settings.showLineSummaryBadges}
        }
      });
    }
    case 'SHOW_MEMBERS_PAGE': {
      return update(state, {
        client: {
          page: {
            current: {$set: 'members'},
          }
        }
      });
    }
    case 'SET_MEMBER_IMAGE_URL': {
      const memberIndex = findMemberIndex(action.username);
      return update(state, {
        board: {
          members: {[memberIndex]: {
            imageUrl: {$set: action.imageUrl}
          }}
        }
      });
    }
    case 'NEW_MEMBER': {
      return update(state, {
        board: {
          members: { $push: [{
            username: action.username,
            imageUrl: '/images/placeholder.png'
          }]}
        }
      });
    }
    case 'DELETE_MEMBER': {
      const memberIndex = findMemberIndex(action.username);
      return update(state, {
        board: {
          members: { $splice: [[memberIndex, 1]]}
        }
      });
    }
    case 'EXPAND_ALL_LINES': {
      let newState = state;
      state.lines.forEach( (line, lineIndex) => {
        newState = update(newState, {
          lines: {[lineIndex]: {
            expanded: {$set: true}
          }}
        });
      });
      return newState;
    }
    case 'COLLAPSE_ALL_LINES': {
      let newState = state;
      state.lines.forEach( (line, lineIndex) => {
        newState = update(newState, {
          lines: {[lineIndex]: {
            expanded: {$set: false}
          }}
        });
      });
      return newState;
    }
    case 'SET_CURRENT_USER': {
      return update(state, {
        client: {
          currentUsername: {$set: action.username}
        }
      });
    }
    default: {
      return state;
    }
  }
}

let enhancer;
let store;

export function createReduxStore(boardKey) {
  boardKey = boardKey || 'default';
  boardKey = slug(boardKey);
  enhancer = composeWithDevTools(
    persistState(null, {
      key: 'kaiser/' + boardKey
    })
  );
  const initialState = (boardKey === 'default' ? sampleState : defaultState);
  initialState.board.title = boardKey;

  store = createStore(
    reducer,
    initialState,
    enhancer
  );
  return store;
}

export function getReduxStore() {
  return store;
}

export function getState() {
  return store.getState();
}

export function findLine(lineId) {
  const state = store.getState();
  return state.lines.find( (line) => (line.id === lineId));
}

export function findLineIndex(lineId) {
  const state = store.getState();
  return state.lines.findIndex( (line) => (line.id === lineId));
}

export function findColumn(columnId) {
  const state = store.getState();
  return state.columns.find( (column) => (column.id === columnId));
}

export function findColumnIndex(columnId) {
  const state = store.getState();
  return state.columns.findIndex( (column) => (column.id === columnId));
}

export function findCard(column, cardId) {
  return column.cards.find( (card) => (card.id === cardId));
}

export function findCardIndex(column, cardId) {
  return column.cards.findIndex( (card) => (card.id === cardId));
}

export function findTodo(card, todoId) {
  return card.todos.find( (todo) => (todo.id === todoId));
}

export function findTodoIndex(card, todoId) {
  return card.todos.findIndex( (todo) => (todo.id === todoId));
}

export function findBug(card, bugId) {
  return card.bugs.find( (bug) => (bug.id === bugId));
}

export function findBugIndex(card, bugId) {
  return card.bugs.findIndex( (bug) => (bug.id === bugId));
}

export function findAssignee(card, assigneeId) {
  return card.assignees.find( (assignee) => (assignee.id === assigneeId));
}

export function findAssigneeIndex(card, assigneeId) {
  return card.assignees.findIndex( (assignee) => (assignee.id === assigneeId));
}

export function findMember(username) {
  const state = store.getState();
  return state.board.members.find( (member) => (member.username === username));
}

export function findMemberIndex(username) {
  const state = store.getState();
  return state.board.members.findIndex( (member) => (member.username === username));
}
