const wall = document.getElementById('wall');
const addNoteBtn = document.getElementById('addNoteBtn');

//load past data in localStorage
let notes = JSON.parse(localStorage.getItem('notes') || '[]');

//we use this constants to keep the notes under wall
const NOTE_W = 200;
const NOTE_H = 160; 

//function to save notes in local storage
function saveNotes() {
  localStorage.setItem('notes', JSON.stringify(notes));
}

//does not let notes get dragged outside the wall
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

//Create note container and position
function createNote(noteObj) {
  const note = document.createElement('div');
  note.className = 'note';
  note.style.left = noteObj.x + 'px';
  note.style.top  = noteObj.y + 'px';
  note.style.background = noteObj.color;

  //Header
  const header = document.createElement('div');
  header.className = 'note-header';

  //Drag handle
  const handle = document.createElement('div');
  handle.className = 'drag-handle';
  handle.textContent = '≡';
  header.appendChild(handle);

  //Edit title
  const title = document.createElement('div');
  title.className = 'note-title';
  title.contentEditable = 'true';
  title.textContent = noteObj.title || 'Title';
  header.appendChild(title);

  //Delete button
  const delBtn = document.createElement('button');
  delBtn.className = 'deleteBtn';
  delBtn.type = 'button';
  delBtn.textContent = '❌';
  delBtn.contentEditable = 'false';
  header.appendChild(delBtn);

  //Note main body
  const content = document.createElement('div');
  content.className = 'note-content';
  content.contentEditable = 'true';
  content.innerHTML = noteObj.text || ''; 

  //Delete logic
  delBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    notes = notes.filter(n => n.id !== noteObj.id);
    note.remove();
    saveNotes();
  });

  //Save edits
  title.addEventListener('input', () => {
    noteObj.title = title.textContent.trim();
    saveNotes();
  });

  content.addEventListener('input', () => {
    noteObj.text = content.innerHTML;
    saveNotes();
  });

  //Dragging the note
  handle.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return; // left click only
    const startOffsetX = e.clientX - note.offsetLeft;
    const startOffsetY = e.clientY - note.offsetTop;

  //cal new position
    function onMove(ev) {
      const left = clamp(ev.clientX - startOffsetX, 0, wall.clientWidth  - note.offsetWidth);
      const top  = clamp(ev.clientY - startOffsetY, 0, wall.clientHeight - note.offsetHeight);
      note.style.left = left + 'px';
      note.style.top  = top  + 'px';
    }

  //final potision
    function onUp() {
      noteObj.x = note.offsetLeft;
      noteObj.y = note.offsetTop;
      saveNotes();
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp, { once: true });
  });

  // display content
  note.appendChild(header);
  note.appendChild(content);
  wall.appendChild(note);
}

//creates a new note obj
function addNote() {
  const maxLeft = Math.max(0, wall.clientWidth - NOTE_W);
  const maxTop = Math.max(0, wall.clientHeight - NOTE_H);

  const newNote = {
    title: "Title",
    text: "",
    x: Math.floor(Math.random() * (maxLeft + 1)),
    y: Math.floor(Math.random() * (maxTop + 1)),
    color: `hsl(${Math.floor(Math.random() * 360)}, 80%, 80%)`

  };

  fetch("http://localhost:3000/notes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(newNote)
  })
    .then(res => res.json())
    .then(savedNote => {
      notes.push(savedNote);
      createNote(savedNote);
    })
    .catch(err => console.error(err));
}


//saves it after creating note
addNoteBtn.addEventListener('click', addNote);

fetch("http://localhost:3000/notes")
  .then(res => res.json())
  .then(data => {
    notes = data;
    notes.forEach(createNote);
  })
  .catch(err => console.error(err));
