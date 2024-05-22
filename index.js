import runQuery from './dbConnection.js'
import express from 'express'
import bodyParser from 'body-parser'
import { nanoid } from 'nanoid'
import cors from 'cors'
import sql from 'sql-template-tag'
import bcrypt from 'bcryptjs'
const app = express()
app.use(bodyParser())
app.use(cors())

// LOGS GET ROUTE
app.get('/logs', async (req, res) => {
  const e_query = sql`SELECT * FROM Employee_Logs
    ORDER BY log_timestamp DESC `
  const o_query = sql`SELECT * FROM Order_Logs
    ORDER BY log_timestamp DESC `
  const m_query = sql`SELECT * FROM Menu_Logs
    ORDER BY log_timestamp DESC `

  const qs = [e_query, o_query, m_query]
  const entityName = ['USER_EMPLOYEE', 'ORDER', 'MENU']
  const resps = await Promise.all(qs.map(runQuery))
  const result = resps.map((promptResult, idx) => {
    const col_names = promptResult?.metaData.map((col) => col.name)
    const rows = promptResult?.rows.map((row) => {
      const row_ = row.reduce((acc, cur, index) => {
        acc[col_names[index]] = cur
        return acc
      }, {})
      return { TABLE: entityName[idx], ...row_ }
    })
    return rows
  })
  res.json(result)
})
// LOGIN ROUTE

app.post('/login', async (req, res) => {
  const { username, password } = req.body
  console.log('hello')
  const query = sql`select * from User_Employee where username = ${username}`
  const promptResult = await runQuery(query)
  const col_names = promptResult?.metaData.map((col) => col.name)
  const rows = promptResult?.rows.map((row) => {
    return row.reduce((acc, cur, index) => {
      acc[col_names[index]] = cur
      return acc
    }, {})
  })
  if (rows == null || rows.length == 0) {
    res.json({ success: false, message: 'Login failed' })
    return
  }
  const user = rows[0]
  const isPasswordMatch = await bcrypt.compare(password, user.PASSWORD)
  console.log(JSON.stringify(isPasswordMatch))
  console.log(JSON.stringify(user))
  console.log({
    success: true,
    message: 'Login successful',
    isadmin: user['ISADMIN'] == 'T',
    userid: user['USERID'],
  })
  if (isPasswordMatch) {
    res.json({
      success: true,
      message: 'Login successful',
      isadmin: user['ISADMIN'] == 'T',
      userid: user['USERID'],
    })
  } else {
    res.json({ success: false, message: 'Login failed' })
  }
})
// EMPLOYEE ROUTES

app.get('/employee', async (req, res) => {
  // JSON_OBJECT('ID'ISEMPLOYEE_ID,'FIRSTNAME'ISFIRST_NAME,'LASTNAME'ISLAST_NAME)
  // const promptResult = await runQuery(sql`select JSON_OBJECT('ID' IS userid,'USERNAME' IS username,'IS_ADMIN' IS isadmin,'NAME' IS name,'POSITION' IS position,'PHONE' IS contact_information,'SALARY' IS salary) from User_Employee`)
  const promptResult = await runQuery(sql`select * from User_Employee`)
  // convert prompt result to json

  const col_names = promptResult?.metaData.map((col) => col.name)
  const rows = promptResult?.rows.map((row) => {
    return row.reduce((acc, cur, index) => {
      acc[col_names[index]] = cur
      return acc
    }, {})
  })
  res.json(rows)
})
app.get('/employee/:id', async (req, res) => {
  const query = sql`select * from User_Employee where userid = ${req.params.id}`
  const promptResult = await runQuery(query)
  const col_names = promptResult?.metaData.map((col) => col.name)
  const rows = promptResult?.rows.map((row) => {
    return row.reduce((acc, cur, index) => {
      acc[col_names[index]] = cur
      return acc
    }, {})
  })

  res.json(rows)
})
app.delete('/employee/:id', async (req, res) => {
  const employeeId = req.params.id;
  console.log(`Attempting to delete employee with ID: ${employeeId}`);

  try {
    // Begin a transaction
    await runQuery(sql`BEGIN`);

    // Delete records in dependent tables first to avoid foreign key constraints
    const deleteMenuManagementQuery = sql`DELETE FROM menu_management WHERE USER_EMPLOYEE_USERID = ${employeeId}`;
    await runQuery(deleteMenuManagementQuery);
    console.log(`Executed query: ${deleteMenuManagementQuery}`);

    const deleteOrdersQuery = sql`DELETE FROM Orders WHERE EMPLOYEEID = ${employeeId} OR USER_EMPLOYEE_USERID = ${employeeId}`;
    await runQuery(deleteOrdersQuery);
    console.log(`Executed query: ${deleteOrdersQuery}`);

    // Finally, delete the employee record
    const deleteUserEmployeeQuery = sql`DELETE FROM User_Employee WHERE userid = ${employeeId}`;
    await runQuery(deleteUserEmployeeQuery);
    console.log(`Executed query: ${deleteUserEmployeeQuery}`);

    // Commit the transaction
    await runQuery(sql`COMMIT`);
    res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    // Rollback the transaction in case of error
    await runQuery(sql`ROLLBACK`);
    console.error(err);
    res.status(500).json({ message: 'Error deleting employee', error: err });
  }
});


