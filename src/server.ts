import { Server } from "http";
import app from "./app";


function server() {
    const server:Server = app.listen(3000,()=>{
        console.log('server is ready port:3000');
        
    })
}
server();