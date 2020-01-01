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
    }).catch(err => {
        if(err) throw err;
    });
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
        }).catch(err => {
            if(err) throw err;
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
            }).catch(err => {
                if(err) throw err;
            });
        });
    });
}

function checkStock(id, quantity){
    connection.query("SELECT * FROM products WHERE item_id = ?", [id], function(err, results){
        if(err) throw err;
        var totalCost = results[0].price * quantity;
        if(quantity > results[0].stock_quantity){
            console.log("Insufficient quantity!");
            orderProduct(id);
        }else{
            inquirer.prompt({
                name: "cost",
                type: "confirm",
                message: "Your total is " + totalCost + " would you like to purchase?"
            }).then(function(input){
                if(input.cost === true){
                    buyProduct(id, quantity, totalCost);
                }else{
                    displayItems();
                }
            }).catch(err => {
                if(err) throw err;
            });
        }
    });
}

function buyProduct(id, quantity, totalCost){
    connection.query("SELECT * FROM products WHERE item_id = ?", [id], function(err, results){
        if(err) throw err;
        var remainingStock = results[0].stock_quantity - quantity;
        connection.query("UPDATE products SET? WHERE ?", [
            {stock_quantity: remainingStock},
            {item_id: id}
        ]);
    });
    console.log("Your item(s) have been purchased for " + totalCost);
    inquirer.prompt({
        name: "buyAgain",
        type: "confirm",
        message: "Would you like to continue shopping?"
    }).then(function(input){
        if(input.buyAgain === true){
            displayItems();
        }else{
            connection.end();
        }
    }).catch(err => {
        if(err) throw err;
    });
}

connection.connect(function(err){
    if(err) throw err;
    begin();
});