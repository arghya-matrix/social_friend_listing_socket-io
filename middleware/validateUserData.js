const userServices = require("../services/user.services");

async function validateEmail(req, res, next) {
  const emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
//   console.log(req.body,"<==== Email Id");

  if (req.body.email_address) {
    const user = await userServices.findUser({
      email_address: req.body.email_address,
      user_name : req.body.user_name
    });
    
    // console.log(user, "<<====User data");
    if (user == null) {
      if (req.body.email_address.match(emailFormat)) {
        next();
      } else {
        return res.status(400).json({
          message: `Invalid email format`,
        });
      }
    } else {
      return res.status(409).json({
        message: `${req.body.email_address} already exist`,
      });
    }
  } else {
    return res.status(406).json({
      message: `Email address required to sign up`,
    });
  }
}

async function validateName(req, res, next) {
    const nameFormat = /^[A-Za-z]+(?: [A-Za-z]+)?(?: [A-Za-z]+)?$/;
    if(req.body.Name){
        if(req.body.Name.match(nameFormat)){
            next();
        }
        else{
            return res.status(400).json({
                message : `Invalid Name format`
            })
        }
    } else {
        return res.status(406).json({
            message : `Name is required field to sign up`
        })
    }
}

module.exports = {
    validateEmail,
    validateName
}