let themeSwitchBtn = document.querySelector(".todo-theme-switch");
let body = document.querySelector("body");
themeSwitchBtn.addEventListener("click", () => {
  body.classList.toggle("dark-theme");
});
let createTodo = document.querySelector(".todo-create");
let todosTop = document.querySelector(".todos-top");
let todosBottom = document.querySelector(".todos-bottom");
if (!localStorage.todos) {
  localStorage.setItem("todos", JSON.stringify([]));
}
let todos = (function () {
  let todos = JSON.parse(localStorage.getItem("todos")) || [];
  console.log(todos);
  let todosDiv = document.querySelector(".todos-top");
  let todosNumber = document.querySelector(".todos-number");
  let showAll = (todosArr) => {
    todosDiv.innerHTML = "";
    todosArr.forEach((todo) => {
      let div = document.createElement("div");
      div.classList.add("todo");
      let left = document.createElement("div");
      left.classList.add("todo-left");
      let completeButton = document.createElement("button");
      completeButton.classList.add("todo-complete");
      let content = document.createElement("p");
      content.classList.add("todo-content");
      if (todo.complete) {
        content.classList.add("complete");
        completeButton.classList.add("todo-completed");
      }
      content.innerText = todo.content;
      let deleteButton = document.createElement("button");
      deleteButton.innerText = "X";
      deleteButton.classList.add("todo-delete");
      left.append(completeButton);
      left.append(content);
      div.append(left);
      div.append(deleteButton);
      div.setAttribute("draggable", true);
      div.id = todo.id;
      todosDiv.append(div);
    });
    todosNumber.innerText = `${
      todos.filter((ele) => !ele.complete).length
    } items left`;
  };
  let addTodo = (todo) => {
    todos.push(todo);
    localStorage.setItem("todos", JSON.stringify(todos));
    showAll(todos);
  };
  let deleteTodo = (id) => {
    todos = todos.filter((ele) => {
      return ele.id !== id;
    });
    localStorage.setItem("todos", JSON.stringify(todos));
    showAll(todos);
  };
  let markComplete = (todo) => {
    todos.forEach((ele) => {
      if (ele.content === todo.content) {
        ele.complete = !ele.complete;
      }
    });
    localStorage.setItem("todos", JSON.stringify(todos));
    showAll(todos);
  };
  let filterActive = () => {
    let active = todos.filter((ele) => {
      return !ele.complete;
    });
    showAll(active, "Active");
  };
  let filterComplete = () => {
    let completed = todos.filter((ele) => {
      return ele.complete;
    });
    showAll(completed, "Completed");
  };
  let clearCompleted = () => {
    let active = todos.filter((ele) => {
      return !ele.complete;
    });
    todos = active;
    localStorage.setItem("todos", JSON.stringify(todos));
    showAll(todos);
  };
  let intializeApp = () => {
    showAll(todos);
  };
  return {
    intializeApp,
    addTodo,
    deleteTodo,
    markComplete,
    filterActive,
    filterComplete,
    clearCompleted,
  };
})();

let todoFactory = function (content) {
  let complete = false;
  const uniqueId = () => {
    const dateString = Date.now().toString(36);
    const randomness = Math.random().toString(36).substr(2);
    return dateString + randomness;
  };
  let id = uniqueId();
  return { content, complete, id };
};
let getDragAfterElement = (container, y) => {
  const draggableElements = [
    ...container.querySelectorAll(".todo:not(.dragging)"),
  ];
  return draggableElements.reduce(
    (closeset, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closeset.offset) {
        return { offset: offset, element: child };
      } else {
        return closeset;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
};
todos.intializeApp();
createTodo.addEventListener("keyup", (e) => {
  let content = e.target.value;
  if (e.keyCode === 13 && content !== "") {
    let todo = new todoFactory(content);
    todos.addTodo(todo);
    e.target.value = "";
  }
});
todosTop.addEventListener("dragstart", (e) => {
  if (e.target.classList.contains("todo")) {
    e.target.classList.add("dragging");
  }
});
todosTop.addEventListener("dragend", (e) => {
  if (e.target.classList.contains("todo")) {
    e.target.classList.remove("dragging");
  }
});
todosTop.addEventListener("click", (e) => {
  if (e.target.className === "todo-delete") {
    const todo = e.target.parentNode;
    const id = todo.id;
    todos.deleteTodo(id);
  }
  if (e.target.classList.contains("todo-complete")) {
    let content = e.target.nextSibling.innerText;
    todos.markComplete({ content });
  }
});
todosTop.addEventListener("dragover", (e) => {
  e.preventDefault();
  const draggable = document.querySelector(".dragging");
  const afterElement = getDragAfterElement(todosTop, e.clientY);
  if (afterElement == null) {
    todosTop.appendChild(draggable);
  } else {
    todosTop.insertBefore(draggable, afterElement);
  }
});

todosBottom.addEventListener("click", (e) => {
  const filterAllBtn = document.querySelector(".filter-all");
  const filterActiveBtn = document.querySelector(".filter-active");
  const filterCompleteBtn = document.querySelector(".filter-complete");
  if (e.target.innerText === "All") {
    e.target.classList.add("selected");
    filterActiveBtn.classList.remove("selected");
    filterCompleteBtn.classList.remove("selected");
    return todos.intializeApp();
  }
  if (e.target.innerText === "Active") {
    e.target.classList.add("selected");
    filterAllBtn.classList.remove("selected");
    filterCompleteBtn.classList.remove("selected");
    return todos.filterActive();
  }
  if (e.target.innerText === "Completed") {
    filterActiveBtn.classList.remove("selected");
    filterAllBtn.classList.remove("selected");
    e.target.classList.add("selected");
    return todos.filterComplete();
  }
  if (e.target.innerText === "Clear Completed") {
    return todos.clearCompleted();
  }
});
