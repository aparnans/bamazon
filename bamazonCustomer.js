//bamazonCustomer.js


var inquirer = require("inquirer");
var mysql = require("mysql");

// Accept user login
// Global variables to hold 
var gUser = "";
var gPassword = "";
var guserVerified = false;
var departmentList = [];
var gConnection;

function connectDB() {
    gConnection = mysql.createConnection({
        host: "localhost",
        // Your port; if not 3306
        port: 3306,
        // Your username
        user: "root",
        // Your password
        password: "MyPwd#1",
        database: "bamazom"
    });
};

function acceptPassword() {
    console.log('in accept password again');
    inquirer.prompt([
        {
            type: "password",
            name: "myPassword",
            message: "The password does not match, Please enter it again: "
        }
    ]).then(function (res) {
        if (isPasswordValid(gPassword, res.myPassword)) {
            console.log('Returning after passwords match in acceptPassword');
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
        gConnection.connect(function (err) {
            if (err) throw err;
            var query = gConnection.query(
                "Select password from users where username = ?", [user.userName],
                function (err, res) {
                    if (err) throw err;
                    gPassword = res[0].password;
                    gUser = user.userName;
                    if (isPasswordValid(gPassword, user.myPassword)) {
                        console.log("password is valid");
                        guserVerified = true;
                        console.log("Calling acceptDepartment");
                        acceptDepartment();
                    }
                    else {
                        acceptPassword();
                    };
                }
            )
            return true;
        })
    });


}
function isPasswordValid(dbPassword, password) {
    console.log('in isPasswordValid : dbPassword : password : ', dbPassword, password);
    if (dbPassword != password) {
        return false;
    } else {
        guserVerified=true;
        console.log('passwords match');
        return true;
    }
}

// user prompts

// show department options
// show item options
// show options for sizes

function acceptDepartment() {
    console.log('in accept department');
    //use the connection to select department names
    gConnection.query('SELECT distinct department_name from products', function (error, res) {
        console.log('After select ',res[0].department_name);
        if (error) throw error;
        console.log(res[1]);
        for (var i = 0; i < res.length; i++) {
            departmentList.push(res[i].department_name);
        }
    })
    inquirer
        .prompt({
            name: "department",
            type: "list",
            message: "Please select the department to shop from:",
            choices: departmentList//["Womens Dresses", "Skirts", "Ments T-shirts", "Ments Belts"]
        })
        .then(function (answer) {
            // based on their answer, show the list of items to choose from 
            console.log(answer);
        });
    return true;
}

function start() {
    connectDB();
    acceptUserName();
    
    
    return true;

}

start();