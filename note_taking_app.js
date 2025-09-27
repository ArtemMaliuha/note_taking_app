let notesArray = localStorage.getItem("myNotes") ? JSON.parse(localStorage.getItem("myNotes")) : []
const notes = document.getElementById("notes")
let tagsArray = localStorage.getItem("myTags") ? JSON.parse(localStorage.getItem("myTags")) : []

document.addEventListener("DOMContentLoaded", renderNotes)
document.addEventListener("DOMContentLoaded", renderTagsToSidebar)



function expandInput() {
    const mainContent = document.getElementById("inputFields")
    const titleInput = document.getElementById("title-input")
    if(!mainContent.querySelector("#noteInput")){
        const input = document.createElement("input")
        input.placeholder = "Write your note here"
        input.id = "noteInput"
        document.getElementById("inputFields").appendChild(input)
        titleInput.classList.add("expanded")
        const buttons = document.createElement("div")
        buttons.className = "buttons"
        buttons.id="buttons"
        document.getElementById("inputFields").appendChild(buttons)
        const saveBtn = document.createElement("button")
        saveBtn.textContent = "Save"
        saveBtn.className = "button"
        saveBtn.id = "saveBtn"
        saveBtn.onclick = save
        const closeBtn = document.createElement("button")
        closeBtn.textContent="Close"
        closeBtn.className = "button"
        closeBtn.id = "closeBtn"
        closeBtn.onclick = close
        document.getElementById("buttons").appendChild(saveBtn)
        document.getElementById("buttons").appendChild(closeBtn)
    }
} // Expand input (Розширення інпута)

function save() {
    const title = document.getElementById("title-input").value
    const note = document.getElementById("noteInput").value
    if (title.trim() === "" || note.trim() === "") return;
    const fullNote = {
        title,
        note,
        id : Date.now(),
        isArchived: false,
        isDeleted: false,
        tags: [],
        backgroundColor: "white",
        textColor: "black"
    }
    notesArray.push(fullNote)
    localStorage.setItem("myNotes", JSON.stringify(notesArray))
    renderNotes()
    document.getElementById("title-input").value = ''
    return notesArray
} // Save notes (Збереження нотаток)

function close() {
    document.getElementById("title-input").classList.remove("expanded")
    document.getElementById("noteInput").remove()
    document.getElementById("buttons").remove()
} // Close expanded input area (Закрити розширене поле вводу)

function renderNotes() {
    const inputBar = `<input type="text"  id="title-input" class="title-input" placeholder="Enter note title" onclick="expandInput()">` 
    document.getElementById("inputFields").innerHTML = inputBar
    let rendered = 0
    let notesHtml = ``
    notesArray.forEach(note => {
        if (note.isArchived === false && note.isDeleted === false) {
            rendered += 1
            const safeTitle = escapeHTML(note.title)
            const safeNote = escapeHTML(note.note)
            notesHtml += `
            <article onmouseenter="renderOptions(${note.id})" onmouseleave="discard(${note.id})" id="note-${note.id}" style="background-color: ${note.backgroundColor}; color: ${note.textColor};">
                <h2>${safeTitle}</h2>
                <p>${safeNote}</p>
                <div class="note-tags ${note.tags.length === 0 ? "hidden" : ''}" id="noteTags-${note.id}">${renderNoteTags(note.id)}</div>
                <div class="options" id="options-${note.id}"></div>  
            </article>`
        }
    })
    notes.innerHTML = notesHtml
    if(rendered){
        new Masonry(notes, {
        itemSelector: 'article',
        gutter: 10,
        fitWidth: true
    })}
} // Render notes (Рендер нотаток)

