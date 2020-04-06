let Database = require("../database");

const fetch = require("node-fetch");

let remindersController = {
  list: (req, res) => {
    res.render('reminder/index', { reminders: Database.cindy.reminders })
  },

  new: (req, res) => {
    res.render('reminder/create', {data:{}})
  },

  listOne: (req, res) => {
    let reminderToFind = req.params.id;
    let searchResult = Database.cindy.reminders.find(function(reminder) {
      return reminder.id == reminderToFind; // good test question for students what happens if I put ===
    })
    if (searchResult != undefined) {
      res.render('reminder/single-reminder', { reminderItem: searchResult })
    } else {
      res.render('reminder/index', { reminders: Database.cindy.reminders })
    }
  },

  create: (req, res) => {
    let reminder = {
      id: Database.cindy.reminders.length+1,
      title: req.body.title,
      date: req.body.date,
      description: req.body.description,
      rain: false,
      subtasks: [req.body.subtask1, req.body.subtask2, req.body.subtask3, req.body.subtask4],
      completed: false
    }
    Database.cindy.reminders.push(reminder);
    res.redirect('/reminder');
  },

  edit: (req, res) => {
    let reminderToFind = req.params.id;
    let searchResult = Database.cindy.reminders.find(function(reminder) {
      return reminder.id == reminderToFind; // Why do you think I chose NOT to use === here?
    })
    res.render('reminder/edit', { reminderItem: searchResult })
    
  },

  update: (req, res) => {
    let reminderToFind = req.params.id;
    let searchResult = Database.cindy.reminders.find(function(reminder) {
      if(reminder.id == reminderToFind) {
        reminder.title = req.body.title,
        reminder.description = req.body.description,
        reminder.date = req.body.date,
        reminder.description = req.body.description,
        reminder.rain = false,
        reminder.subtasks = [req.body.subtask1, req.body.subtask2, req.body.subtask3, req.body.subtask4],
        // Why do you think I had to do req.body.completed == "true" below?
        reminder.completed = req.body.completed == "true" 
      }
    });
    res.redirect('/reminder/' + reminderToFind)
  },

  delete: (req, res) => {
    let reminderToFind = req.params.id;
    let reminderIndex = Database.cindy.reminders.findIndex(function(reminder) {
      return reminder.id == reminderToFind; 
    })
    Database.cindy.reminders.splice(reminderIndex, 1);
    res.redirect('/reminder');
  },

  getWeather: async (req, res) => {
    // console.log(req.query);
    // console.log('______________________');
    const fetchResponse = await fetch("https://api.darksky.net/forecast/c1c3b383cf5bce1b78f17dd8f965ae86/" + req.query.latitude + "," + req.query.longtitude + "," + req.query.date);
    const data = await fetchResponse.json();
    console.log(data);
    // res.render("reminder/create", {data});
    if (data.currently.icon == 'rain')
    {res.json({raining: true});}
    else 
    {res.json({raining: false});}   
}
}
module.exports = remindersController
