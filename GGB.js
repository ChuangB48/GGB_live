const socket=new WebSocket("wss://ggb-brawl.onrender.com");
let n=document.cookie.substring(5,document.cookie.length);
let user=[],x=0,y=0;
const applet=new GGBApplet({
    appName: "graphing",
    id: "myGgbApplet",
    width: 1600,
    height: 900,
    showToolBar: true,
    showAlgebraInput: true,
    showMenuBar: true,
    appletOnLoad(ggbApi){
        socket.onmessage=event=>{
            data=JSON.parse(event.data);
            if(data.type=="new"){
                user.push({
                    "name":data.name,
                    "x":0,
                    "y":0,
                    "text":""
                });
                ggbApi.evalCommand(data.name+'=(0,0)');
            }
            else if(data.type=="start"){
                user.push({
                    "name":data.name,
                    "x":data.x,
                    "y":data.y,
                    "text":data.text
                });
                ggbApi.evalCommand(data.name+'=('+(data.x-user[0].x).toString()+','+(data.y-user[0].y).toString()+')');
                ggbApi.evalCommand('Text("'+data.text+'",'+data.name+',true)');
            }
            else if(data.type=="move"){
                for(let a=0;a<user.length;a++){
                    if(user[a].name==data.name){
                        user[a].x=data.x;
                        user[a].y=data.y;
                        break;
                    }
                }
                for(let a=0;a<user.length;a++){
                    if(user[a].name==n){
                        continue;
                    }
                    ggbApi.evalCommand(user[a].name+'=('+(user[a].x-x).toString()+','+(user[a].y-y).toString()+')');
                }
            }
            else if(data.type=="text"){
                for(let a=0;a<user.length;a++){
                    if(user[a].name==data.name){
                        user[a].text=data.text;
                        ggbApi.evalCommand('Text("'+data.text+'",'+data.name+',true)');
                    }
                }
            }
            else if(data.type=="out"){
                ggbApi.deleteObject(data.name);
                for(let a=0;a<user.length;a++){
                    if(user[a].name==data.name){
                        user.splice(a,1);
                    }
                }
            }
        }
        socket.send(JSON.stringify({
            "type":"start",
            "name":n
        }));
        document.addEventListener("keydown",e=>{
            if(e.code=="Enter"){
                let i=document.getElementById("i");
                if(i.value.trim()!=""){
                    socket.send(JSON.stringify({
                        "type":"text",
                        "name":n,
                        "text":i.value
                    }));
                }
            }
            if(e.code=="KeyW"){
                y++;
                socket.send(JSON.stringify({
                    "type":"move",
                    "name":n,
                    "dir":"w"
                }));
            }
            if(e.code=="KeyA"){
                x--;
                socket.send(JSON.stringify({
                    "type":"move",
                    "name":n,
                    "dir":"a"
                }));
            }
            if(e.code=="KeyS"){
                y--;
                socket.send(JSON.stringify({
                    "type":"move",
                    "name":n,
                    "dir":"s"
                }));
            }
            if(e.code=="KeyD"){
                x++;
                socket.send(JSON.stringify({
                    "type":"move",
                    "name":n,
                    "dir":"d"
                }));
            }
            if(e.code=="Digit0"){
                x=0;
                y=0;
                socket.send(JSON.stringify({
                    "type":"res",
                    "name":n
                }));
            }
        });
    }
}, true);
window.addEventListener("load",()=>{
    applet.inject("ggb-container");
});