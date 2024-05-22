# Bon Appétit - A CMP320 Project (Backend)

A full-stack restaurant management software built as a showcase for Database Systems at the American University of Sharjah.
Find the link to the front end here: https://github.com/TaufiqSyed/restaurant-app

---

**Features:**

- Create, read, update or delete orders
- Create, read, update or delete employees
- Create, read, update or delete customers
- Create, read, update or delete menu items
- View the employee of the month
- View the most frequent customers
- View the most popular menu items
- Full-site dark mode (using toggle)
- Restricted pages to only admins (Employees, Logs)
- Encrypted passwords (done on backend)
  ***
  **List of group members:**
- Taufiq Syed
- Samad Sayed
- Dheeman Gangopadhyay
- Chaitanya Narkedamilly
- Oussama Jamal

---

**List of technologies used:**

- Node.js
- Express
- Bcrypt (for password encryption)
- Oracle DB
- Oracle DB Node.js driver (to run Oracle DB on Node.js)

---

**Valid admin credentials:**
Username - taufiq22
Password - Pass123!

---

**Usage steps:**

1. Install the latest version of Node.js [LTS] (v20.12.2)
2. Clone this repository / download the zip file
3. Update the OracleDB file path in the `dbConnection.js` file. This must point to the `instantclient` for OracleDB, and must be installed if missing.
4. Open the project folder in terminal and run `npm install`
5. Run `npm start` to start the Express server
6. [Set-up the front end](https://github.com/code-crack0/database-backend)
7. Once everything is set-up, open `localhost:3000` on a web browser
