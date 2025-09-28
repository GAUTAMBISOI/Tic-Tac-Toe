
const express = require("express");
const http = require("http");
const {Server} = require("socket.io");
const {v4:uuidv4} = require("uuid");

const app = express();
const server = http.createServer(app);
const io = new Server (server,{
    cors:{
        origin:"*",
        methods:["GET","POST"],
    },
});

const rooms={};
io.on("connection",(socket) =>{
    

    socket.on("createRoom", (callback)=>{
        const roomId = uuidv4().slice(0,6);
        rooms[roomId] = [socket.id];
        socket.join(roomId);
        callback(roomId);
    });

    socket.on("joinedRoom",(roomId, callback) =>{
        if(rooms[roomId] && rooms[roomId].length===1){
            rooms[roomId].push(socket.id);
            socket.join(roomId);
            callback({success:true});
        } else{
            callback({success:false});
        }
    });

    socket.on("makeMove",({roomId,index,player}) =>{
        socket.to(roomId).emit("opponentMove", {index,player});
    });


    socket.on("rematch",(roomId) =>{
        io.to(roomId).emit("rematch");
    })
    
    socket.on("disconnect", () => {
        for(const roomId in rooms){
            rooms[roomId] = rooms[roomId].filter((id)=> id!=socket.id);
            if(rooms[roomId].length===0) delete rooms[roomId];
        }
    });
    
});
server.listen(5000 ,()=>console.log("Server is running on port 5000"));
