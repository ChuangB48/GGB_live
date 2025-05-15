const express=require("express");
const WebSocket=require("ws").Server;
const port=process.env.PORT||80;
const server=express().listen(port,()=>{
    console.log("listening at "+port+".");
});
const wss=new WebSocket({server});
let user=[];
wss.on("connection",ws=>{
    ws.on("close",()=>{
        const a=user.findIndex(u=>u.ws===ws);
        if (a!==-1){
            wss.clients.forEach(function each(client){
                client.send(JSON.stringify({
                    "type":"out",
                    "name":user[a].name
                }));
            });
            user.splice(a,1);
        }
    });
    ws.on("message",data=>{
        data=JSON.parse(data.toString());
        if(data.type=="start"){
            user.push({
                "name":data.name,
                "x":0,
                "y":0,
                "text":"",
                "ws":ws
            });
            wss.clients.forEach(function each(client){
                client.send(JSON.stringify({
                    "type":"new",
                    "name":data.name
                }));
            });
            for(let a=0;a<user.length;a++){
                ws.send(JSON.stringify({
                    "type":"start",
                    "name":user[a].name,
                    "x":user[a].x,
                    "y":user[a].y,
                    "text":user[a].text
                }));
            }
        }
        else if(data.type=="move"){
            for(let a=0;a<user.length;a++){
                if(data.name==user[a].name){
                    if(data.dir=="w"){
                        user[a].y++;
                    }
                    if(data.dir=="a"){
                        user[a].x--;
                    }
                    if(data.dir=="s"){
                        user[a].y--;
                    }
                    if(data.dir=="d"){
                        user[a].x++;
                    }
                    wss.clients.forEach(function each(client){
                        client.send(JSON.stringify({
                            "type":"move",
                            "name":user[a].name,
                            "x":user[a].x,
                            "y":user[a].y
                        }));
                    });
                    break;
                }
            }
        }
        else if(data.type=="text"){
            for(let a=0;a<user.length;a++){
                if(user[a].name==data.name){
                    user[a].text=data.text;
                    wss.clients.forEach(function each(client){
                        client.send(JSON.stringify({
                            "type":"text",
                            "name":user[a].name,
                            "text":user[a].text
                        }));
                    });
                    break;
                }
            }
        }
        else if(data.type=="res"){
            for(let a=0;a<user.length;a++){
                if(user[a].name==data.name){
                    user[a].x=0;
                    user[a].y=0;
                    wss.clients.forEach(function each(client){
                        client.send(JSON.stringify({
                            "type":"move",
                            "name":user[a].name,
                            "x":0,
                            "y":0
                        }));
                    });
                    break;
                }
            }
        }
        else if(data.type=="in"){
            let z=false;
            for(let a=0;a<user.length;a++){
                if(user[a].name==data.name){
                    z=true;
                    break;
                }
            }
            if(z){
                ws.send(JSON.stringify({
                    "type":"in",
                    "name":data.name,
                    "allow":"n"
                }));
            }
            else{
                ws.send(JSON.stringify({
                    "type":"in",
                    "name":data.name,
                    "allow":"y"
                }));
            }
        }
    });
});