function renderOptions(id) {
    optionsHtml = `
        <label for="create-color-${id}">
            <i class="fa-solid fa-palette" id="paletteBtn-${id}"><span class="tooltip-text">Change note color</span></i>
            <input type="color" id="create-color-${id}" style="display: none" onchange="changeColor(${id})">
        </label>
        <i class="fa-solid fa-box-archive" id="archiveBtn-${id}" onclick="archiveNote(${id})"><span class="tooltip-text">Archive note</span></i>
        <i class="fa-solid fa-trash" id="deleteBtn-${id}" onclick="deleteNote(${id})"><span class="tooltip-text">Delete note</span></i>
        <div class="note-menu-wrapper">
            <i class="fa-solid fa-ellipsis-vertical" id="optionsMenu-${id}" onclick="renderNoteFunctions(${id})"><span class="tooltip-text">More options</span></i>
            <div class="note-functions" id="noteFunctions-${id}">
                <button onclick=addTagToNoteMenu(${id})>Add tag to this note</button>
                <button onclick=deleteNote(${id})>Delete</button>
                <label for="createTextColor-${id}">
                    <span>Change text color</span>
                    <input type="color" id="createTextColor-${id}" style="display: none" onchange="changeTextColor(${id})">
                </label>
                <button onclick=deleteForeverMenu(${id})>Delete forever</button>
            </div>
            <div class="choose-tag-menu" id="chooseTagMenu-${id}">
                <h3>Choose tag to add</h3>
                <div class="tag-search">
                    <input type="text" placeholder="Type tag name" id="findTag-${id}">
                    <i class="fa-solid fa-magnifying-glass"></i>
                </div>
                <div class="choose-tag" id="chooseTag-${id}"></div>
            </div>
        </div>
        `
    document.getElementById(`options-${id}`).innerHTML = optionsHtml
} // Render note options (Рендер опцій для нотаток)

function discard(id) {
    document.getElementById(`archiveBtn-${id}`).remove()
    document.getElementById(`deleteBtn-${id}`).remove()
    document.getElementById(`paletteBtn-${id}`).remove()
    document.getElementById(`optionsMenu-${id}`).remove()
} // Hide note options (Закриття опцій для нотаток)

function deleteNote(id) {
    const newNotesArray = []
    notesArray.forEach(item => {
        if(item.id === id){
            item.isDeleted = !item.isDeleted
            newNotesArray.push(item)
        }else{
            newNotesArray.push(item)
        }
    })
    localStorage.setItem("myNotes", JSON.stringify(newNotesArray))

    const activeSection = document.querySelector(".sidebar-el.active").id
    if(activeSection === "myNotes"){
        renderNotes()
    }else {
        renderDeleted()
    }
} // Soft delete/restore note (Видалення/відновлення нотатки)

function archiveNote(id) {
    const newNotesArray = []
    notesArray.forEach(item => {
        if(item.id === id){
            item.isArchived = !item.isArchived
            newNotesArray.push(item)
        }else{
            newNotesArray.push(item)
        }
    })
    localStorage.setItem("myNotes", JSON.stringify(newNotesArray))
    
    const activeSection = document.querySelector(".sidebar-el.active").id
    if(activeSection === "myNotes"){
        renderNotes()
    }else {
        renderArchive()
    }
} // Archive/unarchive note (Архівування/розархівування нотатки)

function showSection(id){
    document.querySelectorAll(".sidebar-el").forEach(item =>{
        item.classList.remove("active")
    })
    document.getElementById(id).classList.add("active")
    if(id === "myNotes"){
        renderNotes() 
    } else if(id === "archive"){
        renderArchive()
    }else if( id === "deleted"){
        renderDeleted()
    }else{
        const tagId = parseInt(id.replace("element-", ""))
        renderFilter(tagId)
    }
} // Show selected section (Відображення потрібного розділу)

function renderArchive() {
    document.getElementById("inputFields").innerHTML = ''
    document.getElementById("notes").innerHTML = ''
    let archivedNotes = []
    let notesHtml = ``
    notesArray.forEach(note => {
        if (note.isArchived === true && note.isDeleted === false) {
            archivedNotes.push(note)
            const safeTitle = escapeHTML(note.title)
            const safeNote = escapeHTML(note.note)
            notesHtml += `
            <article onmouseenter="renderArchivedNoteOptions(${note.id})" onmouseleave="discardArchivedNoteOptions(${note.id})" id="note-${note.id}" style="background-color: ${note.backgroundColor}; color: ${note.textColor};">
                <h2>${safeTitle}</h2>
                <p>${safeNote}</p>
                <div class="options" id="archivedNoteOptions-${note.id}"></div>  
            </article>`
        }
    })
    if(archivedNotes.length === 0){
        notesHtml=`<div class="no-archived-notes">
            <i class="fa-solid fa-box-archive"></i>
            <p>There are no archived notes</p>
        </div>`
        notes.innerHTML = notesHtml
    }else{
        notes.innerHTML = notesHtml
    new Masonry(notes, {
        itemSelector: 'article',
        gutter: 10,
        fitWidth: true
    })}
} // Render archive (Рендер архіву)

