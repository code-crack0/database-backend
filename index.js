import runQuery from "./dbConnection.js";
import express from 'express'
import bodyParser from 'body-parser'
import { nanoid } from 'nanoid'
import cors from 'cors'
import sql from 'sql-template-tag';
const app = express();
app.use(bodyParser());
app.use(cors())
// EMPLOYEE ROUTES
app.get('/employee',async (req,res) => {
    const promptResult = await runQuery('select * from User_Employee')
    res.json(promptResult?.rows)
}
);
app.get('/employee/:id',async (req,res) => {
    const query= sql`select * from User_Employee where userid = ${req.params.id}`
    const promptResult = await runQuery(query);
    res.json(promptResult?.rows)
}
);
app.delete('/employee/:id',async(req,res) => {
    const query = sql`delete from User_Employee where userid = ${req.params.id}`
    const promptResult = await runQuery(query);
    res.json(promptResult?.rows)
}
);
app.post('/employee',async(req,res) => {
    try{
        const{username,is_admin,name,position,phone,salary,password} = req.body;
        const employee_id = nanoid();
        const promptResult = await runQuery(`insert into User_Employee (userid,username,password,isadmin,name,position,contact_information,salary) values ('${employee_id}','${username}','${password}','${is_admin}','${name}','${position}','${phone}','${salary}')`)
        res.json(promptResult?.rows)
    }
    catch(err){
        res.status(400).send(err);
    }
}
);

// CUSTOMER ROUTES

// GET ALL CUSTOMERS
app.get('/customer',async (req,res) => {
    const query = sql`select * from customer`
    const promptResult = await runQuery(query)
    res.json(promptResult?.rows)
}
);

// GET CUSTOMER BY ID

app.get('/customer/:id',async (req,res) => {
    const query = sql`select * from customer where customerid = ${req.params.id}`
    const promptResult = await runQuery(query)
    res.json(promptResult?.rows)
}
);
// CREATE CUSTOMER  (POST)
app.post('/customer',async(req,res) => {
    const {name, email, phone} = req.body
    const id = nanoid() ;  // will be used to generate a unique id
    const promptResult = await runQuery(`insert into customer (customerid,name, email, contact_information) values ('${id}','${name}','${email}','${phone}')`)
    res.json(promptResult?.rows)
}
);
// UPDATE CUSTOMER (PATCH)
app.patch('/customer/:id',async(req,res) => {
    const {name, email, phone} = req.body
    const query = sql`update customer set name = ${name}, email = ${email}, contact_information = ${phone} where customerid = ${req.params.id}`
    const promptResult = await runQuery(query)
    res.json(promptResult?.rows)
}
);

// DELETE CUSTOMER (DELETE)
app.delete('/customer/:id',async(req,res) => {
    const query = sql`delete from customer where customerid = ${req.params.id}`
    const promptResult = await runQuery(query);
    res.json(promptResult?.rows)
}
);

// MENU ROUTES

// GET ALL MENU
app.get('/menu',async (req,res) => {
    const query = sql`select * from menu`
    const promptResult = await runQuery(query);
    res.json(promptResult?.rows)
}
);
// GET MENU ITEM BY ID
app.get('/menu/:id',async (req,res) => {
    const query = sql`select * from menu where itemid = ${req.params.id}`
    const promptResult = await runQuery(query);
    res.json(promptResult?.rows)
}
);
// UPDATE MENU ITEM (PATCH)
app.patch('/menu/:id',async(req,res) => {
    const {name, price,description,category,} = req.body
     const query = sql`update menu set itemname = ${name}, price = ${price} , description = ${description}, category = ${category} where itemid = ${req.params.id}`
    const promptResult = await runQuery(query);
    res.json(promptResult?.rows)
}
);
// DELETE MENU ITEM (DELETE)
app.delete('/menu/:id',async(req,res) => {
    const query = sql`delete from menu where itemid = ${req.params.id}`
    const promptResult = await runQuery(query);
    res.json(promptResult?.rows)
}
);
// CREATE MENU ITEM (POST)
app.post('/menu',async(req,res) => {
    const {name, description, price, category} = req.body
    const id = nanoid() // will be used to generate a unique id
    const promptResult = await runQuery(`insert into menu (itemid,itemname, description, price, category) values ('${id}','${name}','${description}','${price}','${category}')`)
    res.json(promptResult?.rows)
}
);
// ORDER ROUTES

// GET ALL ORDERS
app.get('/order',async (req,res) => {
    const query = sql`select * from Orders`
    const promptResult = await runQuery(query);
    res.json(promptResult?.rows)
}
);
// GET ORDER BY ID
app.get('/order/:id',async (req,res) => {
    const query = sql`select * from Orders where orderid = ${req.params.id}`
    const promptResult = await runQuery(query);
    res.json(promptResult?.rows)
}
);
// UPDATE ORDER (PATCH)
app.patch('/order/:id',async(req,res) => {
    const order_id = req.params.id;
    const {employee_id,customer_id,table_number,order_date,total_price} = req.body;
    const query = sql`update Orders set orderid = ${order_id}, employeeid = ${employee_id}, customername = ${customer_id}, tablenumber = ${table_number}, orderdate = ${order_date}, totalprice = ${total_price} where orderid = ${req.params.id}`;
    const promptResult = await runQuery(query);
    res.json(promptResult?.rows)
}
);
// POST ORDER (POST) CHECK if customer id exists

// app.post('/create-employee', async(req,res) => {
//     const 
// })
app.listen(5000,function (){
    console.log('listening on prt 5000')
})