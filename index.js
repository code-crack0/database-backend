const runQuery = require('./dbConnection.js')
const express = require('express')
const bodyParser = require('body-parser')
const app = express();
app.use(bodyParser());


// CUSTOMER ROUTES

// GET ALL CUSTOMERS
app.get('/customer',async (req,res) => {
    const promptResult = await runQuery('select * from customer')
    res.json(promptResult)
}
);

// GET CUSTOMER BY ID
app.get('/customer/:id',async (req,res) => {
    const promptResult = await runQuery(`select * from customer where customerid = ${req.params.id}`)
    res.json(promptResult)
}
);
// CREATE CUSTOMER  (POST)
app.post('/customer',async(req,res) => {
    const {name, email, phone} = req.body
    // const id = nanoid() will be used to generate a unique id
    const promptResult = await runQuery(`insert into customer (customerid,name, email, phone) values ('${id}','${name}','${email}','${phone}')`)
    res.json(promptResult)
}
);
// UPDATE CUSTOMER (PATCH)
app.patch('/customer/:id',async(req,res) => {
    const {name, email, phone} = req.body
    const promptResult = await runQuery(`update customer set name = '${name}', email = '${email}', phone = '${phone}' where customerid = ${req.params.id}`)
    res.json(promptResult)
}
);

// DELETE CUSTOMER (DELETE)
app.delete('/customer/:id',async(req,res) => {
    const promptResult = await runQuery(`delete from customer where customerid = ${req.params.id}`)
    res.json(promptResult)
}
);

// MENU ROUTES

// GET ALL MENU
app.get('/menu',async (req,res) => {
    const promptResult = await runQuery('select * from menu')
    res.json(promptResult)
}
);
// GET MENU ITEM BY ID
app.get('/menu/:id',async (req,res) => {
    const promptResult = await runQuery(`select * from menu where itemid = ${req.params.id}`)
    res.json(promptResult)
}
);
// UPDATE MENU ITEM (PATCH)
app.patch('/menu/:id',async(req,res) => {
    const {name, price} = req.body
    // const id = nanoid() will be used to generate a unique id
    const promptResult = await runQuery(`update menu set itemid = '${id}' name = '${name}', description = '${description}' , price = '${price}' , category = '${category}' where itemid = ${req.params.id}`)
    res.json(promptResult)
}
);
// DELETE MENU ITEM (DELETE)
app.delete('/menu/:id',async(req,res) => {
    const promptResult = await runQuery(`delete from menu where itemid = ${req.params.id}`)
    res.json(promptResult)
}
);
// CREATE MENU ITEM (POST)
app.post('/menu',async(req,res) => {
    const {name, description, price, category} = req.body
    // const id = nanoid() will be used to generate a unique id
    const promptResult = await runQuery(`insert into menu (itemid,name, description, price, category) values ('${id}','${name}','${description}','${price}','${category}')`)
    res.json(promptResult)
}
);
// ORDER ROUTES

// GET ALL ORDERS
app.get('/order',async (req,res) => {
    const promptResult = await runQuery('select * from "Order" ')
    res.json(promptResult)
}
);

// app.post('/create-employee', async(req,res) => {
//     const 
// })
app.listen(5000,function (){
    console.log('listening on prt 5000')
})