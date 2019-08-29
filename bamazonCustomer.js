//bamazonCustomer.js

//Global variables
var inquirer = require("inquirer");
var mysql = require("mysql");

var gUser = "";
var gPassword = "";
var guserVerified = false;
var departmentList = [];
var gConnection;
var sizeArray =[];
var productArray = [];

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
// This function is to accept password again if the earlier attempt failed 
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
    return true;
}
// This function accepts user name and password to use for shopping
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
                        // If the username and password are valid then populate department list to choose from                         
                        getDepartmentList();
                    }
                    else {
                        acceptPassword();
                        return true;
                    }
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
        guserVerified = true;
        console.log('passwords match');
        return true;
    }
}

// populate the global array to hold department names
function getDepartmentList() {
    //use the connection to select department names
    gConnection.query('SELECT distinct department_name from products', function (error, res) {
        if (error) throw error;

        for (var i = 0; i < res.length; i++) {
            departmentList.push(res[i].department_name);
        }
        acceptDepartment();
    });
}

function acceptDepartment() {
    // Chekc if the departmentList array is populated 
    if (departmentList.length > 0) {
        inquirer
            .prompt({
                name: "department",
                type: "list",
                message: "Please select the department to shop from:",
                choices: departmentList
            })
            .then(function (answer) {
                // based on their answer, show the list of items to choose from 
                console.log(answer.department);
                acceptItem(answer.department);

                return true;
            });
    }
    return true;
}



function acceptItem(pDepartment){
    // Check how many types of products are avaialble in the 
    gConnection.query('select count(distinct product_name) productCnt from products where department_name =?',
        [pDepartment],
        function (error, res) {
            if (error) throw error;
            console.log(res[0].productCnt);
             if(res[0].productCnt > 1) {
                 console.log('more than one');
                 // call Accept Item name
                 gConnection.query('select distinct product_name from products where department_name =?',
                 [pDepartment],
                 function(error, res){
                     if (error) throw error;
                     console.log(res);
                     for(var i=0; i<res.length; i++){
                         productArray.push(res[i].product_name);
                     }
                     // Accept item
                     inquirer
                        .prompt({
                            name: "product_name",
                            type: "list",
                            message: "Please select the item from the list :",
                            choices: productArray
                        })
                        .then(function (answer) {
                            // based on their answer, show the list of items to choose from 
                            console.log(answer.product_name);
                            populateSizeArray(pDepartment, answer.product_name);
                            return true;
                        });

                 });

             }else{
                // get the name of single item in the department
                gConnection.query('select distinct product_name from products where department_name =?',
                                [pDepartment],
                                function(error, res){
                                    if (error) throw error;
                                    console.log(res);
                                    populateSizeArray(pDepartment, res[0].product_name);
                                });
                }
        }) 
}

function populateSizeArray(pDepartment, pItem){
    console.log('In populateSizeArray - pDepartment, pItem : '+pDepartment, pItem);
    
    gConnection.query('select size from products where department_name = ? and product_name = ?',[pDepartment,pItem],
    function (error, res) {
        if (error) throw error;
        console.log(res[0].size);
        for(var i =0;i<res.length;i++){
            sizeArray.push(res[i].size);
        }
        acceptSize(pDepartment, pItem); 
    })
};

function acceptSize(pDepartment, pItem){
    inquirer
            .prompt({
                name: "size",
                type: "list",
                message: "Please select size :",
                choices: sizeArray
            })
            .then(function (answer) {
                // based on their answer, show the list of items to choose from 
                console.log(answer.size);
                acceptQuantity(pDepartment, pItem, answer.size);
                return true;
            });
}

function acceptQuantity(pDepartment, pItem, pSize){
    inquirer
            .prompt({
                name: "quantity",
                type: "input",
                message: "Please enter quantity :"
            })
            .then(function (answer) {
                // based on their answer, show the list of items to choose from 
                console.log(answer.quantity);
                var query = ' select stock_quantity quantity from products where department_name = "'+pDepartment+'" and product_name = "'+pItem+'" and size = "'+pSize+'"';

                gConnection.query(query, 
                function(error, res){
                    if (error) throw error;
                    if(answer.quantity <= res[0].quantity){
                        console.log('Great! Let me get that item for you.');
                        updateQuantity(pDepartment, pItem, pSize, answer.quantity, 'DEDUCT');
                    }else {
                        console.log('not enough quantity ... let me see what I can do');
                        updateQuantity(pDepartment, pItem, pSize, answer.quantity,'ADD');
                    }
                    return true;
                })
            });
}

function updateQuantity(pDepartment, pItem, pSize, pQuantity, action){
    var where = ' where department_name = "'+pDepartment+'" and product_name = "'+pItem+'" and size = "'+pSize+'"';
    var query;
    
    if(action === 'DEDUCT'){
        var query = 'UPDATE products set stock_quantity = stock_quantity - '+pQuantity;   
    }else{
        var query = 'UPDATE products set stock_quantity = stock_quantity + '+pQuantity;
    }
    
    query = query + where;

    gConnection.query(query ,  
         function(error, res){
            if (error) throw error;
            console.log(res);
            orderItem(pDepartment, pItem, pSize, pQuantity);                
         });                           
};

function orderItem(pDepartment, pItem, pSize, pQuantity){
    endConnection();
};


function endConnection() {
    console.log('Thank you for shopping with us');
    gConnection.end();
}

function start() {
    connectDB();
    acceptUserName();
    return true;
}

start();