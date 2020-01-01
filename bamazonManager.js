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

function begin(){
    inquirer.prompt({
        name: "menu",
        type: "list",
        message: "Welcome to the Manager Menu",
        choices: ["View Products for Sale", new inquirer.Separator(), "View Low Inventory", new inquirer.Separator(), "Add to Inventory", new inquirer.Separator(), "Add New Product"]
    }).then(function(input){
        switch(input.menu){
            case "View Products for Sale":
                viewProducts();
                break;
            case "View Low Inventory":
                viewLowInventory();
                break;
            case  "Add to Inventory":
                addInventory();
                break;
            case "Add New Product":
                addProduct();
                break;
        }
    }).catch(err => {
        if(err) throw err;
    });
}

function viewProducts(){
    connection.query("SELECT * FROM products",
    function(err, results){
        if(err) throw err;
        for(var i = 0; i < results.length; i++){
            console.log("----------\nItem ID: " + results[i].item_id + "\nDepartment: " + results[i].department_name + "\nItem Name: " +  results[i].product_name + "\nItem Cost: $" + results[i].price + "\nItem Quantity: " + results[i].stock_quantity + "\n----------");
        }
        begin();
    });
}

function viewLowInventory(){ 
    connection.query("SELECT * FROM products WHERE stock_quantity < 5",
    function(err, results){
        if(err) throw err;
        for(var i = 0; i < results.length; i++){
            console.log("----------\nItem ID: " + results[i].item_id + "\nDepartment: " + results[i].department_name + "\nItem Name: " +  results[i].product_name + "\nItem Cost: $" + results[i].price + "\nItem Quantity: " + results[i].stock_quantity + "\n----------");
        }
        begin();
    });
}

function addInventory(){
    
}

function addProduct(){
    
}

connection.connect(function(err){
    if(err) throw err;
    begin();
});