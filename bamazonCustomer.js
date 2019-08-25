//bamazonCustomer.js


var inquirer = require("inquirer");
var mysql = require("mysql");

// Accept user login
// Global variables to hold 
var gUser = "";
var gPassword = "";

var connection = mysql.createConnection({
   host: "localhost",
   // Your port; if not 3306
   port: 3306,
   // Your username
   user: "root",
   // Your password
   password: "MyPwd#1",
   database: "bamazom"
});

function acceptPassword() {
   console.log('in accept password again');
   inquirer.prompt([
       {
           type: "password",
           name: "myPassword",
           message: "The password does not match, Please enter it again: "
       }
   ]).then(function (res) {
       gPassword=res.myPassword;
       if (isPasswordValid(gPassword, gUser)) {
           connection.end();
           return true;
       }
       else {
           acceptPassword();
       };
   })
}
function acceptUserName() {
   inquirer.prompt([
       {
           type: "input",
           name: "userName",
           message: "Enter your user name: "
       },
       {
           type: "password",
           name: "myPassword",
           message: "Enter your password: "
       }
   ]).then(function (user) {
       // get the password of the user from the DB
       connection.connect(function (err) {
           if (err) throw err;
           var query = connection.query(
               "Select password from users where user_name = ?", [user.userName],
               function (err, res) {
                   if (err) throw err;
                   gPassword = user.myPassword;
                   gUser = user.userName;
                   if (isPasswordValid(gUser,gPassword)) {
                       connection.end();
                       return true;
                   }
                   else {
                       acceptPassword();
                   };
               }
           )
           console.log(query.sql);
       })
   });
}
function isPasswordValid(dbPassword, password) {
   if (dbPassword != password) {
       return false;
   } else {
       return true;
   }
}
acceptUserName();

// user prompts

// show department options
// show item options
// show options for sizes






function acceptDepartment() {
    inquirer
    .prompt({
      name: "department",
      type: "list",
      message: "Please select the department to shop from:",
      choices: ["Womens Dresses", "Skirts", "Ments T-shirts", "Ments Belts"]
    })
    .then(function(answer) {
      // based on their answer, either call the bid or the post functions
        console.log(answer);
    });
 }

 acceptDepartment();