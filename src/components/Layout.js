import { useState, React, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import { v4 as uuidv4 } from "uuid";

import { Outlet, useNavigate, useParams } from "react-router-dom";

import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

import Menu from "./Menu";
import "../components/Layout.css";

const deleteNotesUrl =
  "https://rgzojs6pyn5ysmtb3tuhne3dhi0yceru.lambda-url.ca-central-1.on.aws/";
const getNotesUrl =
  "https://5kn6uekf3b7anelop6gueekwqa0bepnb.lambda-url.ca-central-1.on.aws/";
const saveNotesUrl =
  "https://va67rjrqtnqyxpj3zsa6nwnvxi0htabj.lambda-url.ca-central-1.on.aws/";

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

  const [user, setUser] = useState();
  const [profile, setProfile] = useState();

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      setUser(foundUser);
    }
  }, []);

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => {
      setUser(codeResponse);
      localStorage.setItem("user", JSON.stringify(codeResponse));
    },
    onError: (error) => console.log("Login failed: ", error),
  });

  useEffect(() => {
    if (user) {
      axios
        .get(
          `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${user.access_token}`,
          {
            headers: {
              Authorization: `Bearer ${user.access_token}`,
              Accept: "application/json",
            },
          }
        )
        .then((res) => {
          setProfile(res.data);
        })
        .catch((err) => console.log(err));
    }
  }, [user]);

  useEffect(() => {
    if (user && profile) {
      axios
        .get(getNotesUrl, {
          headers: {
            access_token: user.access_token,
            email: profile.email,
            },
          params: {
            email: profile.email,
            },
          })
        .then((res) => {
          // setNotes(res.data.notes); // might need to change this to parse data better
          console.log(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [user, profile, notes]);

  const logoutHandler = () => {
    googleLogout();
    setProfile(null);
    setUser(null);
    localStorage.removeItem("user");
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

  const saveHandler = async (updatedNote) => {
    await axios
      .post(
        saveNotesUrl,
        {
          id: updatedNote.id,
          note: updatedNote,  
        },
        {
          headers: {
            access_token: user.access_token,
            email: profile.email,
          },
        }
      )
      .then((res) => {
        console.log(res.data);
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
      })
      .catch((err) => {
        console.log(err);
      });
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

  const deleteHandler = async (id) => {
    const answer = window.confirm("Are you sure?");
    if (answer) {
      await axios
        .delete(deleteNotesUrl, {
          headers: {
            "Access-Control-Allow-Origin": "*", // Required for CORS support to work
            "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS
            access_token: user.access_token,
            email: profile.email,
            note_id: id,
          },
        })
        .then((res) => {
          console.log(res.data);
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
        })
        .catch((err) => {
          console.log("Error in Delete Handler: " + err);
        });
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
      <Navbar
        menuHandler={menuHandler}
        profile={profile}
        logout={logoutHandler}
      />
      {profile && notes ? (
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
          <div className="login" onClick={() => login()}>
            Sign in to Lotion with{" "}
            <img
              src="https://www.transparentpng.com/thumb/google-logo/colorful-google-logo-transparent-clipart-download-u3DWLj.png"
              alt="Colorful Google Logo transparent clipart download @transparentpng.com"
              width={40}
              height={40}
            />
          </div>
        </section>
      )}
    </div>
  );
}

export default Layout;
