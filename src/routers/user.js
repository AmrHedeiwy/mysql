const db = require('../db/mysql')
const express = require('express')
const router = new express.Router()
const { sign_up, create_token, login } = require('../methods/method')
const jwt = require('jsonwebtoken')


const create_user = async (req, res) => {
  try {
    const { name, email, password, age} = req.body
    if(!name || !email || !password) {            // validate user entered in all fields
      throw new Error('you must fill in all the fields')
    }

    const result = await sign_up(name, email, password, age) // defined in methods/method.js file
    if(result.code ==='ER_DUP_ENTRY') throw new Error('email is used')  // checking for duplicate email error messages

    res.status(201).send('account created') // success message sent to user
  } catch(e) {
    res.status(401).send(e.message)
  }
}
const find_user = async(req, res) => {
  try {
  const { email, password } = req.body
  if(!email || !password) {                  // validate the user typed email and password
    throw new Error('you must fill in all the fields')
  }

  const message = await login(email, password)  // defiend in methods/method.js file
  if(message.error) throw new Error(message.error)  

  res.set('Set-Cookie', `session=${message.token}`)  // setting cookie with token created for the user
  res.send(message.result)  // success message sent back to the user
} catch(e) {
  res.status(401).send(e.message)
}
}

router.post('/user/sign-up', create_user)
router.post('/user/login', find_user)



module.exports = router