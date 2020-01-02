// Required NPM Packages
const mysql = require("mysql");
const inquirer = require("inquirer");

// Create connection to mysql Database
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    // Put your mysql password here:
    password: "",
    database: "bamazon"
});

// Begins the app
function begin(){
    inquirer.prompt({
        name: "welcome",
        type: "confirm",
        message: "Welcome to the Store Front! Would you like to view what's for sale?"
    }).then(function(input){
        if (input.welcome === true){
            chooseProduct();
        }else{
            console.log("Goodbye!");
            // Terminates the database connection
            connection.end();
        }
        // Catches and displays any errors that occur
    }).catch(err => {
        if(err) throw err;
    });
}

// Asks the user which product they would like to buy
function chooseProduct(){
    // Grabs data from the database
    connection.query("SELECT * FROM products", function(err, results){
        // If there is an error with retrieving the data, the error will be displayed
        if(err) throw err;
        inquirer.prompt({
            name: "askId",
            type: "list",
            message: "Please select the product you would like to buy",
            // Makes a new array using the product IDs and then allows the user to select which product they would like
            choices: function(){
                var choices = new Array();
                for(var i = 0; i <results.length; i++){
                    var data = results[i];
                    choices.push("ID: " + data.item_id + " | Product: " + data.product_name + " | Price: " + data.price);
                }
                // Adds an option to exit to the list
                choices.push("Exit");
                return choices;
            }
        }).then(function(input){
            // If the user picks exit, the connection is terminated
            if(input.askId === "Exit"){
                connection.end();
                return;
                // When a product is chosen, pass the ID of the chosen item to the order product function
            }else{
                orderProduct(input.askId);
            }
        }).catch(err => {
            if(err) throw err;
        });
    });
}

// Confirms which product the user wants and asks the quantity of the product they would like to purchase
function orderProduct(id){
    connection.query("SELECT * FROM products WHERE item_id = ?", [id], function(err, results){
        if(err) throw err;
        // Variable for checking an input for numbers only validation
        var numbers = /^[0-9]+$/;
        inquirer.prompt([
        {
            name: "doublecheck",
            type: "confirm",
            message: "You've selected " + results[0].product_name + " for " + results[0].price + ". Is that correct?",
            validate: function(input){
                if(input === false){
                    chooseProduct();
                }
            }
        },
        {
            name: "quantity",
            type: "input",
            message: "How many " + results[0].product_name + " would you like to purchase?",
            validate: function(input){
                // Validates that the user has entered a number
                if(input.match(numbers)){
                    return true;
                }else{
                    return "Please enter a number";
                }
            }
        }
        ]).then(function(input){
            // Passes the product ID and quantity to the check stock function
            checkStock(results[0].item_id, input.quantity);
        }).catch(err => {
            if(err) throw err;
        });
    });
}

// Checks the mysql database to ensure the stock is availible for the quantity requested
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
                    // Passes product ID, confirmed quantity, and order cost to the buy product funtion
                    buyProduct(id, quantity, totalCost);
                }else{
                    chooseProduct();
                }
            }).catch(err => {
                if(err) throw err;
            });
        }
    });
}

// Purchases the product from the store by updating the database with the new stock quantity
function buyProduct(id, quantity, totalCost){
    // Pulls the item's stock quantity from the database in order to calculate the newly remaing stock after purchase
    connection.query("SELECT * FROM products WHERE item_id = ?", [id], function(err, results){
        if(err) throw err;
        var remainingStock = parseFloat(results[0].stock_quantity) - parseFloat(quantity);
        // Tells the database the new remaining stock
        connection.query("UPDATE products SET? WHERE ?", [
            {stock_quantity: remainingStock},
            {item_id: id}
        ]);
    });
    // Notifys the user that their purchase was successful and the order cost
    console.log("Your item(s) have been successfully purchased for " + totalCost);
    // Asks if the user would like to continue shopping or exit
    inquirer.prompt({
        name: "buyAgain",
        type: "confirm",
        message: "Would you like to continue shopping?"
    }).then(function(input){
        if(input.buyAgain === true){
            chooseProduct();
        }else{
            connection.end();
        }
    }).catch(err => {
        if(err) throw err;
    });
}

// Connects to the database and begins the app at the bottom so the rest of the code loads first
connection.connect(function(err){
    if(err) throw err;
    begin();
});