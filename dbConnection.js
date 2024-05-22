import oracledb from 'oracledb'
oracledb.initOracleClient({
  libDir:
    'D:\\instantclient-basic-windows.x64-21.13.0.0.0dbru\\instantclient_21_13',
  // libDir: 'C:\\Users\\samad\\OneDrive\\Documents\\instantclient_21_13',
})
async function runQuery(prompt) {
  try {
    const connection = await oracledb.getConnection({
      user: 'b00092265',
      password: 'b00092265', // contains the hr schema password
      connectString:
        '(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=coeoracle.aus.edu)(PORT=1521))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=orcl)))',
    })

    const result = await connection.execute(prompt)
    const commit = await connection.execute(`COMMIT WORK`)

    await connection.close() // Always close connections
    return result
  } catch (err) {
    console.error(err)
  }
}

export default runQuery
