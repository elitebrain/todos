import React, { useState, useEffect } from "react";
import { dbService } from "../fbase";

const todos = dbService.collection("todos");

const timeForm = (number) => {
  return number < 10 ? `0${number}` : number;
};

const Index = () => {
  const [state, setState] = useState({ title: "", content: "" });
  const [toDoList, setToDoList] = useState([]);
  const [addNew, setAddNew] = useState(false);
  const [clock, setClock] = useState("00:00:00");
  const [isVisibleScroll, setIsVisibleScroll] = useState(false);
  const [scroll, setScroll] = useState(0);
  const [activeScrollTop, setActiveScrollTop] = useState(0);
  const [activeScrollHeight, setActiveScrollHeight] = useState(0);
  const _getData = () => {
    todos.onSnapshot((snapshot) => {
      const toDoList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setToDoList(
        toDoList.sort(
          (a, b) =>
            Math.max(b.created_at, b.updated_at || null) -
            Math.max(a.created_at, a.updated_at || null)
        )
      );
    });
  };
  useEffect(() => {
    _getData();
    let timeInterval = setInterval(() => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      setClock(`${timeForm(hours)}:${timeForm(minutes)}:${timeForm(seconds)}`);
    });
    return () => {
      clearInterval(timeInterval);
      timeInterval = null;
    };
  }, []);
  useEffect(() => {
    if (addNew) {
      _handleToDo(toDoList[0].id);
      setAddNew(false);
    }
    if (toDoList.length > 10) {
      setIsVisibleScroll(true);
    } else {
      setIsVisibleScroll(false);
    }
    setActiveScrollHeight(`${Math.ceil((10 / toDoList.length) * 360)}px`);
  }, [toDoList]);
  const _handleNewToDo = (e) => {
    if (e.keyCode === 13) {
      const newToDo = {
        title: e.target.value,
        content: "",
        created_at: new Date(),
        isDone: false,
      };
      todos.add(newToDo);
      e.target.value = "";
      setAddNew(true);
    }
  };
  const _handleToDo = (id) => {
    const filteredList = toDoList.filter((v) => v.id === id);
    setState({
      id: filteredList[0]?.id,
      title: filteredList[0]?.title,
      content: filteredList[0]?.content,
    });
  };
  const _handleChange = (e) => {
    const { name, value } = e.target;
    setState((prevState) => Object.assign({}, prevState, { [name]: value }));
  };
  const _handleSave = () => {
    const { id, title, content } = state;
    dbService.doc(`todos/${id}`).update({
      title,
      content,
      updated_at: new Date(),
    });
  };
  const _handleToggle = (id) => {
    todos
      .doc(id)
      .get()
      .then(function (doc) {
        if (doc.exists) {
          return doc.ref.update({ isDone: !doc.data().isDone });
        } else {
          console.error("not exists!");
        }
      });
    // await dbService.doc(`todos/${id}`).update({
    //   isDone: !state.isDone,
    // });
  };
  const _handleRemove = async (id) => {
    const isOk = window.confirm("정말 삭제 하시겠습니까?");
    if (isOk) {
      await dbService.doc(`todos/${id}`).delete();
    }
  };
  const _handleWheel = (e) => {
    console.log("_handleWheel", e.deltaY, toDoList.length);
    if (e.deltaY > 0) {
      // down
      if (scroll + 10 < toDoList.length) {
        setScroll((prev) => prev + 1);
      }
    } else {
      // up
      if (scroll > 0) {
        setScroll((prev) => prev - 1);
      }
    }
  };
  useEffect(() => {
    setActiveScrollTop(`${parseFloat((scroll * 360) / toDoList.length)}px`);
  }, [scroll]);
  const { title, content } = state;
  return (
    <div className="container">
      <div className="glass">
        <div className="js-container">
          <div className="js-clock">
            <h1 className="js-title">{clock}</h1>
          </div>
          <form className="js-form form">
            <input type="text" placeholder="What is your name?" />
          </form>
          <h4 className="js-greetings greetings"></h4>
          <div className="js-toDoForm">
            <input
              type="text"
              placeholder="Write a to do"
              onKeyUp={_handleNewToDo}
            />
          </div>
          <div className="js-cover">
            <div
              className={`scroll-bg${isVisibleScroll ? " visible" : ""}`}
            ></div>
            <div
              className={`scroll-active${isVisibleScroll ? " visible" : ""}`}
              style={{ top: activeScrollTop, height: activeScrollHeight }}
            ></div>
            <ul
              className="js-toDoList"
              onWheel={_handleWheel}
              style={{ transform: `translate3D(0px, ${scroll * -36}px, 0px)` }}
            >
              {toDoList.map((todo) => (
                <li key={todo.id}>
                  <span
                    onClick={() => _handleToDo(todo.id)}
                    className={`${todo.isDone ? "is_done" : ""}`}
                  >
                    {todo.title}
                  </span>
                  <span
                    style={{
                      width: "24px",
                      height: "27px",
                      marginRight: "12px",
                    }}
                    onClick={() => _handleToggle(todo.id)}
                  >
                    <img
                      src="https://firebasestorage.googleapis.com/v0/b/todos-ffc9f.appspot.com/o/check(white).svg?alt=media&token=f0395b24-4990-4ae9-ba8b-2f969b544a12"
                      alt="check_icon"
                      width="auto"
                      height="100%"
                    />
                  </span>
                  <span
                    style={{
                      width: "24px",
                      height: "27px",
                      marginRight: "12px",
                    }}
                    onClick={() => _handleRemove(todo.id)}
                  >
                    <img
                      src="https://firebasestorage.googleapis.com/v0/b/todos-ffc9f.appspot.com/o/trash(white).svg?alt=media&token=32a4ac02-be05-4212-8782-c630af0583ac"
                      alt="trash_icon"
                      width="auto"
                      height="100%"
                    />
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="js-weather"></div>
        </div>
        <div className="js-memo-list">
          <input
            type="text"
            value={title}
            name="title"
            onChange={_handleChange}
            onBlur={_handleSave}
          />
          <textarea
            value={content}
            name="content"
            onChange={_handleChange}
            onBlur={_handleSave}
          ></textarea>
        </div>
      </div>
      <style jsx>{`
        html {
          background-size: cover;
          background-repeat: no-repeat;
          background-color: #2c3e50;
        }
        body {
          color: white;
          min-height: 100vh;
          margin: 0;
        }
        input {
          border: 1px solid rgba(101, 142, 198, 0.2);
          background-color: transparent;
          font-size: 36px;
          border-radius: 5px;
        }
        input:focus {
          outline: none;
          border: 1px solid rgba(101, 142, 198, 0.6);
        }
        .js-toDoForm > input {
          width: 300px;
          color: #658ec6;
          padding: 6px 12px;
        }
        input::placeholder {
          color: #658ec6;
          opacity: 0.3;
        }
        ul {
          width: 360px;
          margin: 0;
          overflow-y: hidden;
          transition: 0.3s ease;
          padding-left: 40px;
          box-sizing: content-box;
        }
        li {
          display: block;
          font-size: 24px;
          height: 36px;
        }
        li > span {
          position: relative;
          width: 278px;
          display: inline-block;
          text-align: left;
          vertical-align: middle;
          color: #658ec6;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        li > span.is_done {
          text-decoration: line-through;
          text-decoration-color: #658ec6;
          color: rgba(101, 142, 198, 0.2);
        }
        li > span:hover {
          cursor: pointer;
        }
        button {
          color: #e82ee8;
          font-weight: 900;
          text-align: center;
          margin-right: 10px;
          padding: 0;
          border: none;
          background-color: transparent;
          font-size: 20px;
          vertical-align: middle;
        }
        button:hover {
          cursor: pointer;
        }
        .container {
          font-family: "Poppins", sans-serif;
          min-height: 100vh;
          background: linear-gradient(to right top, #65dfc9, #6cdbeb);
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .glass {
          background: #fff;
          height: 780px;
          width: 1020px;
          background: linear-gradient(
            to right bottom,
            rgba(255, 255, 255, 0.7),
            rgba(255, 255, 255, 0.3)
          );
          border-radius: 2rem;
          z-index: 2;
          backdrop-filter: blur(2rem);
          overflow: hidden;
        }
        .js-container {
          position: relative;
          display: inline-block;
          vertical-align: middle;
          width: 420px;
          height: 780px;
          text-align: center;
          animation: fadeIn 0.5s linear;
          user-select: none;
          background: linear-gradient(
            to right bottom,
            rgba(255, 255, 255, 0.7),
            rgba(255, 255, 255, 0.3)
          );
          color: #426696;
        }
        .js-clock {
          width: 400px;
        }
        .js-cover {
          position: relative;
          width: 400px;
          height: 360px;
          overflow: hidden;
        }
        .js-cover .scroll-bg {
          content: "";
          position: absolute;
          width: 10px;
          height: 360px;
          right: 0px;
          top: 0;
          background-color: #658ec6;
          border-radius: 30px;
          opacity: 0;
        }
        .js-cover .scroll-active {
          position: absolute;
          width: 10px;
          right: 0px;
          top: 0;
          background-color: #65dfc9;
          transition: 0.3s ease;
          border-radius: 30px;
          opacity: 0;
        }
        .js-cover .scroll-bg.visible,
        .js-cover .scroll-active.visible {
          opacity: 1;
        }
        .js-greetings {
          font-size: 32px;
          margin: 24px 0;
        }
        .js-toDoForm {
          margin: 16px 0;
        }
        .js-memo-list {
          position: relative;
          display: inline-block;
          vertical-align: middle;
          height: 780px;
          width: 600px;
          padding: 32px;
          text-align: center;
          animation: fadeIn 0.5s linear;
          text-shadow: 2px 2px rgba(0, 0, 0, 0.5);
          user-select: none;
        }
        .js-memo-list > input {
          width: 100%;
          padding: 6px 12px;
          box-sizing: border-box;
          color: #426696;
        }
        .js-memo-list > .setting {
          width: 100%;
          height: 30px;
          color: #fff;
          font-size: 16px;
          text-align: right;
        }
        .js-memo-list > .setting > button {
          margin: 0 6px;
        }
        .js-memo-list > .setting > .font-size {
          vertical-align: middle;
        }
        .js-memo-list > textarea {
          width: 100%;
          height: calc(100% - 86px);
          border: 0;
          border-radius: 1rem;
          color: #658ec6;
          font-size: 24px;
          padding: 2rem;
          margin-top: 20px;
          box-sizing: border-box;
          background: linear-gradient(
            to left top,
            rgba(255, 255, 255, 0.2),
            rgba(255, 255, 255, 0.9)
          );
          resize: none;
        }
        .js-memo-list > button {
          height: 44px;
          line-height: 44px;
          font-weight: 700;
        }
        .js-memo-list > input:focus,
        .js-memo-list > textarea:focus {
          outline: none;
        }
        .js-form > input {
          margin-bottom: 30px;
        }
        .js-title {
          font-size: 80px;
          margin: 36px 0;
          text-shadow: 2px 2px #658ec6;
        }
        .form,
        .greetings {
          display: none;
        }

        .showing {
          display: block;
        }
        .js-weather {
          font-size: 18px;
          margin: 16px 0;
          height: 24px;
        }
        .bgImage {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          animation: fadeIn 0.5s linear;
        }
        .js-test {
          position: absolute;
          width: 100px;
          height: 100px;
          background-color: rgba(0, 0, 0, 0.5);
        }
        .js-test:hover {
          cursor: pointer;
        }
        .toast {
          display: none;
          opacity: 0;
          position: fixed;
          left: 50%;
          bottom: 30px;
          transform: translateX(-50%);
          height: 40px;
          padding: 0 12px;
          line-height: 40px;
          text-align: center;
          border-radius: 10px;
          background-color: red;
          color: #fff;
          transition: 0.5s ease-in-out;
        }
        .modal {
          position: fixed;
          width: 100vw;
          height: 100vh;
          background-color: rgba(0, 0, 0, 0.6);
        }
        @media (max-width: 992px) {
          .js-container,
          .js-memo-list {
            display: block;
            margin: 40px auto;
          }
          .glass {
            height: 1700px;
          }
          .js-container {
            width: 536px;
          }
        }
        @media (max-width: 768px) {
          .js-memo-list,
          .js-container {
            width: 500px;
          }
          .js-memo-list {
            padding: 0;
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Index;
