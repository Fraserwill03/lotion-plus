import { useState, React, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import { v4 as uuidv4 } from "uuid";

import { Outlet, useNavigate, useParams } from "react-router-dom";

import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

import Menu from "./Menu";
import "../components/Layout.css";

function Layout() {
  var { index } = useParams();
  const Navigate = useNavigate();
  const location = useLocation();

  const [notesUrl, setNotesUrl] = useState(false);

  const [menu, setMenu] = useState(true);
  const [notes, setNotes] = useState(
    JSON.parse(localStorage.getItem("notes") || "[]")
  );

  const [currNote, setCurrNote] = useState(
    notes.find((note) => note.index === parseInt(index))
  );

  const [ user, setUser ] = useState([]);
  const [ profile, setProfile ] = useState([]);

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => setUser(codeResponse),
    onError: (error) => console.log('Login failed: ', error),
  })

  useEffect(() => {
    if (user) {
      axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${user.accessToken}`, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          Accept: 'application/json'
        }
      })
      .then ((res) => {
        setProfile(res.data);
      })
      .catch((err) => console.log(err));
      }
    },
    [user]
  );

  const logoutHandler = () => {
    googleLogout();
    setProfile(null);
  };

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes, currNote]);

  useEffect(() => {
    let noteExists = false;

    for (let i = 0; i < notes.length; i++) {
      if (notes[i].index === parseInt(index)) {
        noteExists = true;
      }
    }
    if (noteExists === false) {
      if (notesUrl) {
        Navigate("/notes");
      } else {
        Navigate("/");
      }
    }
    if (location.pathname.includes("notes")) {
      setNotesUrl(true);
    } else {
      setNotesUrl(false);
    }
  }, [index]);

  const menuHandler = () => {
    setMenu(!menu);
  };

  const selectHandler = (id) => {
    const note = notes.find((note) => note.id === id);
    setCurrNote(note);
    if (notesUrl) {
      Navigate(`/notes/${note.index}`);
    } else {
      Navigate(`/${note.index}`);
    }
  };

  const saveHandler = (updatedNote) => {
    let noteIndex;
    for (let i = 0; i < notes.length; i++) {
      if (notes[i].id === updatedNote.id) {
        noteIndex = i;
      }
    }
    setNotes(
      notes.map((note) => {
        if (note.id === updatedNote.id) {
          return updatedNote;
        }
        return note;
      })
    );
    if (notesUrl) {
      Navigate(`/notes/${updatedNote.index}`);
    } else {
      Navigate(`/${updatedNote.index}`);
    }
  };

  const addHandler = () => {
    const newNote = {
      id: uuidv4(),
      title: "Untitled",
      time: new Date(),
      content: "",
      index: notes.length + 1,
    };
    setNotes([...notes, newNote]);
    setCurrNote(newNote);
    if (notesUrl) {
      Navigate(`/notes/${newNote.index}/edit`);
    } else {
      Navigate(`/${newNote.index}/edit`);
    }
  };

  const deleteHandler = (id) => {
    const answer = window.confirm("Are you sure?");
    if (answer) {
      const newNotes = notes.filter((note) => note.id !== id);

      newNotes.forEach((note, index) => {
        note.index = index + 1;
      });

      setNotes(newNotes);
      if (newNotes.length !== 0) {
        if (notesUrl) {
          Navigate(`/notes/1`);
        } else {
          Navigate(`/1`);
        }
        setCurrNote(newNotes[0]);
      } else {
        if (notesUrl) {
          Navigate("/notes");
        } else {
          Navigate("/");
        }
      }
    }
  };

  const editHandler = () => {
    if (notesUrl) {
      Navigate(`/notes/${currNote.index}/edit`);
    } else {
      Navigate(`/${currNote.index}/edit`);
    }
  };

  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  };

  const formatDate = (when) => {
    const formatted = new Date(when).toLocaleString("en-US", options);
    if (formatted === "Invalid Date") {
      return "";
    }
    return formatted;
  };

  return (
    <div className="layout">
      <Navbar menuHandler={menuHandler} profile={profile} logout={logoutHandler}/>
      {profile ? (
      <section className="main-section">
        {menu ? (
          <Menu
            selectHandler={selectHandler}
            notes={notes}
            setNotes={setNotes}
            formatDate={formatDate}
            index={index}
            addHandler={addHandler}
          />
        ) : null}

        <div className="content-wrapper">
          <div id="content">
            <Outlet
              context={[
                notes,
                setNotes,
                formatDate,
                saveHandler,
                deleteHandler,
                currNote,
                setCurrNote,
                index,
                editHandler,
              ]}
            />
          </div>
        </div>
      </section>
      ) : (
        <section className="login-page">
          <div className="login" onClick={() => login()}>Sign in to Lotion with <img 
            src="https://www.transparentpng.com/thumb/google-logo/colorful-google-logo-transparent-clipart-download-u3DWLj.png" 
            alt="Colorful Google Logo transparent clipart download @transparentpng.com"
            width={40} 
            height={40}/>
          </div>
        </section>
      )}
    </div>
  );
}

export default Layout;
