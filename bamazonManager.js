const mysql = require("mysql");
const inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    // Put your mysql password here:
    password: "",
    database: "bamazon"
});

function begin() {
    var sep = new inquirer.Separator();
    inquirer.prompt({
        name: "menu",
        type: "list",
        message: "Welcome to the Manager Menu",
        choices: ["View Products for Sale", sep, "View Low Inventory", sep, "Add to Inventory", sep, "Add New Product", sep, "Exit"]
    }).then(function (input) {
        switch (input.menu) {
            case "View Products for Sale":
                viewProducts();
                break;
            case "View Low Inventory":
                viewLowInventory();
                break;
            case "Add to Inventory":
                addInventory();
                break;
            case "Add New Product":
                addProduct();
                break;
            case "Exit":
                connection.end();
                break;
        }
    }).catch(err => {
        if (err) throw err;
    });
}

function viewProducts() {
    connection.query("SELECT * FROM products",
        function (err, results) {
            if (err) throw err;
            for (var i = 0; i < results.length; i++) {
                console.log("----------\nItem ID: " + results[i].item_id + "\nDepartment: " + results[i].department_name + "\nItem Name: " + results[i].product_name + "\nItem Cost: $" + results[i].price + "\nItem Quantity: " + results[i].stock_quantity + "\n----------");
            }
            begin();
        });
}

function viewLowInventory() {
    connection.query("SELECT * FROM products WHERE stock_quantity < 5",
        function (err, results) {
            if (err) throw err;
            for (var i = 0; i < results.length; i++) {
                console.log("----------\nItem ID: " + results[i].item_id + "\nDepartment: " + results[i].department_name + "\nItem Name: " + results[i].product_name + "\nItem Cost: $" + results[i].price + "\nItem Quantity: " + results[i].stock_quantity + "\n----------");
            }
            begin();
        });
}

function addInventory() {
    connection.query("SELECT * FROM products",
        function (err, results) {
            if (err) throw err;
            for (var i = 0; i < results.length; i++) {
                console.log("----------\nItem ID: " + results[i].item_id + "\nDepartment: " + results[i].department_name + "\nItem Name: " + results[i].product_name + "\nItem Cost: $" + results[i].price + "\nItem Quantity: " + results[i].stock_quantity + "\n----------");
            }
            inquirer.prompt({
                name: "pickItem",
                type: "list",
                message: "Please pick an item to add inventory",
                choices: function () {
                    var choices = new Array();
                    for (var i = 0; i < results.length; i++) {
                        choices.push(results[i].item_id)
                    }
                    choices.push("Exit");
                    return choices;
                }
            }).then(function (input) {
                if (input.pickItem === "Exit") {
                    begin();
                } else {
                    restock(input.pickItem);
                }
            }).catch(err => {
                if (err) throw err;
            });
        });
}

function restock(id) {
    connection.query("SELECT * FROM products WHERE item_id = ?", [id],
        function (err, results) {
            if (err) throw err;
            inquirer.prompt({
                name: "add",
                type: "input",
                message: "How many " + results[0].product_name + " would you like to add to inventory? type 'cancel' to return to main menu"
            }).then(function (input) {
                var numbers = /^[0-9]+$/;
                if (input.add === "cancel") {
                    begin();
                } else if (input.add.match(numbers)) {
                    var newQuantity = parseFloat(results[0].stock_quantity) + parseFloat(input.add);
                    connection.query("UPDATE products SET? WHERE ?", [
                        { stock_quantity: newQuantity },
                        { item_id: id }
                    ]);
                    inquirer.prompt({
                        name: "updated",
                        type: "confirm",
                        message: "Stock quantity of " + results[0].product_name + " increased to " + newQuantity + ". Would you like to return to the main menu?"
                    }).then(function (input) {
                        if (input.updated === true) {
                            begin();
                        } else {
                            connection.end();
                        }
                    }).catch(err => {
                        if (err) throw err;
                    });
                } else {
                    console.log("Please enter a valid input");
                    return;
                }
            }).catch(err => {
                if (err) throw err;
            });
        });
}

function addProduct() {
    var numbers = /^[0-9]+$/;
    inquirer.prompt([
        {
            name: "name",
            type: "input",
            message: "Please enter the name of the product you'd like to add",
            validate: function (input) {
                if (input) {
                    return true;
                } else {
                    return false;
                }
            }
        },
        {
            name: "department",
            type: "input",
            message: "Please enter the name of the department this item belongs to",
            validate: function (input) {
                if (input) {
                    return true;
                } else {
                    return false;
                }
            }
        },
        {
            name: "cost",
            type: "input",
            message: "Please enter the price for this item"
        },
        {
            name: "quantity",
            type: "input",
            message: "How much stock of this item is available?",
            validate: function (input) {
                if (input.match(numbers)) {
                    return true;
                } else {
                    console.log("Please enter a number");
                    return false;
                }
            }
        }
    ]).then(function (input) {
        connection.query("INSERT INTO products(product_name, department_name, price, stock_quantity) VALUE (?, ?, ?, ?);", [input.name, input.department, input.cost, input.quantity], function (err, results) {
            if (err) throw err;
            console.log(input.name + " Has been added to the store");
            inquirer.prompt({
                name: "continue",
                type: "confirm",
                message: input.name + " Has been added to the store. Would you like to return to the menu?"
            }).then(function (input) {
                if (input.continue === true) {
                    begin();
                } else {
                    connection.end();
                }
            }).catch(err => {
                if (err) throw err;
            });
        });
    }).catch(err => {
        if (err) throw err;
    });
}

connection.connect(function (err) {
    if (err) throw err;
    begin();
});