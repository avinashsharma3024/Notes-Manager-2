const wall = document.getElementById('wall');
const addNoteBtn = document.getElementById('addNoteBtn');

let notes = JSON.parse(localStorage.getItem('notes') || '[]');

const NOTE_W = 200; // Keep in sync with CSS .note width
const NOTE_H = 160; // Base height used for spawn/clamp

function saveNotes() {
  localStorage.setItem('notes', JSON.stringify(notes));
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function createNote(noteObj) {
  const note = document.createElement('div');
  note.className = 'note';
  note.style.left = noteObj.x + 'px';
  note.style.top  = noteObj.y + 'px';
  note.style.background = noteObj.color;

  // ----- Header -----
  const header = document.createElement('div');
  header.className = 'note-header';

  // Drag handle
  const handle = document.createElement('div');
  handle.className = 'drag-handle';
  handle.textContent = '≡';
  header.appendChild(handle);

  // Editable title
  const title = document.createElement('div');
  title.className = 'note-title';
  title.contentEditable = 'true';
  title.textContent = noteObj.title || 'Title';
  header.appendChild(title);

  // Delete button
  const delBtn = document.createElement('button');
  delBtn.className = 'deleteBtn';
  delBtn.type = 'button';
  delBtn.textContent = '❌';
  delBtn.contentEditable = 'false';
  header.appendChild(delBtn);

  // ----- Content (editable, preserves line breaks via innerHTML) -----
  const content = document.createElement('div');
  content.className = 'note-content';
  content.contentEditable = 'true';
  content.innerHTML = noteObj.text || '';  // Load WITH formatting

  // ----- Delete logic -----
  delBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    notes = notes.filter(n => n.id !== noteObj.id);
    note.remove();
    saveNotes();
  });

  // ----- Save edits -----
  title.addEventListener('input', () => {
    noteObj.title = title.textContent.trim();
    saveNotes();
  });

  content.addEventListener('input', () => {
    noteObj.text = content.innerHTML; // Save WITH formatting
    saveNotes();
  });

  // ----- Dragging (handle only) -----
  handle.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return; // left click only
    const startOffsetX = e.clientX - note.offsetLeft;
    const startOffsetY = e.clientY - note.offsetTop;

    function onMove(ev) {
      const left = clamp(ev.clientX - startOffsetX, 0, wall.clientWidth  - note.offsetWidth);
      const top  = clamp(ev.clientY - startOffsetY, 0, wall.clientHeight - note.offsetHeight);
      note.style.left = left + 'px';
      note.style.top  = top  + 'px';
    }

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

  // Assemble
  note.appendChild(header);
  note.appendChild(content);
  wall.appendChild(note);
}

function addNote() {
  const maxLeft = Math.max(0, wall.clientWidth  - NOTE_W);
  const maxTop  = Math.max(0, wall.clientHeight - NOTE_H);

  const newNote = {
    id: Date.now(),
    title: 'Title',
    text: '', // start empty
    x: Math.floor(Math.random() * (maxLeft + 1)),
    y: Math.floor(Math.random() * (maxTop  + 1)),
    color: `hsl(${Math.random() * 360}, 80%, 80%)`
  };

  notes.push(newNote);
  createNote(newNote);
  saveNotes();
}

addNoteBtn.addEventListener('click', addNote);

// Load saved notes
notes.forEach(createNote);
