import React, { useEffect } from "react";
import NotesList from "./NotesList";
import NoteEditor from "./NoteEditor";
import { useNavigate, useParams } from "react-router-dom";

function BodyContent(props) {

  const { activeNoteParam, editParam } = useParams();
  const navigate = useNavigate();
  const [notes, setNotes] = React.useState([]);
  const [title, setTitle] = React.useState("Untitled");
  const [textContent, setTextContent] = React.useState( "");
  const tzoffset = new Date().getTimezoneOffset() * 60000;
  const currDateTime = new Date(Date.now() - tzoffset)
    .toISOString()
    .slice(0, 19);
  const [dateTime, setDateTime] = React.useState(currDateTime);
  const [isEditMode, setIsEditMode] = React.useState(true);
  const [activeNote, setActiveNote] = React.useState(-1);

  useEffect(() => {
    async function getNotes(){
      const res = await fetch(`${props.profile.email}`);
      const data = await res.json();
      setNotes(data.notes);
    }
    getNotes();
  }, [props.profile.email]);
  

  useEffect(() => {
    if (notes.length === 0) {
      setActiveNote(-1);
      navigate("/notes");
    }
  }, [notes, navigate]);

  useEffect(() => {
    navigate(`/notes/${activeNote}${isEditMode ? "/edit" : ""}`);
  }, [activeNote, isEditMode, navigate]);

  useEffect(() => {
    setActiveNote(parseInt(activeNoteParam));
    if (editParam === "edit") {
      setIsEditMode(true);
    } else if (typeof editParam === "undefined") {
      setIsEditMode(false);
    }
    const currNote = notes.find((note) => note.id === parseInt(activeNoteParam));
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

  async function addNote(newNote) {
    setNotes([
      ...notes.slice(0, activeNote),
      newNote,
      ...notes.slice(activeNote + 1),
    ]);
    const res = await fetch ("https://gnrtbjtaymhguvwn34u6cdgela0txedp.lambda-url.ca-central-1.on.aws",
      {
        method:"POST",
        headers:{"token": props.user.access_token, "Content-Type": "application/json"},
        body: JSON.stringify({...newNote, email:props.profile.email})
      }
    )
      console.log(res);
  if (res.ok) {
    const updatedNote = await res.json(); // Get the updated note from the server
    // Find the index of the note with the same ID as the updated note
    const updatedNoteIndex = notes.findIndex(
      (note) => note.id === updatedNote.id
    );
    // Update the state of notes with the updated note
    setNotes([
      ...notes.slice(0, updatedNoteIndex),
      updatedNote,
      ...notes.slice(updatedNoteIndex + 1),
    ]);
  } else {
    console.error(`Error adding note: ${res.status} ${res.statusText}`);
  }
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

  async function onDelete() {
    const answer = window.confirm("Are you sure?");
    if (answer) {
      const noteToDelete = notes[activeNote];
      const res = await fetch (`(put link${noteToDelete.id}`,      
      {
        method:"DELETE",
        headers: {"token": props.user.access_token,"Content-Type": "functions/json"}
      });
      if(res.ok){
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