function renderDeleted() {
    document.getElementById("inputFields").innerHTML = ''
    document.getElementById("notes").innerHTML = ''
    let deletedNotes = []
    let notesHtml = ``
    notesArray.forEach(note => {
        if (note.isArchived === false && note.isDeleted === true) {
            const safeTitle = escapeHTML(note.title)
            const safeNote = escapeHTML(note.note)
            deletedNotes.push(note)
            notesHtml += `
            <article onmouseenter="renderDeletedNoteOptions(${note.id})" onmouseleave="discardDeletedNoteOptions(${note.id})" id="note-${note.id}" style="background-color: ${note.backgroundColor}; color: ${note.textColor};">
                <h2>${safeTitle}</h2>
                <p>${safeNote}</p>
                <div class="options" id="deletedNoteOptions-${note.id}"></div>  
            </article>`
        }
    })
    if(deletedNotes.length === 0){
        notesHtml=`<div class="no-archived-notes">
            <i class="fa-solid fa-trash"></i>
            <p>There are no deleted notes</p>
        </div>`
        notes.innerHTML = notesHtml
    }else{
        notes.innerHTML = notesHtml
        new Masonry(notes, {
            itemSelector: 'article',
            gutter: 10,
            fitWidth: true
        })}
}// Render deleted list (Рендер видалених)

function escapeHTML(str) {
    const div = document.createElement("div")
    div.appendChild(document.createTextNode(str))
    return div.innerHTML
}// Prevent HTML injection from inputs (Уникнення можливості додавати HTML через input)

function changeColor(id) {
    document.getElementById(`note-${id}`).style.backgroundColor = document.getElementById(`create-color-${id}`).value
    const thisNote = notesArray.find(n => n.id === id)
    thisNote.backgroundColor = document.getElementById(`create-color-${id}`).value
    localStorage.setItem("myNotes", JSON.stringify(notesArray))
} // Change note background color (Зміна кольору нотатки)

function changeTextColor(id){
    document.getElementById(`note-${id}`).style.color = document.getElementById(`createTextColor-${id}`).value
    const thisNote = notesArray.find(n => n.id === id)
    thisNote.textColor = document.getElementById(`create-color-${id}`).value
    localStorage.setItem("myNotes", JSON.stringify(notesArray))
} // Change note text color (Зміна кольору тексту нотатки)

function manageTags() {
    const div = document.getElementById("manageTagsDiv")
    const overlay = document.getElementById("overlay")
    const isHidden = getComputedStyle(div).display === "none"
    if(isHidden){
        div.innerHTML = `
        <p>Manage Tags</p>
        <div class="tags-input">
            <input type="text" id="tagInput">
            <button onclick= saveTags()><i class="fa-solid fa-check"><span class="tooltip-text">Save</span></i></button>
        </div>
        <ul id="tagsList">
        </ul>  
        <hr>
        <button class="closeTagBtn" onclick="closeTags()">Close</button>
        `
        overlay.style.display = "block"
        div.style.display = "block"
    }else {
        div.style.display = "none"
        overlay.style.display = "none"
    }
    createTagsList()
}// Tags management modal (Меню керування тегами)

