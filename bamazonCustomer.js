const mysql = require("mysql");
const inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "bamazon"
});

function begin(){
    inquirer.prompt({
        name: "welcome",
        type: "confirm",
        message: "Welcome to the Store Front! Would you like to view what's for sale?"
    }).then(function(input){
        if (input.welcome === true){
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
            console.log("----------\nItem ID: " + results[i].item_id + "\nDepartment: " + results[i].department_name + "\nItem Name: " +  results[i].product_name + "\nItem Cost: $" + results[i].price + "\n----------");
        }
        chooseProduct();
    });
}

function chooseProduct(){
    connection.query("SELECT * FROM products", function(err, results){
        if(err) throw err;
        inquirer.prompt({
            name: "askId",
            type: "list",
            message: "Please select the ID of the product you would like to buy",
            choices: function(){
                var choices = new Array();
                for(var i = 0; i <results.length; i++){
                    choices.push(results[i].item_id)
                }
                choices.push("exit");
                return choices;
            }
        }).then(function(input){
            if(input.askId === "exit"){
                connection.end();
                return;
            }else{
                orderProduct(input.askId);
            }
        });
    });
}

function orderProduct(id){
    connection.query("SELECT * FROM products WHERE item_id = ?", [id], function(err, results){
        if(err) throw err;
        inquirer.prompt({
            name: "doublecheck",
            type: "confirm",
            message: "You've selected " + results[0].product_name + " for " + results[0].price + ". Is that correct?"
        }).then(function(input){
            if(input.doublecheck === true){
                return true;
            }else{
                displayItems();
            }
        }).then(function(){
            var numbers = /^[0-9]+$/;
            inquirer.prompt({
                name: "quantity",
                type: "input",
                message: "How many " + results[0].product_name + " would you like to purchase?",
                validate: function(answer){
                    if(answer.match(numbers)){
                        return true;
                    }else{
                        return "Please enter a number";
                    }
                }
            }).then(function(answer){
                checkStock(results[0].item_id, answer.quantity);
            });
        });
    });
}

function checkStock(id, quantity){
    connection.query("SELECT * FROM products WHERE item_id = ?", [id], function(err, results){
        if(err) throw err;
        if(quantity > results[0].stock_quantity){
            console.log("Insufficient quantity!");
            orderProduct(id);
        }else{
            buyProduct();
        }
    });
}

function buyProduct(){
    // buy product code here
    console.log("hello");
}

connection.connect(function(err){
    if(err) throw err;
    begin();
});