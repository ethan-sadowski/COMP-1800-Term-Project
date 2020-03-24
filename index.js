const express = require("express")
const app = express()
const ejsLayouts = require("express-ejs-layouts")
const reminderController = require("./controllers/reminder_controller");


app.use(express.static(__dirname + "/public"))

app.use(express.urlencoded({ extended: false }))

app.use(ejsLayouts)

app.set("view engine", "ejs")

// Routes start here

app.get("/reminder", reminderController.list)

app.get("/reminder/new", reminderController.new)

app.get("/reminder/:id", reminderController.listOne)

app.get("/reminder/:id/edit", reminderController.edit)

app.post("/reminder/", reminderController.create)

app.post("/reminder/update/:id", reminderController.update) // suggestion for class: look into put and post

app.post("/reminder/delete/:id", reminderController.delete)

app.listen(3000, function(){
  console.log("Server running. Visit: localhost:3000/reminder in your browser 🚀");
})
