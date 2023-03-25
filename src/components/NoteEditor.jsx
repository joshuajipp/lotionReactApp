import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import React from "react";
import { v4 as uuidv4 } from "uuid";

function NoteEditor(props) {
  const modules = {
    toolbar: [
      [{ font: [] }],
      [{ size: [] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      ["link", "image", "video"],
    ],
  };

  function onDateChange(event) {
    props.setDateTime(event.target.value);
  }

  async function submitNote(event) {
    if (
      Number.isInteger(props.activeNote) &&
      props.activeNote > -1 &&
      event.target.textContent === "Save"
    ) {
      if (props.notes.at(props.activeNote).uuid) {
        const note = props.notes[props.activeNote];

        await fetch(
          `https://yhngpb6v55hwvycmtrvg4bfom40wsrpm.lambda-url.ca-central-1.on.aws/`,
          {
            method: "DELETE",
            headers: {
              token: props.user.access_token,
              "Content-Type": "application/json",
              email: props.profile.email,
              uuid: note.uuid,
            },
          }
        );
      }
      const noteObj = {
        uuid: uuidv4(),
        title: props.title,
        content: props.textContent,
        dateTime: props.dateTime,
      };

      props.onAdd(noteObj);
    }
    props.onEditToggle();
  }

  return (
    <div className="note-editor">
      <div className="title-header">
        <div className="note-editor-header">
          <div className="note-editor-title">
            <input
              className="note-title"
              contentEditable={props.isEditMode}
              spellCheck="true"
              onChange={props.onTitleChange}
              value={props.title}
              readOnly={!props.isEditMode}
            />
            <input
              className="datetime-selector"
              type="datetime-local"
              onChange={onDateChange}
              value={props.dateTime}
              readOnly={!props.isEditMode}
            />
          </div>
          <div className="save-button button" onClick={submitNote}>
            {props.isEditMode ? "Save" : "Edit"}
          </div>
          <div className="delete-button button" onClick={props.onDelete}>
            Delete
          </div>
        </div>
      </div>
      <div className={`text-editor ${props.isEditMode ? "" : "hidden"}`}>
        <ReactQuill
          theme="snow"
          value={props.textContent}
          onChange={props.onContentChange}
          className="editor-input"
          modules={modules}
          readOnly={!props.isEditMode}
        />
      </div>
    </div>
  );
}

export default NoteEditor;
