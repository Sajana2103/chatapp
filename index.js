const express = require('express')
const app = express()
const http = require('http')
const path = require('path')
const server = http.createServer(app)
const {Server} = require('socket.io')
const io = new Server(server)

const PORT = 3000
app.use(express.static(__dirname + '/'))

var uList = []

app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname,'index.html'))
})
app.get('/users', (req,res) => {
    res.send(uList)
})

let usersUID 
let primeUser 
let messagesDB

io.on('connection', (socket) => {
    console.log('uList',uList[0])
    usersUID = uList.map(user => {return user.uid})
     console.log(`User ${socket.id} connected. 
     userList : ${uList.map(user => {return user.userName})} uids: ${usersUID}`)
    socket.on('first user', (firstUser) => {
        
            primeUser = uList[0].uid
        
        io.emit('first user', primeUser)
        console.log(`Prime user : ${primeUser}`)
    })
     socket.on('saved messages', (messages,uid,uList) => {
        messagesDB= messages
        console.log(`saved messages : ${messagesDB} : ${uid}`)
        io.emit('saved messages', messagesDB)
    })
    io.emit(uList)
    
    socket.on('user name', (userName,uid) => {
        var user = { uid, userName}
        uList.push(user)
        
        io.emit('user name', userName,uid,uList,messagesDB)
        console.log('userList : ',uList)
    })
    socket.on('chat message', (msg, uid, uName,) => {
        io.emit('chat message', msg, uid, uName,)
        console.log(uid,uName,msg,)
    })
    socket.on('private message', (uid,message,sender) => {
        socket.to(uid).emit('private message',message,sender,socket.id)
        console.log(`message : on ${uid} - ${message} from ${sender} `)
    })
    socket.on("online users", (onlineUser) => {
        io.emit('online users', onlineUser,socket.id)
            console.log(`online users : ${onlineUser}`)
    })
   
    socket.on('disconnect', () => {
        if(uList[0]){
            // var objs = Object.values(uList.map((user) => {return user.uid}))
            var userID = socket.id
            // var names = Object.values(objs).find( function(uid){ return userID === uid})
            for(let i=0;i<uList.length;i++){
                if(uList[i].uid === userID){
                    console.log(`${uList[i].userName} just disconnected...`)
                    uList.splice(i,i+1)
                }
            }           
        }
    })
    socket.on('typing', (uid,userName) => {
        io.emit('typing',uid,userName)
      
    })

})

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})

