import { Server } from "http";
import app from "./app";

function server() {
  const server: Server = app.listen(3000, () => {
    console.log("server is ready port:3000");
  });

  process.on("uncaughtException", (error) => {
    console.log(error);
    if (server) {
      server.close(() => {
        console.info("server close");
      });
    }
    process.exit(1);
  });

  process.on("unhandledRejection", (error) => {
    console.log(error);
    if (server) {
      server.close(() => {
        console.info("server close");
      });
    }
    process.exit(1);
  });
}
server();
