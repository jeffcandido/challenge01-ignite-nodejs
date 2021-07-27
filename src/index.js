const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = findUserbyUsername(username);

  if (!user) {
    return response.status(404).json({ error: "User not found!" });
  }

  request.user = user;

  return next();
}

function findUserbyUsername(username) {
  const user = users.find((user) => user.username === String(username));

  return user;
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userExists = findUserbyUsername(username);

  if (userExists) {
    return response.status(400).json({ error: "User already exists!" });
  }

  const newUser = {
    id: uuidv4(),
    name: name,
    username: username,
    todos: [],
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const userTodos = request.user.todos;

  return response.json(userTodos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { user } = request;

  const newTodo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  const userIndex = users.indexOf(user);

  users[userIndex].todos.push(newTodo);

  response.status(201).json(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;

  const { user } = request;
  
  const todoIndex = user.todos.findIndex((todo) => todo.id == id);

  if (!user.todos[todoIndex]) {
    return response.status(404).json({ error: "Todo not found!" });
  }

  const userIndex = users.indexOf(user);

  if (userIndex < 0) {
    response.status(400).json({ error: "User not found." });
  }

  users[userIndex].todos[todoIndex].title = title;
  users[userIndex].todos[todoIndex].deadline = deadline;

  response.json(users[userIndex].todos[todoIndex]);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const { user } = request;

  const todoIndex = user.todos.findIndex((todo) => todo.id == id);

  if (!user.todos[todoIndex]) {
    return response.status(404).json({ error: "Todo not found!" });
  }

  const userIndex = users.indexOf(user);

  if (userIndex < 0) {
    response.status(400).json({ error: "User not found." });
  }

  users[userIndex].todos[todoIndex].done = true;

  response.json(users[userIndex].todos[todoIndex]);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const { user } = request;

  const todoIndex = user.todos.findIndex((todo) => todo.id == id);

  if (!user.todos[todoIndex]) {
    return response.status(404).json({ error: "Todo not found!" });
  }

  const userIndex = users.indexOf(user);

  if (userIndex < 0) {
    response.status(400).json({ error: "User not found." });
  }

  users[userIndex].todos.splice(todoIndex, 1);

  response.status(204).send();
});

module.exports = app;