function createTagsList() {
    document.getElementById("tagsList").innerHTML = ''
    tagsArray.forEach(tag => {
        const createTag = document.createElement("li")

        const tagDiv = document.createElement("div")
        tagDiv.className = "tag-div"
        tagDiv.id = `tagDiv-${tag.id}`

        const deleteBtn = document.createElement("button")
        deleteBtn.className = "fa-solid fa-tag"
        deleteBtn.id = `deleteTagBtn-${tag.id}`
        deleteBtn.onclick = () => deleteTag(tag.id)

        const tagName = document.createElement("p")
        tagName.textContent = tag.title
        tagName.id = `tagName-${tag.id}`

        const redactBtn = document.createElement("button")
        redactBtn.className = "fa-solid fa-pencil"
        redactBtn.id = `redactTagBtn-${tag.id}`
        redactBtn.onclick = () => redactTag(tag.id)

        tagDiv.appendChild(deleteBtn)
        tagDiv.appendChild(tagName)
        tagDiv.appendChild(redactBtn)
        createTag.appendChild(tagDiv)
        document.getElementById("tagsList").appendChild(createTag)
        document.getElementById(`tagDiv-${tag.id}`).addEventListener('mouseover', () => changeTagIcon(tag.id))
        document.getElementById(`tagDiv-${tag.id}`).addEventListener('mouseleave', () => returnTagIcon(tag.id))
    })
} // Render tags list in modal (Відображення списку тегів)

function saveTags() {
    const tag = {
        title: document.getElementById("tagInput").value,
        id: Date.now()}
    tagsArray.push(tag)
    localStorage.setItem("myTags", JSON.stringify(tagsArray))
    document.getElementById("tagInput").value = ''
    createTagsList()
}// Save a new tag (Збереження тегу)

function changeTagIcon(id) {
    document.getElementById(`deleteTagBtn-${id}`).classList.remove('fa-tag')
    document.getElementById(`deleteTagBtn-${id}`).classList.add('fa-trash')
}// Swap icon to trash on hover (Зміна іконки біля тегу)

function returnTagIcon(id){
    document.getElementById(`deleteTagBtn-${id}`).classList.remove('fa-trash')
    document.getElementById(`deleteTagBtn-${id}`).classList.add('fa-tag')
}// Restore tag icon on mouse leave (Повернення іконки біля тегу)

function closeTags() {
    manageTags()
}// Close tags modal (Закрити меню тегів)

function deleteTag(id){
    document.getElementById("tagsList").innerHTML = ''
    const newTagsArray = []
    tagsArray.forEach(tag =>{
        if(tag.id !== id){
            newTagsArray.push(tag)
        }
    })
    localStorage.setItem("myTags", JSON.stringify(newTagsArray))
    tagsArray = newTagsArray
    createTagsList()
}// Delete tag (Видалення тегу)

function redactTag(id) {
    tagsArray.forEach(tag => {
        if(tag.id === id){
            document.getElementById(`tagName-${id}`).outerHTML = `<input type="text" value=${tag.title} id="tagNameInput-${id}">`
            document.getElementById(`redactTagBtn-${id}`).classList.remove("fa-pencil")
            document.getElementById(`redactTagBtn-${id}`).classList.add("fa-check")
            document.getElementById(`redactTagBtn-${id}`).onclick = saveRedactedTag
            function saveRedactedTag() {
                const newTagName = document.getElementById(`tagNameInput-${id}`).value
                tag.title = newTagName
                localStorage.setItem("myTags", JSON.stringify(tagsArray))
                document.getElementById(`redactTagBtn-${id}`).classList.remove("fa-check")
                document.getElementById(`redactTagBtn-${id}`).classList.add("fa-pencil")
                document.getElementById(`tagNameInput-${id}`).outerHTML = `<p id="tagName-${id}">${tag.title}</p>`
            }
        }
    })
}// Edit tag title inline (Можливість редагування тегу)

function renderTagsToSidebar() {
    tagsArray.forEach(tag => {
        let icon = document.createElement("i")
        icon.className = "fa-solid fa-filter"
        let element = document.createElement("li")
        element.className = "sidebar-el"
        element.id = `element-${tag.id}`
        element.onclick = () => showSection(`element-${tag.id}`)
        element.appendChild(icon)
        element.append(`${tag.title}`)
        document.getElementById("sidebarList").appendChild(element)
    })
}// Render tags in sidebar (Рендер тегів на панелі зліва)

