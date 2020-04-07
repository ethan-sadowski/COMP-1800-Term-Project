let Database = require("../database");
let auth = require("../credentials.json");
const {google} = require('googleapis');
const fs = require('fs');
const TOKEN_PATH = '../token.json';
var {OAuth2Client} = require('google-auth-library');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const readline = require('readline');

function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    console.log('aaa')
    callback(oAuth2Client);
  });
}

function getNewToken(oAuth2Client, callback) {
 const authUrl = oAuth2Client.generateAuthUrl({
   access_type: 'offline',
   scope: SCOPES,
 });
 console.log('Authorize this app by visiting this url:', authUrl);
 const rl = readline.createInterface({
   input: process.stdin,
   output: process.stdout,
 });
 rl.question('Enter the code from that page here: ', (code) => {
   rl.close();
   oAuth2Client.getToken(code, (err, token) => {
     if (err) return console.error('Error while trying to retrieve access token', err);
     oAuth2Client.setCredentials(token);
     fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
       if (err) return console.error(err);
       console.log('Token stored to', TOKEN_PATH);
     });
     callback(oAuth2Client);
   });
 });
}

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
      return reminder.id == reminderToFind;
    })
    if (searchResult != undefined) {
      res.render('reminder/single-reminder', { reminderItem: searchResult })
    } else {
      res.render('reminder/index', { reminders: Database.cindy.reminders })
    }
  },

  //Creates a reminder and adds it to Database.cindy and our google sheet.
  create: (req, res) => {

    //If there are no items in Database.cindy, the first Id = 1, otherwise any new Ids become the length of the
    //array of storage + 1.
    let nextId;
    if (Database.cindy.reminders.length != 0){
      nextId = parseInt(Database.cindy.reminders[Database.cindy.reminders.length - 1].id) + 1
      console.log(typeof(nextId))
    } else {
      nextId = 1;
    }
    let reminder = {
      id: nextId,
      title: req.body.title,
      date: req.body.date,
      description: req.body.description,
      rain: false,
      subtasks: [req.body.subtask1, req.body.subtask2, req.body.subtask3, req.body.subtask4],
      completed: false,
      tags: [req.body.tag1, req.body.tag2, req.body.tag3, req.body.tag4]
    }
    Database.cindy.reminders.push(reminder);

    //Adds task to the google sheet at the same time as local storage
    values = [[reminder.id, reminder.title, reminder.date, reminder.description, reminder.rain, reminder.subtasks[0],
              reminder.subtasks[1], reminder.subtasks[2], reminder.subtasks[3], reminder.completed, reminder.tags[0],
              reminder.tags[1], reminder.tags[2], reminder.tags[3]]]
    const resource = {values,};
    let range = "Sheet1!A" + reminder.id + ":A" + reminder.id;
  fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);

    // Authorize a client with credentials, then call the Google Sheets API.
    authorize(JSON.parse(content), function(auth) {
      const sheets = google.sheets({version: 'v4', auth});
      sheets.spreadsheets.values.append({
        auth: auth,
        spreadsheetId: '1l8XiLrVRqbjaBzmKJBmi4aMxKqlJdV6b_XT_mTH0vAQ',
        range,
        valueInputOption: "RAW",
        resource,
      }, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log('%d cells updated.', result.updatedCells);
      }
      })
    });
  });
    res.redirect('/reminder');
  },


  edit: (req, res) => {
    let reminderToFind = req.params.id;
    let searchResult = Database.cindy.reminders.find(function(reminder) {
      return reminder.id == reminderToFind; // Why do you think I chose NOT to use === here?
    });
    res.render('reminder/edit', { reminderItem: searchResult })
  },

  //Updates the parameters of a task in Database.cindy as well as our google sheet.
  update: (req, res) => {
    let reminderToFind = req.params.id;
    let searchResult = Database.cindy.reminders.find(function(reminder) {
      if(reminder.id == reminderToFind) {
        reminder.title = req.body.title,
        reminder.description = req.body.description,
        reminder.date = req.body.date,
        reminder.rain = false,
        reminder.subtasks = [req.body.subtask1, req.body.subtask2, req.body.subtask3, req.body.subtask4],
        reminder.completed = req.body.completed == "true",
        reminder.tags = [req.body.tag1, req.body.tag2, req.body.tag3, req.body.tag4]
      }

      //Updating the google sheet at the same time as locally stored task
      let updateRange = "Sheet1!A" + req.params.id + ":N" + req.params.id;
        let values = [[req.params.id, req.body.title, req.body.description, req.body.date, false, req.body.subtask1,
                      req.body.subtask2, req.body.subtask3, req.body.subtask4, req.body.completed == "true",
                      req.body.tag1, req.body.tag2, req.body.tag3, req.body.tag4]]
        let resource = {values,}
        fs.readFile('credentials.json', (err, content) => {
          if (err) return console.log('Error loading client secret file:', err);

          // Authorize a client with credentials, then call the Google Sheets API.
          authorize(JSON.parse(content), function(auth){
            const sheets = google.sheets({version: 'v4', auth});
            sheets.spreadsheets.values.update({
              auth: auth,
              spreadsheetId: '1l8XiLrVRqbjaBzmKJBmi4aMxKqlJdV6b_XT_mTH0vAQ',
              range: updateRange,
              valueInputOption: "RAW",
              resource,
            }, (err, result) => {
            if (err) {
              console.log(err);
            } else {
              console.log('%d cells updated.', result.updatedCells);
            }
          })
          });
        });
    });
    res.redirect('/reminder/' + reminderToFind)
  },

  //Deletes a reminder from Database.cindy as well as our google sheet.
  delete: (req, res) => {
    let reminderToFind = req.params.id;
    let reminderIndex = Database.cindy.reminders.findIndex(function(reminder) {
      return reminder.id == reminderToFind; 
    })
    Database.cindy.reminders.splice(reminderIndex, 1);

    //Removes task from the google sheet by removing the values in its cells
    //Possible to edit this to delete an entire row instead of updating its contents to empty strings?
    let deleteRange = "Sheet1!A" + req.params.id + ":N" + req.params.id;
    let values = [["", "", "", "", "", "", "", "", "", "", "", "", "", ""]]
    let resource = {
      values,
    }
    fs.readFile('credentials.json', (err, content) => {
      if (err) return console.log('Error loading client secret file:', err);
      
      // Authorize a client with credentials, then call the Google Sheets API.
      authorize(JSON.parse(content), function(auth){
        const sheets = google.sheets({version: 'v4', auth});
        sheets.spreadsheets.values.update({
          auth: auth,
          spreadsheetId: '1l8XiLrVRqbjaBzmKJBmi4aMxKqlJdV6b_XT_mTH0vAQ',
          range: deleteRange,
          valueInputOption: "RAW",
          resource,
        }, (err, result) => {
        if (err) {
          console.log(err);
        } 
      })
      });
    });
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
  },

  refreshReminders: (req, res) => {
    Database.cindy.reminders = [];
    fs.readFile('credentials.json', (err, content) => {
      if (err) return console.log('Error loading client secret file:', err);
      authorize(JSON.parse(content), function(auth){
        const sheets = google.sheets({version: 'v4', auth});
        sheets.spreadsheets.values.get({
          spreadsheetId: '1l8XiLrVRqbjaBzmKJBmi4aMxKqlJdV6b_XT_mTH0vAQ',
          range: 'Sheet1',
        }, (err, res) => {
          if (err) return console.log('The API returned an error: ' + err);
            let data = res.data.values;
          if (data == undefined){
            return console.log('No data to return');
          }
          if (data.length) {
            for (i = 0; i < data.length; i++){
              if (data[i][0] != undefined) {
                newReminder = {
                  id: data[i][0],
                  title: data[i][1],
                  date: data[i][2],
                  description: data[i][3],
                  rain: bool = data[i][4] == "true",
                  subtasks: [data[i][5], data[i][6], data[i][7], data[i][8]],
                  completed: bool = data[i][9] == "true",
                  tags: [data[i][10], data[i][11], data[i][12], data[i][13]]
                }
          Database.cindy.reminders.push(newReminder);
              }
            }
          }
        });
      });
    });
    res.redirect('/');
  }
}
module.exports = remindersController
