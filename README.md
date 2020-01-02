# bamazon Amazon StoreFront

![Screenshot](/assets/screenshot.png)

## About

This application makes use of Node.js to create a command line interface that models an amazon-like storefront. The user must install MySQL Workbench and npm packages before the app will work. After set up, the user can decide to use the app as either a customer or a manager. If the user decides to use the customer app, they will be able to view products for sale and purchase items. However, the mysql database tracks the available stock quantity of all the items in real time. If the user attempts to purchase more of an item than the quantity that's available, they will not be able to proceed. If the user decides to use the manager app, they will be able to view all inventory, view inventory with low stock, restock inventory, and add new products to the inventory.

## Demo/Code

Customer Demo
![Demo](/assets/images/demo1.gif)

Manager Demo
![Demo](/assets/images/demo2.gif)

![Code](/assets/images/code.png)

## Requirements

*[Node](https://nodejs.org/en/)

*[Inquirer npm](https://www.npmjs.com/package/inquirer)

*[MySQL npm](https://www.npmjs.com/package/mysql)

*[MySQL Workbench](https://www.mysql.com/products/workbench/)

## Instructions

1. Install the latest MySQL Workbench

2. In mysql, create a local database connection with the root user. Make sure you remember the password you create.

3. Clone this repository

4. Copy all the code from schema.sql and paste it into the mysql workbench and press the lightning bolt button to run the code.

5. Clear the code from the mysql workbench. Now, Copy the code from seed.sql and paste it into the mysql workbench and press the lightning bolt button to run the code.

6. Open your git bash terminal and navigate to the repository

7. Enter ```npm init -y``` into the terminal

8. Enter ```npm i inquirer mysql``` and wait for packages to install

9. Type the password you created in step 2 into the quotation marks on line 11 of bamazonCustomer.js and line 9 of bamazonManager.js, underneath where it says "// Put your mysql password here:"

10. To use the app as a customer, enter ```node bamazonCustomer.js``` and follow onscreen prompts to use the app

11. To use the app as a manager, enter ```node bamazonManager.js``` and follow onscreen prompts to use the app

## Build Tools

*Javascript

*Git Bash Terminal

*Node

*NPM

*MySQL Workbench