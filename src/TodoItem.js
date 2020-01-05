import React, { useState, useCallback, useRef, useEffect } from 'react';
import cx from 'classnames';

const ESCAPE_KEY = 27;
const ENTER_KEY = 13;

const TodoItem = ({ todo, editing, onToggle, onDestroy, onSave, onEdit, onCancel }) => {
  const inputRef = useRef();
  const [editText, setEditText] = useState(todo.title);

  const handleSubmit = useCallback(() => {
    const val = editText.trim();
    if (val) {
      onSave(val);
      setEditText(val);
    } else {
      onDestroy();
    }
  }, [editText, onDestroy, onSave]);

  const handleChange = useCallback((e) => {
    if (editing) {
      setEditText(e.target.value);
    }
  }, [editing]);

  const handleKeyDown = useCallback((e) => {
    if (e.which === ESCAPE_KEY) {
      setEditText(todo.title);
      onCancel(e);
    } else if (e.which === ENTER_KEY) {
      handleSubmit(e);
    }
  }, [handleSubmit, onCancel, todo.title]);

  const handleEdit = useCallback(() => {
    onEdit();
    setEditText(todo.title);
  }, [onEdit, todo.title])

  useEffect(() => {
    if (editing === true && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing])

  return (
    <li className={cx({ completed: todo.completed, editing })}>
      <div className="view">
        <input
          className="toggle"
          type="checkbox"
          checked={todo.completed}
          onChange={onToggle}
        />
        <label onDoubleClick={handleEdit}>
          {todo.title}
        </label>
        <button className="destroy" onClick={onDestroy}/>
      </div>
      <input
        ref={inputRef}
        className="edit"
        value={editText}
        onBlur={handleSubmit}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
    </li>
  )
}

export default TodoItem;