function renderNoteFunctions(id){
    const div = document.getElementById(`noteFunctions-${id}`)
    const isHidden = getComputedStyle(div).display === "none"
    if(isHidden){
        div.style.display = "block"
    }else {
        div.style.display = "none"
    }
}// Toggle note actions popup (Виведення функцій у меню з трьох крапок)

function renderNoteTags(noteId) {
    let noteTagsHtml = ``
    const thisNote = notesArray.find(n => n.id === noteId)
    thisNote.tags.forEach(tag => {
        noteTagsHtml +=`<p>${tag}</p>` 
    })
    return noteTagsHtml
}// Render tags on a note card (Рендер тегів нотатки)

function renderFilter(id) {
    document.getElementById("notes").innerHTML = ``
    const thisFilter = tagsArray.find(t => t.id === id)
    const filteredNotes = notesArray.filter(note => {
        return note.tags.includes(thisFilter.title)
    })
    let filterHtml = ``
    if(filteredNotes.length > 0){
    filteredNotes.forEach(note => {
        filterHtml += `<article onmouseenter="renderOptions(${note.id})" onmouseleave="discard(${note.id})" id="note-${note.id}" style="background-color: ${note.backgroundColor}; color: ${note.textColor};">
                <h2>${note.title}</h2>
                <p>${note.note}</p>
                <div class="note-tags ${note.tags.length === 0 ? "hidden" : ''}" id="noteTags-${note.id}">${renderNoteTags(note.id)}</div>
                <div class="options" id="options-${note.id}"></div>  
            </article>`
    })
    }else{
        filterHtml = `<div class="no-notes-with-filter">
            <i class="fa-regular fa-face-sad-tear"></i>
            <p>There are no notes with this tag.</p>
        </div>
        `
    }
    document.getElementById("notes").innerHTML = filterHtml
}// Apply tag filter and render (Застосування тегу як фільтра та виведення нотаток)

function addTagToNoteMenu(id){
    renderNoteFunctions(id)
    const div = document.getElementById(`chooseTagMenu-${id}`)
    const isHidden = getComputedStyle(div).display === "none"
    if(isHidden){
        div.style.display = "block"
    }else {
        div.style.display = "none"
    }
    let tagsMenuHtml = ``
    tagsArray.forEach(tag => {
        tagsMenuHtml += `
        <div class="available-tag">
            <input type="checkbox" value="${tag.title}" id="markTag-${tag.id}-${id}" onchange="addTagToNote(${id}, event, ${tag.id})" ${notesArray.find(note => note.id === id)?.tags.includes(tag.title) ? 'checked' : ''}>
            <p>${tag.title}</p>
        </div>`
    })
    document.getElementById(`chooseTag-${id}`).innerHTML = tagsMenuHtml
}// Open tag chooser for a note (Меню додавання тегів до нотатки)

function addTagToNote(noteId, event, tagId){
    const isChecked = event.target.checked
    const note = notesArray.find(note => note.id === noteId)
    const tag = tagsArray.find(tag => tag.id === tagId)

    if (!note || !tag) return
    if(isChecked){
        if(!note.tags.includes(tag.title)){
            note.tags.push(tag.title)
        }
    }else {
        note.tags = note.tags.filter(t => t != tag.title)
    }
    localStorage.setItem("myNotes", JSON.stringify(notesArray))
    updateNoteTags(noteId)
}// Add/remove tag on note (Функція додавання/видалення тегу)

function updateNoteTags(noteId){
    const thisNote = notesArray.find(n => n.id === noteId)
    let newTagsHtml = ``
    thisNote.tags.forEach(tag => {
        newTagsHtml += `<p>${tag}</p>`
    })
    document.getElementById(`noteTags-${noteId}`).innerHTML = newTagsHtml
}// Refresh tag chips on the card (Оновлення тегів нотатки)

