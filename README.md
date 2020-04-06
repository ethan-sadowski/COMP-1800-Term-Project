# COMP 1800 - Remo (Reminder App) Documentation

## Project Purpose:
The mission of this project is to develop and ship/host a working reminder app. 
The finished produce will allow users to create a reminder, delete a reminder, and edit a reminder.
In addition, the reminders will allow the use of tags, subtasks, and dates associated with the reminder. 
Users will also be able in import or export their reminders as files, and also demonstrate a form of user authentication. 
Finally, the product will incorporate two API's, the DarkSky Weather API and the HTML5 Geolocation API, and will inform users if they will need an umbrella on the day of their reminder.


## Team Contact:
| Member | Contact |
| ----------- | ----------- |
| Arjun Dhaliwal | adhaliwal111@gmail.com |
| Ethan Sadowski | esadowski1@my.bcit.ca |
| Vivian Cao | vivian.w.cao@gmail.com |

## Design:
Design was implemented using Bootstrap's CSS and JS.

### Font:

| Section | Font | Colour |
| --- | --- | :---: |
| NavBar | Helvetica Neue | White |
| Headers | Helvetica Neue | Black, White, or #343A40 (Dark Grey) |
| Reminders Header | Playfair Display | White text with text-shadow: 3px 3px rgb(21, 75, 75) |
| Body Text | Helvetica Neue | Black, White, or #343A40 (Dark Grey) |
| Buttons (Text) | Helvetica Neue | White or #343A40 (Dark Grey) |

### Buttons:
| Button Location/Section | Body Colour|
| --- | --- |
| Landing Page Buttons | #616A72 (Slate Gray) |
| "Your Reminders" Button | #343A40 (Slate Gray #2) |
| Edit Button | #E0A800 (Mustard Yellow) |
| Delete Button | #C82332 (Red) |


### Background:
The background is a linear-gradient at 30 degrees using three rgba colours in the folllowing order:

1. rgba(53, 85, 65, 0.322) 0%
2. rgba(54, 108, 96, 0.796) 46%
3. rgba(30, 122, 118, 0.925) 100%


## API:
Remo utilizes the following APIs:

| API | Documentation|
| --- | --- |
| DarkSky Weather API | https://darksky.net/dev/docs |
| HTML5 Geolocation API | https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API |

## Database:
The external storage for the Remo application uses an integrated Google Sheet.


## How to Run:
To run our application on your own computer, please follow the following steps:

1. Download the files to your computer in one folder
2. In your console, go to the directory containing the files
3. Run npm install
4. Type node index.js into the console
5. Go to your browser and enter localhost:3000



