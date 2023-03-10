import { useState, useEffect } from "react";
import { AiOutlinePlus } from "react-icons/ai";

import { db } from "./firebase";
import {
  collection,
  onSnapshot,
  query,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

import Todo from "./Todo";

const style = {
  bg: `h-screen w-screen p-4 bg-gradient-to-r from-[#2F80ED] to -[#1CB5E0]`,
  container: `bg-slate-100 max-w-[500px] w-full m-auto rounded-md shadow-xl p-4`,
  heading: `text-3xl font-bold text-center text-gray-800 p-2`,
  form: `flex justify-between`,
  input: `border p-2 w-full text-xl`,
  button: `border p-4 ml-2 bg-purple-500 text-slate-100`,
  count: `text-center p-2`,
};

function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");

  // Create todo in Firestore
  const createTodo = async (e) => {
    e.preventDefault(); // prevents browser reload/refresh
    if (input === "") {
      alert("Please enter a valid todo !");
      return;
    }
    // Add a new document
    await addDoc(collection(db, "todos"), {
      text: input,
      completed: false,
    });
    setInput(""); // clear the input field once we add a new todo
  };

  // Read all todos from Firestore - get multiple documents from a collection
  useEffect(() => {
    const q = query(collection(db, "todos")); // Create a query against the collection.

    // onSnapshot() method for realtime updates
    // https://firebase.google.com/docs/firestore/query-data/listen
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let todosArray = [];
      querySnapshot.forEach((doc) => {
        todosArray.push({ ...doc.data(), id: doc.id });
      });
      setTodos(todosArray);
      return () => unsubscribe();
    });
  }, []);

  // Update todo in Firestore - toggle the Complete checkbox
  const toggleComplete = async (todo) => {
    await updateDoc(doc(db, "todos", todo.id), {
      completed: !todo.completed,
    });
  };

  // Delete todo in Firestore
  const deleteTodo = async (id) => {
    await deleteDoc(doc(db, "todos", id));
  };

  return (
    <div className={style.bg}>
      <div className={style.container}>
        <h3 className={style.heading}>Todo App</h3>
        <form onSubmit={createTodo} className={style.form}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={style.input}
            type="text"
            placeholder="Add Todo"
          />
          <button className={style.button}>
            <AiOutlinePlus size={30} />
          </button>
        </form>
        <ul>
          {todos.map((todo, index) => (
            <Todo
              key={index}
              todo={todo}
              toggleComplete={toggleComplete}
              deleteTodo={deleteTodo}
            />
          ))}
        </ul>
        {todos.length === 0 ? null : (
          <p className={style.count}>{`You have ${todos.length} todos`}</p>
        )}
      </div>
    </div>
  );
}

export default App;
