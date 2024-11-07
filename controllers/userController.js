const userModel = require("../models/userModel");
const { validName ,validPhone, validEmail , isValid } = require('../validators')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const productModel = require('../models/productModel')
const orderModel = require('../models/orderModel')
const mongoose = require("mongoose");

const signUpUser = async function (req, res) {
    // This function is associated with signup user api for creation of user 
  try {
    let data = req.body;
    let { firstName, lastName, email, phoneNumber, password } = data;
    console.log(data);
    if (Object.keys(data).length == 0)
      return res.status(400).send({ status: false, message: "enter the data" });

    //First Name
    if (!firstName)
      return res
        .status(400)
        .send({ status: false, message: "First Name is mandatory" });
    if (!validName(firstName))
      return res
        .status(400)
        .send({ status: false, message: "First Name can only take alphabets" });

    //Last Name
    if (!lastName)
      return res
        .status(400)
        .send({ status: false, message: "Last Name is mandatory" });
    if (!validName(lastName))
      return res
        .status(400)
        .send({ status: false, message: "Last Name can only take alphabets" });

    //Email
    if (!email)
      return res
        .status(400)
        .send({ status: false, message: "Email is mandatory" });
    if (!validEmail(email))
      return res
        .status(400)
        .send({ status: false, message: "Invalid Email Id" });
    let emailExist = await userModel.findOne({ email: email });
    if (emailExist)
      return res
        .status(400)
        .send({ status: false, message: "Email Id already exists" });

    //Phone
    if (!phoneNumber)
      return res
        .status(400)
        .send({ status: false, message: "Phone No is mandatory" });
    if (!validPhone(phoneNumber))
      return res
        .status(400)
        .send({ status: false, message: "Invalid Phone No" });
    let phoneExist = await userModel.findOne({ phoneNumber: phoneNumber });
    if (phoneExist)
      return res
        .status(400)
        .send({ status: false, message: "Phone No already exists" });

    //password
    if (!password)
      return res
        .status(400)
        .send({ status: false, message: "password is mandatory" });
   const hashPassword = await bcrypt.hash(password, 10);           // bcrypt is used for creating more secure password
   
    //Create User
    const createUser = await userModel.create({         // user is created with the  given fields
      firstName: firstName,
      lastName: lastName,
      email: email,
      phoneNumber: phoneNumber,
      password: hashPassword,
      status:'pending',
      role:'user'
    });
    return res.status(201).send({
      status: true,
      message: "User created Successfully",
      data: createUser,
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};


const logIn = async function (req, res) {
    // The fucntion is associated with login of the user and also creates a jwt token used for authentication
    try {
        const { email, phoneNumber, password } = req.body;
        const check = await userModel.findOne({ $or: [{ email }, { phoneNumber }] });
        if (!check) return res.status(400).send({ status: false, message: "Please provide correct credentials" }) // here check if the user is not present for the given credentials 
        if (!check && check.status !== 'approve') {               //implemented this check here as if the user status is not approved it cannot login 
            return res.status(403).json({ message: 'Access Denied' });
        }
        const passCompare = await bcrypt.compare(password, check.password)     // brcypt compare is used for password matching
        if (!passCompare) return res.status(400).send({ status: false, message: "please provide correct credentials" })
        else { // token is generated
            const token = jwt.sign({ userId: check._id.toString(), password: password }, "Secret key", { expiresIn: "5hr" })
            return res.status(200).send({ status: true, message: "User Login Successfull", data: { userId: check._id, token: token } })
        }
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

const createProduct = async (req, res) => {
     // The fucntion is associated with Product Creation
    try {
        let data = req.body
        let { title, inStock } = data
        if (Object.keys(data).length == 0) {
            return res.status(400).send({ Status: false, message: "Please enter data to create product" })
        }
        //title
        if (!title) { 
            return res.status(400).send({ status: false, message: "Please enter Title" })
        }
        if (!isValid(title)) {
            return res.status(400).send({ status: false, message: "Please enter valid title" })
        }
        let titleInLowerCase= title.toLowerCase()
       
        let productCreated = await productModel.create({    //product created
            title :titleInLowerCase ,
            inStock :inStock
        })
        return res.status(201).send({ status: true, message: "Success", data: productCreated })

    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const getDataOfProductAndUser = async (req, res) => {
     // The fucntion is associated with api for getting the data of user and product details wise 
    try {
        const data = await orderModel.aggregate([
            {
                $lookup: {
                    from: "users",    // lookup to get user details
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            // Unwind user array to treat it as a single object
            { $unwind: "$user" },
            // Lookup to get product details 
            {
                $lookup: {
                    from: "products", 
                    localField: "productIds", // Field in Order referring to productIds
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            // Project the desired fields
            {
                $project: {
                    _id: 1,
                    "user.firstName": 1,
                    "user.lastName": 1,
                    "user.email": 1,
                    products: {
                        $map: {
                            input: "$productDetails",
                            as: "product",
                            in: {
                                title: "$$product.title",
                                location: "$$product.location",
                                inStock: "$$product.inStock"
                            }
                        }
                }
            }
        }
 ]
       );

        if (!data || data.length === 0) {
            return res.status(404).send({ status: false, message: "No orders found" });
        }

        return res.status(200).send({ status: true, message: "Data fetched successfully", data });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};
module.exports = { signUpUser,logIn ,createProduct ,getDataOfProductAndUser };
