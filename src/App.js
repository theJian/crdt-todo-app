import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import am from 'automerge';
import uuid from 'uuid/v4';
import Conn from './conn';
import TodoItem from './TodoItem';
import Footer from './Footer';
import Panel from './Panel';
import { FILTER } from './constants';
import { fetchId, fetchTodos } from './services';
import './todomvc-app-css.css';
import './App.css';

const ENTER_KEY = 13;

const appDocSet = new am.DocSet();

const useForceUpdate = () => {
  const [, setState] = useState();
  const update = useCallback(() => {
    setState({})
  }, []);
  return update;
}

const useTodoModel = () => {
  const [nowShowing, setNowShowing] = useState(FILTER.ALL_TODOS);
  const [editing, setEditing] = useState(null);
  const [newTodo, setNewTodo] = useState('');
  const [todos, setTodos] = useState(am.from({ list: [] }));
  const idRef = useRef();
  const primaryIdRef = useRef();

  const updateTodos = useCallback((fn) => {
    if (!idRef.current) {
      throw new Error('expect id exists');
    }

    const doc = appDocSet.getDoc('todos') || am.init(idRef.current);
    const nextDoc = fn(doc);
    appDocSet.setDoc('todos', nextDoc);
    setTodos(nextDoc);
  }, []);

  const syncTodos = useCallback(() => {
    const doc = appDocSet.getDoc('todos');
    setTodos(doc);
  }, []);

  // const initTodos = useCallback((list) => {
  //   updateTodos(() => {
  //     return am.from({ list }, idRef.current);
  //   });
  // }, [updateTodos]);

  const addTodo = useCallback((title = '') => {
    updateTodos(todos => am.change(todos, 'Add Todo', todos => {
      if (!todos.list) {
        todos.list = new am.Table(['id', 'completed', 'title']);
      }
      todos.list.add({
        id: uuid(),
        completed: false,
        title,
      })
    }))
  }, [updateTodos]);

  const updateNewTodo = useCallback((val = '') => {
    setNewTodo(val)
  }, []);

  const toggleAll = useCallback((checked) => {
    updateTodos(todos => am.change(todos, 'Toggle All', todos =>
      todos.list.map(todo => {
        todo.completed = checked;
      })
    ))
  }, [updateTodos]);

  const toggle = useCallback((todoId) => {
    updateTodos(todos => am.change(todos, 'Toggle', todos => {
      const todo = todos.list.find(todo => todo.id === todoId);
      if (todo) {
        todo.completed = !todo.completed;
      }
    }))
  }, [updateTodos]);

  const destroy = useCallback((todoId) => {
    updateTodos(todos => am.change(todos, 'Delete', todos => {
      todos.list.filter(todo => todo.id !== todoId)
    }));
  }, [updateTodos]);

  const edit = useCallback((todo) => {
    setEditing(todo.id);
  }, []);

  const save = useCallback((todoId, title) => {
    updateTodos(todos => am.change(todos, 'Change Title', todos => {
      todos.list.map(todo => {
        if (todo.id === todoId) {
          todo.title = title;
        }
      })
    }));
    setEditing(null);
  }, [updateTodos]);

  const cancel = useCallback(() => {
    setEditing(null);
  }, []);

  const clearCompleted = useCallback(() => {
    updateTodos(todos => am.change(todos, 'Clear Completed', todos => {
      let idxlst = []
      todos.list.forEach((todo, idx) => {
        if (todo.completed) {
          idxlst.unshift(idx);
        }
      })

      idxlst.forEach(idx => {
        delete todos.list[idx]
      })
    }))
  }, [updateTodos]);

  return [{ nowShowing, editing, newTodo, todos: todos.list }, { syncTodos, addTodo, updateNewTodo, toggleAll, toggle, destroy, edit, save, cancel, clearCompleted, setNowShowing, idRef, primaryIdRef }];
}

