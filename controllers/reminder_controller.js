let Database = require("../database");
let auth = require("../credentials.json");
const {google} = require('googleapis');
const fs = require('fs');
const TOKEN_PATH = '../token.json';
var {OAuth2Client} = require('google-auth-library');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const readline = require('readline');

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
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

/*
* @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
* @param {getEventsCallback} callback The callback for the authorized client.
*/
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

let remindersController = {
  list: (req, res) => {
    res.render('reminder/index', { reminders: Database.cindy.reminders })
  },

  new: (req, res) => {
    res.render('reminder/create')
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

  create: (req, res) => {

    //If there are no item in Database.cindy, the first Id = 1, otherwise any new Ids become the length of the
    //array of storage + 1.
    let nextId;
    if (Database.cindy.reminders.length != 0){
      nextId = Database.cindy.reminders[Database.cindy.reminders.length - 1].id + 1
    } else {
      nextId = 1
    }
    let reminder = {
      id: nextId,
      title: req.body.title,
      date: req.body.date,
      description: req.body.description,
      rain: false,
      subtasks: [req.body.subtask1, req.body.subtask2, req.body.subtask3, req.body.subtask4],
      completed: false,
    }
    Database.cindy.reminders.push(reminder);

    //Adds task to the google sheet at the same time as local storage
    values = [[reminder.id, reminder.title, reminder.date, reminder.description, reminder.rain, reminder.subtasks[0],
              reminder.subtasks[1], reminder.subtasks[2], reminder.subtasks[3], reminder.completed]]
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

  update: (req, res) => {
    let reminderToFind = req.params.id;
    let searchResult = Database.cindy.reminders.find(function(reminder) {
      if(reminder.id == reminderToFind) {
        reminder.title = req.body.title,
        reminder.description = req.body.description,
        reminder.date = req.body.date,
        reminder.rain = false,
        reminder.subtasks = [req.body.subtask1, req.body.subtask2, req.body.subtask3, req.body.subtask4],
        reminder.completed = req.body.completed == "true" 
      }

      //Updating the google sheet at the same time as locally stored task
      let updateRange = "Sheet1!A" + req.params.id + ":J" + req.params.id;
        let values = [[req.params.id, req.body.title, req.body.description, req.body.date, false, req.body.subtask1,
                      req.body.subtask2, req.body.subtask3, req.body.subtask4, req.body.completed == "true"]]
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
              // Handle error
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

  delete: (req, res) => {
    let reminderToFind = req.params.id;
    let reminderIndex = Database.cindy.reminders.findIndex(function(reminder) {
      return reminder.id == reminderToFind; 
    })
    Database.cindy.reminders.splice(reminderIndex, 1);

    //Removes task from the google sheet by removing the values in its cells
    //Possible to edit this to delete an entire row instead of updating its contents?
    let deleteRange = "Sheet1!A" + req.params.id + ":J" + req.params.id;
    let values = [["", "", "", "", "", "", "", "", "", ""]]
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
          // Handle error
          console.log(err);
        } 
      })
      });
    });
    res.redirect('/reminder');
  }
}

module.exports = remindersController