app.post('/employee', async (req, res) => {
  try {
    const {
      username,
      isadmin,
      name,
      position,
      contact_information,
      salary,
      password,
    } = req.body
    const encryptedPassword = await bcrypt.hash(password, 10)
    const employee_id = nanoid()
    const promptResult = await runQuery(
      `insert into User_Employee (userid,username,password,isadmin,name,position,contact_information,salary) values ('${employee_id}','${username}','${encryptedPassword}','${isadmin}','${name}','${position}','${contact_information}','${salary}')`
    )
    res.json(promptResult?.rows)
  } catch (err) {
    res.status(400).send(err)
  }
})
app.put('/employee/:id', async (req, res) => {
  console.log(JSON.stringify(req.body))

  try {
    const {
      username,
      isadmin,
      name,
      position,
      contact_information,
      salary,
      password,
    } = req.body
    const query = sql`update User_Employee set username = ${username}, isadmin = ${isadmin}, name = ${name}, position = ${position}, contact_information = ${contact_information}, salary = ${salary}, password = ${password} where userid = ${req.params.id}`
    const promptResult = await runQuery(query)
    res.json({ message: 'Employee updated successfully' })
  } catch (err) {
    res.json({ message: 'Employee not found/updated' })
  }
})

// CUSTOMER ROUTES

// GET ALL CUSTOMERS
app.get('/customer', async (req, res) => {
  const query = sql`select * from customer`
  const promptResult = await runQuery(query)
  const col_names = promptResult?.metaData.map((col) => col.name)
  const rows = promptResult?.rows.map((row) => {
    return row.reduce((acc, cur, index) => {
      acc[col_names[index]] = cur
      return acc
    }, {})
  })
  res.json(rows)
})

// GET CUSTOMER BY ID

app.get('/customer/:id', async (req, res) => {
  const query = sql`select * from customer where customerid = ${req.params.id}`
  const promptResult = await runQuery(query)
  const col_names = promptResult?.metaData.map((col) => col.name)
  const rows = promptResult?.rows.map((row) => {
    return row.reduce((acc, cur, index) => {
      acc[col_names[index]] = cur
      return acc
    }, {})
  })
  res.json(rows)
})
// CREATE CUSTOMER  (POST)
app.post('/customer', async (req, res) => {
  const { name, email, phone } = req.body
  const id = nanoid() // will be used to generate a unique id
  const promptResult = await runQuery(
    `insert into customer (customerid,name, email, contact_information) values ('${id}','${name}','${email}','${phone}')`
  )
  res.json(promptResult?.rows)
})
// UPDATE CUSTOMER (put)
app.put('/customer/:id', async (req, res) => {
  console.log('started lol')
  const { name, email, contact_information } = req.body
  const query = sql`update customer set name = ${name}, email = ${email}, contact_information = ${contact_information} where customerid = ${req.params.id}`
  const promptResult = await runQuery(query)
  res.json(promptResult?.rows)
})

// DELETE CUSTOMER (DELETE)
app.delete('/customer/:id', async (req, res) => {
  try {
    const query = sql`delete from customer where customerid = ${req.params.id}`
    const promptResult = await runQuery(query)
    res.json({ message: 'Customer deleted successfully' })
  } catch (err) {
    res.json({ message: 'Customer not found/deleted' })
  }
})

// MENU ROUTES

