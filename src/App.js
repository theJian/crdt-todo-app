import React, { useState, useCallback, useMemo } from 'react';
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
  const [todos, setTodos] = useState([]);

  const addTodo = useCallback((title = '') => {
    setTodos(todos => todos.concat({
      id: uuid(),
      completed: false,
      title,
    }));
  }, []);

  const updateNewTodo = useCallback((val = '') => {
    setNewTodo(val)
  }, []);

  const toggleAll = useCallback((checked) => {
    setTodos(todos => todos.map(todo => ({ ...todo, completed: checked })));
  }, []);

  const toggle = useCallback((todoToToggle) => {
    setTodos(todos => todos.map(todo => todo !== todoToToggle ? todo : ({ ...todo, completed: !todo.completed })));
  }, []);

  const destroy = useCallback((todoToDelete) => {
    setTodos(todos => todos.filter(todo => todo !== todoToDelete));
  }, []);

  const edit = useCallback((todo) => {
    setEditing(todo.id);
  }, []);

  const save = useCallback((todoToSave, title) => {
    setTodos(todos => todos.map(todo => todo !== todoToSave ? todo : { ...todo, title }));
    setEditing(null);
  }, []);

  const cancel = useCallback(() => {
    setEditing(null);
  }, []);

  const clearCompleted = useCallback(() => {
    setTodos(todos => todos.filter(todo => !todo.completed));
  }, []);

  return [{ nowShowing, editing, newTodo, todos }, { addTodo, updateNewTodo, toggleAll, toggle, destroy, edit, save, cancel, clearCompleted, setNowShowing }];
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
  }, [newTodo]);

  const handleChange = useCallback((e) => {
    updateNewTodo(e.target.value);
  }, []);

  const handleToggleAll = useCallback((e) => {
    const checked = e.target.checked;
    toggleAll(checked);
  }, []);

  const handleClearCompleted = useCallback(() => {
    clearCompleted();
  }, []);

  const handleChangeFilter = useCallback((filter) => {
    setNowShowing(filter);
  }, []);

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
              onToggle={toggle.bind(null, todo)}
              onDestroy={destroy.bind(null, todo)}
              onEdit={edit.bind(null, todo)}
              editing={editing === todo.id}
              onSave={save.bind(null, todo)}
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
