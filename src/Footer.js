import React from 'react';
import cx from 'classnames';
import { pluralize } from './utils';
import { FILTER } from './constants';

const ClearButton = ({ onClearCompleted }) => (
  <button className="clear-completed" onClick={onClearCompleted}>
    Clear completed
  </button>
)

const Footer = ({ count, nowShowing, completedCount, onClearCompleted, onChangeFilter }) => (
  <footer className="footer">
    <span className="todo-count">
      <strong>{count}</strong> {pluralize(count, 'item')} left
    </span>
    <ul className="filters">
      <li>
        <button
          onClick={onChangeFilter.bind(null, FILTER.ALL_TODOS)}
          className={cx({selected: nowShowing === FILTER.ALL_TODOS})}>
          All
        </button>
      </li>
      {' '}
      <li>
        <button
          onClick={onChangeFilter.bind(null, FILTER.ACTIVE_TODOS)}
          className={cx({selected: nowShowing === FILTER.ACTIVE_TODOS})}>
          Active
        </button>
      </li>
      {' '}
      <li>
        <button
          href="#"
          onClick={onChangeFilter.bind(null, FILTER.COMPLETED_TODOS)}
          className={cx({selected: nowShowing === FILTER.COMPLETED_TODOS})}>
          Completed
        </button>
      </li>
    </ul>
    {completedCount > 0 ? <ClearButton onClearCompleted={onClearCompleted} /> : null}
  </footer>
)

export default Footer;