// GET ALL MENU
app.get('/menu', async (req, res) => {
  const query = sql`select * from menu`
  const promptResult = await runQuery(query)
  const col_names = promptResult?.metaData.map((col) => col.name)
  const rows = promptResult?.rows.map((row) => {
    return row.reduce((acc, cur, index) => {
      acc[col_names[index]] = cur
      return acc
    }, {})
  })
  res.json(rows)
})
// GET MENU ITEM BY ID
app.get('/menu/:id', async (req, res) => {
  console.log(req.params.id)
  const query = sql`select * from menu where itemid = ${req.params.id}`
  const promptResult = await runQuery(query)
  const col_names = promptResult?.metaData.map((col) => col.name)
  const rows = promptResult?.rows.map((row) => {
    return row.reduce((acc, cur, index) => {
      acc[col_names[index]] = cur
      return acc
    }, {})
  })
  res.json(rows)
})
// UPDATE MENU ITEM (put)
app.put('/menu/:id', async (req, res) => {
  const { itemname, price, description, category } = req.body
  const query = sql`update menu set itemname = ${itemname}, price = ${price} , description = ${description}, category = ${category} where itemid = ${req.params.id}`
  const promptResult = await runQuery(query)
  res.json(promptResult?.rows)
})
// DELETE MENU ITEM (DELETE)
app.delete('/menu/:id', async (req, res) => {
  try {
    const query = sql`delete from menu where itemid = ${req.params.id}`
    const promptResult = await runQuery(query)
    res.json({ message: 'Menu item deleted successfully' })
  } catch (err) {
    console.error(err)
    res.json({ message: 'Menu item not found/deleted' })
  }
})
// CREATE MENU ITEM (POST)
app.post('/menu', async (req, res) => {
  const { itemname, description, price, category } = req.body
  const id = nanoid() // will be used to generate a unique id
  const promptResult = await runQuery(
    `insert into menu (itemid,itemname, description, price, category) values ('${id}','${itemname}','${description}','${price}','${category}')`
  )
  res.json(promptResult?.rows)
})
// ORDER ROUTES

// GET ALL ORDERS
app.get('/order', async (req, res) => {
  const query = sql`select * from Orders`
  const promptResult = await runQuery(query)
  const col_names = promptResult?.metaData.map((col) => col.name)
  const rows =
    promptResult?.rows.map((row) => {
      return row.reduce((acc, cur, index) => {
        acc[col_names[index]] = cur
        return acc
      }, {})
    }) ?? []
  res.json(rows)
})
// GET ORDER BY ID
app.get('/order/:id', async (req, res) => {
  const query = sql`select * from Orders where orderid = ${req.params.id}`
  const promptResult = await runQuery(query)
  const col_names = promptResult?.metaData.map((col) => col.name)
  // get the menu items for the order
  // const query2 = sql`select * from orders inner join order_composition `
  const query2 = sql`select itemid,itemname, description, price, category from Order_Composition inner join menu on itemid=menu_itemid and order_orderid=${req.params.id}`
  // const query2 = sql`select * from Order_Composition`
  const promptResult2 = await runQuery(query2)
  const menu_items = promptResult2?.rows.map((row) => {
    const [itemid, itemname, description, price, category] = row
    return { itemid, itemname, description, price, category }
  })
  const order = promptResult?.rows.map((row) => {
    return row.reduce((acc, cur, index) => {
      acc[col_names[index]] = cur
      return acc
    }, {})
  })[0]
  order.menu_items = menu_items
  res.json(order)
})
// UPDATE ORDER (put)
app.put('/order/:id', async (req, res) => {
  console.log(JSON.stringify(req.body) + ' : ' + req.params.id)
  const {
    employeeid,
    customerid,
    tablenumber,
    orderdate,
    totalprice,
    menu_itemids,
  } = req.body
  const id = req.params.id
  const orderDateObj = new Date(orderdate)
  const formattedOrderDate = orderDateObj.toISOString().slice(0, 10) // Get date part in YYYY-MM-DD format

  const query1 = sql`delete from Order_Composition where order_orderid = ${req.params.id}`
  await runQuery(query1)
  await Promise.all(
    menu_itemids &&
      menu_itemids.map((item) => {
        const query2 = sql`insert into Order_Composition (order_orderid,menu_itemid) values (${id},${item})`
        return runQuery(query2)
      })
  )
  const query = sql`update Orders set employeeid = ${employeeid}, CUSTOMER_CUSTOMERID = ${customerid}, tablenumber = ${tablenumber}, orderdate = TO_DATE(${formattedOrderDate},'YYYY-MM-DD'), totalprice = ${totalprice} where orderid = ${req.params.id}`
  const promptResult = await runQuery(query)
  res.json(promptResult?.rows)
})

