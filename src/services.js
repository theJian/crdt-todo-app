const fetchId = () => fetch('/id').then(res => res.json());
const fetchTodos = () => fetch('/todos').then(res => res.json());

export {
  fetchId,
  fetchTodos,
}
