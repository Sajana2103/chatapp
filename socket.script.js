
var socket = io();
var messages = document.getElementById('messages');
var form = document.getElementById('form');
var input = document.getElementById('input');

var uniqueName = document.getElementById('uniqueName')
var userForm = document.getElementById('userForm')
var userName = document.getElementById('userInput')
var onlineUsers = document.getElementById('onlineUsers')

var currentUsers = document.getElementById('currentUsers')
var h4 = document.getElementById('h4')
var replyUser = document.createElement('span')

let firstUser
let isFirstUser = false
let savedMessages = ''
let normalMessages = document.createElement('ul')
normalMessages.id= "messages"
normalMessages.className = "messages"
var isPrivateMessage = false
console.log(messages)

var user = {
    uid : '',
    uName : ''
}

socket.on('saved messages', (messagesDB) => {
  console.log(`message.innerHTML : ${normalMessages.innerHTML}`)
  savedMessages = messagesDB
  console.log('saved messages',messagesDB)
})


userForm.addEventListener('submit', userNameForm)
function userNameForm(e){
  
  e.preventDefault()
  if(userName.value && socket.id !== user.uid){
    user.uid = socket.id
    user.uName = userName.value
    
    socket.emit('user name',user.uName, user.uid) 
  }
      
}


console.log(userForm)

socket.on('user name', (userName,uid,uList,messagesDB) => {
console.log(firstUser)
  if(firstUser === undefined){
    firstUser = uid
    
    socket.emit('first user', firstUser)
  }
  var user = uList.map((user) => {
    return (`<div class="header" ><h4 id="${user.uid}" title=${user.userName}>${user.userName}</h4>
    <p class="typing" id="p${user.uid}"></p></div>`)})
    if(messages.innerHTML===''){
      messages.innerHTML = messagesDB
      console.log('user name ',messagesDB)
    }
  if(userName ){
    currentUsers.innerHTML = user.toString().replace(/,/g,'')
    if(messages.innerHTML===''){
  messages.innerHTML = savedMessages
}
    currentUsers.addEventListener('click', clickUser)
  }
  
}) 
socket.on('first user', primeUser => {
  firstUser = primeUser
  if(firstUser === user.uid){
    isFirstUser = true
  }
  console.log(firstUser)
})
form.addEventListener('submit', function(e) {
  e.preventDefault();
  if (input.value !== "" && socket.id === user.uid  && isPrivateMessage === false) {
    socket.emit('chat message', input.value, user.uid, user.uName);
    input.value = '';
    console.log("public message")
  }
});

socket.on('chat message', function(msg,uid,uName) {
 
  var item = document.createElement('li');
  
  item.id = uid
  item.title = uName
  item.style.width =  '80%'

  console.log(`${firstUser}  ${uid}`)
  
  function normalMessage(){
    var normalMessageLi = document.createElement('li');
    normalMessageLi.id = uid
    normalMessageLi.title = uName
    normalMessageLi.style.width =  '80%'
    normalMessageLi.style.textAlign = "right"
    normalMessageLi.innerHTML = `<h4 class="header messages" id="${uid}" title="${uName}" >${uName}</h4>
    <p class="uName" id="${uid}" title="${uName}" >${msg}</p>`;
    normalMessages.appendChild(normalMessageLi)
    console.log('save Normal message', normalMessageLi)
  }

  if(uid && msg){

    normalMessage()
    console.log(normalMessages)
  }
  
  if(socket.id == uid && msg){
    item.style.backgroundColor = "LightGreen"
    item.style.textAlign = "left"
  }
    item.innerHTML = `<h4 class="header" id="${uid}" title="${uName}" >${uName}</h4>
    <p class="uName" id="${uid}" title="${uName}" >${msg}</p>`;
    
    messages.appendChild(item);
    console.log(normalMessages)
    

    if(socket.id !== uid && msg){
      item.style.textAlign = "right"
      item.innerHTML = `<h4 class="header messages" id="${uid}" title="${uName}" >${uName}</h4>
      <p class="uName" id="${uid}" title="${uName}" >${msg}</p>`;
      messages.appendChild(item);
      
    }
    
    window.scrollTo(0, document.body.scrollHeight);
  if(isFirstUser){
    socket.emit('saved messages',normalMessages.innerHTML,user.uid)
    
  }
  console.log(normalMessages,isFirstUser)  
});

messages.addEventListener('click', clickUser)

var click = 0
function clickUser(e){
e.preventDefault()

  isPrivateMessage = true
  var targetUserUID = e.target.id
  var targetName = e.target.title
  var sendButton = document.getElementById('send-btn')

    click++

    sendButton.innerText = `Reply ${targetName}`
    sendButton.style.backgroundColor = "LightGreen"
    sendButton.style.color = "black"
    
    function removePrivateMessageState(){
      sendButton.innerText = 'Send'
      sendButton.style.backgroundColor = "#333"
      sendButton.style.color = "#fff"
      isPrivateMessage = false
      input.value = '';
      form.removeEventListener("submit",sendPrivateMessage)
      console.log('remove private message launched')
    }
    console.log(click)

    console.log(typeof(input.value),input.value)
    if(click===2){
      console.log(click)
      removePrivateMessageState()
      form.removeEventListener("submit", sendPrivateMessage)
      click = click - 2
    }
  
    form.addEventListener("submit", sendPrivateMessage )
    
      function sendPrivateMessage(e){
        if(input.value !== ""){
          console.log("private message",targetUserUID,input.value,user.uName)
          
          socket.emit('private message', targetUserUID, input.value,user.uName)
    
          removePrivateMessageState()
          console.log('send private message launched')
          click = 0
        }
      }
    }
  
socket.on('private message', (message,sender,uid) => {

  var privateMessage = document.createElement('li');
  privateMessage.id = user.uid
  privateMessage.title = user.uName
  privateMessage.style.width =  '80%'
  privateMessage.style.backgroundColor = "black"
  privateMessage.style.color = "white"
  privateMessage.style.textAlign = "left"

  privateMessage.innerHTML = 
  `<h4 class="header" id="from-${sender}" title="${sender}" >${sender} (private)</h4>
  <p class="uName" id="from-${sender}" title="${user.uName}" >${message}</p>`;
  messages.appendChild(privateMessage);

  console.log(`private message from ${user.uName} : ${message} , ${uid} `)
})

form.addEventListener("keydown", function(e){
  if(user.uName){
    socket.emit('typing', user.uid,user.uName)
}})

var typingTimer = setTimeout(() => {
}, 1000);

socket.on('typing', (uid,userName) => {  
  var userH3Tag = document.getElementById(uid)
  var userPTag = document.getElementById(`p${uid}`)
  
  if(userPTag && userPTag){
    userH3Tag.style.color = "MediumSeaGreen"
   
    userPTag.innerHTML = "typing..."  
  }

  clearTimeout(typingTimer)
  typingTimer = setTimeout(() => {
    userH3Tag.style.color = "indigo"
    userPTag.innerHTML = ""
  }, 1000);
})
