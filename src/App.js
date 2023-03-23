import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Editor from "./components/Editor";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route
            path="/notes/:index/edit"
            element={
              <div id="content">
                <Editor />
              </div>
            }
          ></Route>
          <Route
            path="/notes/:index"
            element={
              <div id="content">
                <Editor edit={false} />
              </div>
            }
          ></Route>
          <Route
            path="/notes"
            element={
              <div id="content" className="menu-spacer">
                Select a note, or create a new one
              </div>
            }
          ></Route>
          <Route
            path="/:index/edit"
            element={
              <div id="content">
                <Editor />
              </div>
            }
          ></Route>
          <Route
            path="/:index"
            element={
              <div id="content">
                <Editor edit={false} />
              </div>
            }
          ></Route>
          <Route
            path="/"
            element={
              <div id="content" className="menu-spacer">
                Select a note, or create a new one
              </div>
            }
          ></Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
