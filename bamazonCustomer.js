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
            displayItems();
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

// Logs all items for sale in the terminal
function displayItems(){
    // Looks for the correct table in the mysql database
    connection.query("SELECT * FROM products",
    function(err, results){
        // Looks for any errors with mysql and shows the error if any occured
        if(err) throw err;
        // Loops through all our data from the mysql table
        for(var i = 0; i < results.length; i++){
            console.log("----------\nItem ID: " + results[i].item_id + "\nDepartment: " + results[i].department_name + "\nItem Name: " +  results[i].product_name + "\nItem Cost: $" + results[i].price + "\n----------");
        }
        chooseProduct();
    });
}

// Asks the user which product they would like to buy
function chooseProduct(){
    connection.query("SELECT * FROM products", function(err, results){
        if(err) throw err;
        inquirer.prompt({
            name: "askId",
            type: "list",
            message: "Please select the ID of the product you would like to buy",
            // Makes a new array using the product IDs and then allows the user to select which product they would like
            choices: function(){
                var choices = new Array();
                for(var i = 0; i <results.length; i++){
                    choices.push(results[i].item_id)
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
        inquirer.prompt({
            name: "doublecheck",
            type: "confirm",
            message: "You've selected " + results[0].product_name + " for " + results[0].price + ". Is that correct?"
        }).then(function(input){
            if(input.doublecheck === true){
                return true;
            }else{
                // Sends the user back to the product display function if they want to change items or exit
                displayItems();
            }
        }).then(function(){
            // Variable for checking an input for numbers only validation
            var numbers = /^[0-9]+$/;
            inquirer.prompt({
                name: "quantity",
                type: "input",
                message: "How many " + results[0].product_name + " would you like to purchase?",
                validate: function(answer){
                    // Validates that the user has entered a number
                    if(answer.match(numbers)){
                        return true;
                    }else{
                        return "Please enter a number";
                    }
                }
            }).then(function(answer){
                // Passes the product ID and quantity to the check stock function
                checkStock(results[0].item_id, answer.quantity);
            }).catch(err => {
                if(err) throw err;
            });
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
                    displayItems();
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
            displayItems();
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