const useFilterTodos = (todos = [], nowShowing = FILTER.ALL_TODOS) => useMemo(
  () => todos.filter(todo => ({
    [FILTER.ACTIVE_TODOS]: !todo.completed,
    [FILTER.COMPLETED_TODOS]: todo.completed,
    [FILTER.ALL_TODOS]: true
  })[nowShowing]),
  [todos, nowShowing]
);

const useActiveTodoCount = (todos = []) => useMemo(
  () => todos.filter(todo => !todo.completed).length,
  [todos]
);

function App() {
  const [
    { nowShowing, editing, newTodo, todos },
    { syncTodos, addTodo, updateNewTodo, toggleAll, toggle, destroy, edit, save, cancel, clearCompleted, setNowShowing, idRef, primaryIdRef },
  ] = useTodoModel();
  const connRef = useRef(null);
  const forceUpdate = useForceUpdate();

  const shownTodos = useFilterTodos(todos, nowShowing);
  const activeTodoCount = useActiveTodoCount(todos);

  const handleNewTodoKeyDown = useCallback((e) => {
    if (e.keyCode !== ENTER_KEY) {
      return;
    }

    e.preventDefault();

    const val = newTodo.trim();

    if (val) {
      updateNewTodo('');
      addTodo(val);
    }
  }, [newTodo, addTodo, updateNewTodo]);

  const handleChange = useCallback((e) => {
    updateNewTodo(e.target.value);
  }, [updateNewTodo]);

  const handleToggleAll = useCallback((e) => {
    const checked = e.target.checked;
    toggleAll(checked);
  }, [toggleAll]);

  const handleClearCompleted = useCallback(() => {
    clearCompleted();
  }, [clearCompleted]);

  const handleChangeFilter = useCallback((filter) => {
    setNowShowing(filter);
  }, [setNowShowing]);

  useEffect(() => {
    Promise.all([fetchId(), fetchTodos()]).then(data => {
      const [{ id, primary }, { todos }] = data;
      idRef.current = id;
      primaryIdRef.current = primary;
      // initTodos(todos);
      connRef.current = new Conn(id, appDocSet);
      if (primary) {
        connRef.current.connect(primary);
      }
      forceUpdate();
    });

    appDocSet.registerHandler((docId, doc) => {
      console.log(JSON.stringify(appDocSet.docs, null, 2))
      syncTodos();
    });
  }, []);

  if (!idRef.current) {
    return 'connecting';
  }

  const completedCount = todos.count - activeTodoCount;

  let footer = null;
  if (activeTodoCount || completedCount) {
    footer = (
      <Footer
        count={activeTodoCount}
        nowShowing={nowShowing}
        completedCount={completedCount}
        onClearCompleted={handleClearCompleted}
        onChangeFilter={handleChangeFilter}
      />
    )
  }

  let main = null;
  if (todos.count) {
    main = (
      <section className="main">
        <input
          id="toggle-all"
          className="toggle-all"
          type="checkbox"
          onChange={handleToggleAll}
          checked={activeTodoCount === 0}
        />
        <label
          htmlFor="toggle-all"
        />
        <ul className="todo-list">
          {shownTodos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={toggle.bind(null, todo.id)}
              onDestroy={destroy.bind(null, todo.id)}
              onEdit={edit.bind(null, todo)}
              editing={editing === todo.id}
              onSave={save.bind(null, todo.id)}
              onCancel={cancel.bind(null, todo)}
            />
          ))}
        </ul>
      </section>
    );
  }

  return (
    <div className="App todoapp">
      <Panel id={idRef.current} primary={primaryIdRef.current == null} />
      <header className="App-header">
        <h1>
          CRDT todos
        </h1>
        <input
          className="new-todo"
          placeholder="What needs to be done?"
          value={newTodo}
          onKeyDown={handleNewTodoKeyDown}
          onChange={handleChange}
          autoFocus
        />
      </header>
      {main}
      {footer}
    </div>
  );
}

export default App;
