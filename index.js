import express from "express";
import gradesRoute from "./routes/grades.js";

global.fileName = "./grades/grades.json";

const app = express();
app.use(express.json());


app.use("/grades", gradesRoute);


app.listen(3005, () => {
    console.log("API Started!");
});