function deleteForeverMenu(noteId){
    const div = document.getElementById("deleteForeverMenu")
    const overlay = document.getElementById("overlay2")
    const isHidden = getComputedStyle(div).display === "none"
    if(isHidden){
        div.innerHTML = `
        <p>Delete note forever?</p>
        <div class="delete-forever-btn">
            <button onclick="deleteForeverMenu()">Cancel</button>
            <button id="deleteNoteForeverBtn" onclick="deleteNoteForever(${noteId})">Delete</button>
        </div>
        `
        overlay.style.display = "block"
        div.style.display = "block"
    }else {
        div.style.display = "none"
        overlay.style.display = "none"
    }
} // Confirm permanent deletion modal (Меню видалення нотатки назавжди)

function deleteNoteForever(noteId){
    notesArray = notesArray.filter(n => n.id != noteId)
    localStorage.setItem("myNotes", JSON.stringify(notesArray))
    renderNotes()
    deleteForeverMenu()
    return notesArray = notesArray
}// Permanently delete a note (Функція видалення нотатки назавжди)

function renderDeletedNoteOptions(id){
    optionsHtml = `
        <i class="fa-solid fa-trash-can-arrow-up" id="restoreBtn-${id}" onclick="deleteNote(${id})">Restore note</i>
        <i class="fa-solid fa-trash" id="deleteForeverBtn-${id}" onclick="deleteForeverMenu(${id})">Delete forever</i>
        `
    document.getElementById(`deletedNoteOptions-${id}`).innerHTML = optionsHtml
}// Render options for deleted notes (Виведення функцій для видалених нотаток)

function discardDeletedNoteOptions(id){
    document.getElementById(`restoreBtn-${id}`).remove()
    document.getElementById(`deleteForeverBtn-${id}`).remove()
}// Hide options for deleted notes (Приховування функцій для видалених нотаток)

function renderArchivedNoteOptions(id){
    optionsHtml = `
        <label for="create-color-${id}">
            <i class="fa-solid fa-palette" id="paletteBtn-${id}"><span class="tooltip-text">Change note color</span></i>
            <input type="color" id="create-color-${id}" style="display: none" onchange="changeColor(${id})">
        </label>
        <i class="fa-solid fa-arrow-up-from-bracket" id="unarchiveBtn-${id}" onclick="archiveNote(${id})"><span class="tooltip-text">Unarcive note</span></i>
        <i class="fa-solid fa-trash" id="deleteBtn-${id}" onclick="deleteNote(${id})"><span class="tooltip-text">Delete note</span></i>
        <div class="note-menu-wrapper">
            <i class="fa-solid fa-ellipsis-vertical" id="optionsMenu-${id}" onclick="renderNoteFunctions(${id})"><span class="tooltip-text">More options</span></i>
            <div class="note-functions" id="noteFunctions-${id}">
                <button onclick=addTagToNoteMenu(${id})>Add tag to this note</button>
                <button onclick=deleteNote(${id})>Delete</button>
                <label for="createTextColor-${id}">
                    <span>Change text color</span>
                    <input type="color" id="createTextColor-${id}" style="display: none" onchange="changeTextColor(${id})">
                </label>
                <button onclick=deleteForeverMenu(${id})>Delete forever</button>
            </div>
            <div class="choose-tag-menu" id="chooseTagMenu-${id}">
                <h3>Choose tag to add</h3>
                <div class="tag-search">
                    <input type="text" placeholder="Type tag name" id="findTag-${id}">
                    <i class="fa-solid fa-magnifying-glass"></i>
                </div>
                <div class="choose-tag" id="chooseTag-${id}"></div>
            </div>
        </div>
        `
    document.getElementById(`archivedNoteOptions-${id}`).innerHTML = optionsHtml
}// Render options for archived notes (Виведення функцій для заархівованих нотаток)

function discardArchivedNoteOptions(id){
    document.getElementById(`unarchiveBtn-${id}`).remove()
    document.getElementById(`deleteBtn-${id}`).remove()
    document.getElementById(`paletteBtn-${id}`).remove()
    document.getElementById(`optionsMenu-${id}`).remove()
}// Hide options for archived notes (Приховування функцій для заархівованих нотаток)