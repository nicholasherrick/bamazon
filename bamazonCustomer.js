const mysql = require("mysql");
const inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "bamazon"
});

connection.connect(function(err){
    if(err) throw err;
    begin();
});

function begin(){
    inquirer.prompt({
        name: "welcome",
        type: "confirm",
        message: "Welcome to the Store Front! Would you like to view what's for sale?"
    }).then(function(answer){
        if (answer.welcome === true){
            displayItems();
        }else{
            console.log("Goodbye!");
            connection.end();
        }
    })
}

function displayItems(){
    connection.query("SELECT * FROM products",
    function(err, results){
        if(err) throw err;
        for(var i = 0; i < results.length; i++){
            console.log("----------\nItem ID: " + results[i].item_id + "\nItem Name: " + results[i].product_name + "\nItem Cost: $" + results[i].price + "\n----------");
        }
    });
}