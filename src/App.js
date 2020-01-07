import React, { useState, useCallback, useMemo } from 'react';
import am from 'automerge';
import TodoItem from './TodoItem';
import Footer from './Footer';
import { uuid } from './utils';
import { FILTER } from './constants';
import './todomvc-app-css.css';
import './App.css';

const ENTER_KEY = 13;

const useTodoModel = () => {
  const [nowShowing, setNowShowing] = useState(FILTER.ALL_TODOS);
  const [editing, setEditing] = useState(null);
  const [newTodo, setNewTodo] = useState('');
  const [todos, setTodos] = useState(am.from({ list: [] }));

  const addTodo = useCallback((title = '') => {
    setTodos(todos => am.change(todos, 'Add Todo', todos =>
      todos.list.push({
        id: uuid(),
        completed: false,
        title,
      })
    ))
  }, []);

  const updateNewTodo = useCallback((val = '') => {
    setNewTodo(val)
  }, []);

  const toggleAll = useCallback((checked) => {
    setTodos(todos => am.change(todos, 'Toggle All', todos =>
      todos.list.forEach(todo => {
        todo.completed = checked;
      })
    ))
  }, []);

  const toggle = useCallback((todoId) => {
    setTodos(todos => am.change(todos, 'Toggle', todos => {
      const idx = todos.list.findIndex(todo => todo.id === todoId);
      if (idx !== -1) {
        todos.list[idx].completed = !todos.list[idx].completed;
      }
    }))
  }, []);

  const destroy = useCallback((todoId) => {
    setTodos(todos => am.change(todos, 'Delete', todos => {
      const idx = todos.list.findIndex(todo => todo.id === todoId);
      if (idx !== -1) {
        delete todos.list[idx]
      }
    }));
  }, []);

  const edit = useCallback((todo) => {
    setEditing(todo.id);
  }, []);

  const save = useCallback((todoId, title) => {
    setTodos(todos => am.change(todos, 'Change Title', todos => {
      const idx = todos.list.findIndex(todo => todo.id === todoId);
      if (idx !== -1) {
        todos.list[idx].title = title;
      }
    }));
    setEditing(null);
  }, []);

  const cancel = useCallback(() => {
    setEditing(null);
  }, []);

  const clearCompleted = useCallback(() => {
    setTodos(todos => am.change(todos, 'Clear Completed', todos => {
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
  }, []);

  return [{ nowShowing, editing, newTodo, todos: todos.list }, { addTodo, updateNewTodo, toggleAll, toggle, destroy, edit, save, cancel, clearCompleted, setNowShowing }];
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
  () => todos.reduce((acc, todo) => todo.completed ? acc : acc + 1, 0),
  [todos]
);

function App() {
  const [
    { nowShowing, editing, newTodo, todos },
    { addTodo, updateNewTodo, toggleAll, toggle, destroy, edit, save, cancel, clearCompleted, setNowShowing },
  ] = useTodoModel();

  const shownTodos = useFilterTodos(todos, nowShowing);
  const activeTodoCount = useActiveTodoCount(todos);
  const completedCount = todos.length - activeTodoCount;

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
  if (todos.length) {
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