// POST ORDER (POST) CHECK if customer id exists
app.post('/order', async (req, res) => {
  try {
    const {
      employeeid,
      customerid,
      tablenumber,
      orderdate,
      totalprice,
      menu_itemids,
    } = req.body
    console.log(JSON.stringify(req.body))
    const basicquery = sql`select name from customer where customerid = ${customerid}`
    const result = await runQuery(basicquery)
    const customer_name = result?.rows[0][0]
    console.log(customer_name)
    const id = nanoid()
    const orderDateObj = new Date(orderdate)
    const formattedOrderDate = orderDateObj.toISOString().slice(0, 10) // Get date part in YYYY-MM-DD format

    console.log(formattedOrderDate)
    console.log(
      employeeid,
      customerid,
      tablenumber,
      orderdate,
      totalprice,
      menu_itemids
    )
    const query = sql`insert into Orders (orderid,employeeid,customername,tablenumber,orderdate,totalprice,customer_customerid) values (${id},${employeeid},${customer_name},${tablenumber},TO_DATE(${formattedOrderDate},'YYYY-MM-DD'),${totalprice},${customerid})`
    const promptResult = await runQuery(query)
    await Promise.all(
      menu_itemids &&
        menu_itemids.map((item) => {
          const query2 = sql`insert into Order_Composition (order_orderid,menu_itemid) values (${id},${item})`
          return runQuery(query2)
        })
    )
    res.json(promptResult?.rows)
  } catch (err) {
    res.status(400).send(err)
    console.log(err)
  }
})

app.delete('/order/:id', async (req, res) => {
  try {
    const query1 = sql`delete from Order_Composition where order_orderid = ${req.params.id}`
    const promptResult1 = await runQuery(query1)
    const query = sql`delete from Orders where orderid = ${req.params.id}`
    const promptResult = await runQuery(query)
    console.log('deleted')
    res.json({ message: 'Order deleted successfully' })
  } catch (err) {
    console.error(err)
    console.log('not deleted')
    res.json({ message: 'Order not found/deleted' })
  }
})

// AGGREGATE QUERIES

app.get('/mostboughtitems', async (req, res) => {
  const query = sql`SELECT m.itemname, o.menu_itemid, COUNT(*) as occurrence_count
    FROM order_composition o, menu m
    where m.itemid = o.menu_itemid
    GROUP BY menu_itemid, m.itemname
    ORDER BY occurrence_count DESC
    FETCH First 3 rows only
    `
  const promptResult = await runQuery(query)
  const col_names = promptResult?.metaData.map((col) => col.name)
  const rows = promptResult?.rows.map((row) => {
    return row.reduce((acc, cur, index) => {
      acc[col_names[index]] = cur
      return acc
    }, {})
  })
  res.json(rows)
})
app.get('/mostfrequentcustomers', async (req, res) => {
  const query = sql`SELECT c.name, o.customer_customerid, COUNT(*) as occurrence_count
    FROM orders o, customer c
    where c.customerid = o.customer_customerid
    GROUP BY customer_customerid, c.name
    ORDER BY occurrence_count DESC
    FETCH First 3 rows only
    `
  const promptResult = await runQuery(query)
  const col_names = promptResult?.metaData.map((col) => col.name)
  const rows = promptResult?.rows.map((row) => {
    return row.reduce((acc, cur, index) => {
      acc[col_names[index]] = cur
      return acc
    }, {})
  })
  res.json(rows)
})
app.get('/employeewithmostorders', async (req, res) => {
  const query = sql`SELECT e.name, o.employeeid, COUNT(*) as occurrence_count
    FROM orders o, user_employee e
    where e.userid = o.employeeid
    GROUP BY employeeid, e.name
    ORDER BY occurrence_count DESC
    FETCH First 1 rows only
    `
  const promptResult = await runQuery(query)
  const col_names = promptResult?.metaData.map((col) => col.name)
  const rows = promptResult?.rows.map((row) => {
    return row.reduce((acc, cur, index) => {
      acc[col_names[index]] = cur
      return acc
    }, {})
  })
  res.json(rows)
})
app.listen(5000, function () {
  console.log('listening on prt 5000')
})
