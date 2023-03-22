import React, { useEffect } from "react";
import NotesList from "./NotesList";
import NoteEditor from "./NoteEditor";
import { useNavigate, useParams } from "react-router-dom";

function BodyContent(props) {
  const { activeNoteParam, editParam } = useParams();
  console.log(localStorage.notes);
  const navigate = useNavigate();

  const [notes, setNotes] = React.useState(
    localStorage.notes ? JSON.parse(localStorage.notes) : []
  );

  const [title, setTitle] = React.useState(
    typeof localStorage.notes !== "undefined" && localStorage.notes !== "[]"
      ? JSON.parse(localStorage.notes).at(parseInt(localStorage.activeNote))
          .title
      : "Untitled"
  );

  const [textContent, setTextContent] = React.useState(
    typeof localStorage.notes !== "undefined" && localStorage.notes !== "[]"
      ? JSON.parse(localStorage.notes).at(parseInt(localStorage.activeNote))
          .textContent
      : ""
  );

  const tzoffset = new Date().getTimezoneOffset() * 60000;
  const currDateTime = new Date(Date.now() - tzoffset)
    .toISOString()
    .slice(0, 19);

  const [dateTime, setDateTime] = React.useState(
    typeof localStorage.notes !== "undefined" && localStorage.notes !== "[]"
      ? JSON.parse(localStorage.notes).at(parseInt(localStorage.activeNote))
          .dateTime
      : currDateTime
  );

  const [isEditMode, setIsEditMode] = React.useState(true);

  const [activeNote, setActiveNote] = React.useState(
    parseInt(localStorage.activeNote) !== -1
      ? parseInt(localStorage.activeNote)
      : -1
  );

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
    if (notes.length === 0) {
      setActiveNote(-1);
    }
  }, [notes]);

  useEffect(() => {
    localStorage.setItem("activeNote", activeNote.toString());
    navigate(`/notes/${activeNote}${isEditMode ? "/edit" : ""}`);
  }, [activeNote, isEditMode, navigate]);

  useEffect(() => {
    setActiveNote(parseInt(activeNoteParam));
    if (editParam === "edit") {
      setIsEditMode(true);
    } else if (typeof editParam === "undefined") {
      setIsEditMode(false);
    }
    const currNote = notes.at(parseInt(activeNoteParam));
    if (notes.length !== 0) {
      setTextContent(currNote.content);
      setTitle(currNote.title);
      setDateTime(currNote.dateTime);
    }
  }, []);

  function onTitleChange(event) {
    const title = event.target.value;
    setTitle(title);
  }

  function onTextChange(event) {
    setTextContent(event);
  }

  function addNote(newNote) {
    setNotes([
      ...notes.slice(0, activeNote),
      newNote,
      ...notes.slice(activeNote + 1),
    ]);
  }

  function newNote() {
    const newCurrDateTime = new Date(Date.now() - tzoffset)
      .toISOString()
      .slice(0, 19);
    setTextContent("");
    setTitle("Untitled");
    setDateTime(newCurrDateTime);
    setNotes((prevNotes) => {
      return [...prevNotes, { title: "Untitled", content: "", dateTime: "" }];
    });
    setActiveNote(notes.length);

    setIsEditMode(true);
  }

  function onEditToggle() {
    setIsEditMode(!isEditMode);
  }

  function onNoteClick(noteID) {
    setActiveNote(noteID);

    const currNote = notes.at(noteID);
    setTextContent(currNote.content);
    setTitle(currNote.title);
    setDateTime(currNote.dateTime);
  }

  function onDelete() {
    const answer = window.confirm("Are you sure?");
    if (answer) {
      setNotes(notes.filter((_, index) => index !== activeNote));
      if (activeNote === 0) {
        setActiveNote(0);
        const currNote = notes.at(1);
        if (notes.length !== 1) {
          setTextContent(currNote.content);
          setTitle(currNote.title);
          setDateTime(currNote.dateTime);
        }
      } else {
        if (notes.length !== 1) {
          setActiveNote(0);
          const currNote = notes.at(0);
          setTextContent(currNote.content);
          setTitle(currNote.title);
          setDateTime(currNote.dateTime);
        }
      }
    }
  }

  return (
    <div className="body-content">
      {props.isVisable && (
        <NotesList
          notesList={notes}
          newNote={newNote}
          activeNote={activeNote}
          setActiveNote={onNoteClick}
        />
      )}
      {activeNote !== -1 ? (
        <NoteEditor
          onAdd={addNote}
          onTitleChange={onTitleChange}
          onContentChange={onTextChange}
          title={title}
          textContent={textContent}
          setDateTime={setDateTime}
          dateTime={dateTime}
          isEditMode={isEditMode}
          onEditToggle={onEditToggle}
          activeNote={activeNote}
          onDelete={onDelete}
        />
      ) : (
        <div className="instr-text">
          <p className="instr-text-p">Select a note, or create a new one.</p>
        </div>
      )}
    </div>
  );
}

export default BodyContent;
