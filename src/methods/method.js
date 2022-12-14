const db = require('../db/mysql')
const jwt = require('jsonwebtoken')


const sign_up = async(name, email, password, age) => {
    const sql = `INSERT INTO user_accounts (name, email, password, age) VALUES ('${name}', '${email}', '${password}', ${age});`   // setting up the sql statment to insert the new users data
    const result = await db.promise().query(sql).then((result) => { // inserting the data and storing response in result variable
        return result
    }).catch((err) => {
        return err
    })
    return result
}

const create_token = async(user_id, cb) => {
    const token = jwt.sign({ _id: user_id }, 'mysec')  // creating the new token
    const data = { token } // storing the toekn and user in object to concatinate them in an array
    const sql1 = `SELECT tokens FROM user_accounts WHERE user_id = '${user_id}'`  // sql statement to gather all the tokens from the user using their user_id

    var tokensArray = await db.promise().query(sql1).then((result) => {  // the tokens gathered from the database stored in tokensArray variable
        return JSON.parse(result[0][0].tokens)
    })
    tokensArray.push(data) // adding the new token 
    const sql2 = `UPDATE user_accounts SET tokens = '${JSON.stringify(tokensArray)}' WHERE user_id = '${user_id}'`  // setting up the sql syntax to store the updated token array to the databse

    const result = await db.promise().query(sql2)
    if(result[0].err) {   // error is checked if the database failed to save the data
        console.error(err.stack)
        return { error: 'an error occured, try logging in again' }
    }
    return { error: undefined, result: 'successfully logged in', token}

}

const login = async(email, password) => {
    const sql = `SELECT * FROM user_accounts WHERE email = '${email}' AND password = '${password}'` // sql statement to find user using the email and password entered

    const user = await db.promise().query(sql).then((result) => {
        return result[0]     
    })
    
    if(user.length === 0) {  // error check for invalid inputs
        return { error: 'email or password incorrect'}
    }
    
    const message = await create_token(user[0].user_id)
    return message
}

module.exports = {
    sign_up,
    create_token,
    login
}