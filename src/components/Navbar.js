import React from "react";
import "../components/Navbar.css";

function Navbar(props) {
  const {menuHandler, profile, logout} = props;
  return (
    <nav>
      <div className="wrapper" onClick={menuHandler}>
        <div className="burger"> &#9776;</div>
      </div>

      <div className="title">
        <h1>Lotion</h1>
        <p>Like Notion, but worse.</p>
      </div>
      {profile ? (
        <div className="active-user">{profile.email}(<p className="logout" onClick={logout}>Log out</p>)</div>
      ) : (
        <div className="spacer"></div>
      )}
      
    </nav>
  );
}

export default Navbar;
