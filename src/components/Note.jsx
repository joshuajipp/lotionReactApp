import React from "react";

function Note(props) {
  function formatDateTime(unformattedDateTime) {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    };
    const formattedDateTime = new Date(unformattedDateTime).toLocaleString(
      "en-US",
      options
    );
    return formattedDateTime;
  }
  return (
    <div
      className={`note-item-flex ${
        props.activeNote === props.id ? "note-active" : ""
      }`}
      onClick={() => props.setActiveNote(props.id)}
    >
      <h4 className="note-item note-item-name">{props.title}</h4>
      <div className="date-text note-item">
        {props.dateTime === "" ? "" : formatDateTime(props.dateTime)}
      </div>
      <div
        className="note-text note-item"
        dangerouslySetInnerHTML={{ __html: props.content }}
      ></div>
    </div>
  );
}

export default Note;
