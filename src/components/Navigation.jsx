import React from "react";

function Navigation(props) {
  return (
    <nav className="navbar">
      <div className="menu button" onClick={props.toggleNotes}>
        <div className="menu-line"></div>
        <div className="menu-line"></div>
        <div className="menu-line"></div>
      </div>
      <h1 className={"logo-center header-title"}>Lotion</h1>
      <h2 className={"logo-center header-sub"}>Like Notion, but worse.</h2>
      <small className="profile">{props.profile.email}</small>
      <button onClick={props.logOut}>Log out</button>

    </nav>
  );
}
export default Navigation;
