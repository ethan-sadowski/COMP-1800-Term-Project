const express = require("express")
const app = express()
const ejsLayouts = require("express-ejs-layouts")
const reminderController = require("./controllers/reminder_controller");
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const http = require('http');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = 'token.json';
let Database = require("./database");

app.use(express.static(__dirname + "/public"))

app.use(express.urlencoded({ extended: false }))

app.use(ejsLayouts)

app.set("view engine", "ejs")

// Routes start here

app.get("/", function(req, res){
  res.render("reminder/promopage.ejs")
})

app.get("/reminder", reminderController.list);

app.get("/reminder/new", reminderController.new);

app.get("/reminder/:id", reminderController.listOne);

app.get("/reminder/:id/edit", reminderController.edit);

app.get("/refresh", reminderController.refreshReminders);

app.post("/reminder/", reminderController.create);

app.post("/reminder/update/:id", reminderController.update);

app.post("/reminder/delete/:id", reminderController.delete);

app.get('/weather', reminderController.getWeather);

app.get('/tagClick', reminderController.deleteTag);

app.listen(3000, function(){
  console.log("Server running. Visit: localhost:3000 in your browser 🚀");
})


//Retrieves our credentials and authenticates a request to read from our google sheet using listReminders
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  authorize(JSON.parse(content), listReminders);
});

//Authorizes an interaction with the google sheets API by providing it with our credentials.
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  // If we dont, getNewToken is called.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

//Prompts the user to log into gmail in order to create a json token.
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

      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

//Populates Database.cindy with the reminders stored in our google sheet.
function listReminders(auth) {
  const sheets = google.sheets({version: 'v4', auth});

  //Calls the google sheet to retrieve its data.
  sheets.spreadsheets.values.get({
    spreadsheetId: '1l8XiLrVRqbjaBzmKJBmi4aMxKqlJdV6b_XT_mTH0vAQ',
    range: 'Sheet1',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
      let data = res.data.values;
    if (data == undefined){
      return console.log('No data to return');
    }

    //If there is data in the sheet, reminders are created from that data and added to Database.cindy.reminders.
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
}