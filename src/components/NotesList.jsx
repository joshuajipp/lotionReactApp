import React from "react";
import Note from "./Note";

function NotesList(props) {
  return (
    <div className="notes-container">
      <div className="note-header-flex">
        <h3 className="note-header-item">Notes</h3>
        <div
          className="note-header-item plus-logo button"
          onClick={props.newNote}
        >
          &#43;
        </div>
      </div>
      <div className="scroller">
        {props.activeNote !== -1 ? (
          props.notesList.map((noteItem, index) => {
            return (
              <Note
                key={index}
                id={index}
                title={noteItem.title}
                dateTime={noteItem.dateTime}
                content={noteItem.content}
                setActiveNote={props.setActiveNote}
                activeNote={props.activeNote}
              />
            );
          })
        ) : (
          <p className="no-notes-p">No Notes Yet</p>
        )}
      </div>
    </div>
  );
}

export default NotesList;
