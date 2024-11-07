const userModel = require("../models/userModel");
const mongoose = require("mongoose");
const productModel = require('../models/productModel')
const WareHouseModel = require('../models/wareHouseModel')
const orderModel = require('../models/orderModel')
const { isValid } = require('../validators')

const AdminLogin = async (req, res) => {
  // function associated with admin login
  try {
    const check = await userModel.findOne({ $or: [{ email }, { phoneNumber }] });
    if (!check) return res.status(400).send({ status: false, message: "Please provide correct credentials" }) // here check if the user is not present for the given credentials 

    const passCompare = await bcrypt.compare(password, check.password)     // brcypt compare is used for password matching
    if (!passCompare) return res.status(400).send({ status: false, message: "please provide correct credentials" })
    else { // token is generated
        const token = jwt.sign({ userId: check._id.toString(), password: password }, "Secret key", { expiresIn: "5hr" })
        return res.status(200).send({ status: true, message: "User Login Successfull", data: { userId: check._id, token: token } })
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const userList = async (req, res) => {
  // user list api is for admin
  try {
    const { firstName, lastName, email, phoneNumber } = req.query;

    // Build a dynamic filter object based on query parameters
    const filter = {};

    if (firstName) {
      filter.firstName = { $regex: firstName, $options: "i" }; 
    }
    if (lastName) {
      filter.lastName = { $regex: lastName, $options: "i" };
    }
    if (email) {
      filter.email = { $regex: email, $options: "i" };
    }
    if (phoneNumber) {
      filter.phoneNumber = { $regex: phoneNumber, $options: "i" };
    }

    // Find users with the specified filter
    const users = await userModel.find(filter).select("-password"); 

    // Check if any users were found
    if (!users.length) {
      return res.status(404).send({ status: false, message: "No users found" });
    }
    return res
      .status(200)
      .send({
        status: true,
        message: "Users retrieved successfully",
        data: users,
        count: users.length
      });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const statusUpdateByAdmin = async (req, res) => {
  // this function is for status update of user by admin only
  try {
     await userModel.updateOne(
      { _id: new mongoose.Types.ObjectId(req.body.userId) },
      { $set: { status: req.body.status } }
    );
    return res
      .status(201)
      .send({
        status: true,
        message: "Status Updated Successfully",
      });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const approveAndRejectOrder = async (req, res) => {
    // this function is for order approve and reject by admin only
    try {
       await orderModel.updateOne(
        { _id: new mongoose.Types.ObjectId(req.body.orderId) },
        { $set: { status: req.body.status } }
      );
      return res
        .status(201)
        .send({
          status: true,
          message: "Status Updated Successfully",
        });
    } catch (error) {
      return res.status(500).send({ status: false, message: error.message });
    }
  };

  const createOrder = async (req, res) => {
    // This function is for creating the order according to the warehouse and the condition given
    try {
        const { userId, productIds } = req.body;
        let validProducts =[]
        for (const productId of productIds) {
            const product = await productModel.findById(productId);
           const warehouse = await WareHouseModel.find({productIds:{$in : [new mongoose.Types.ObjectId(productId)] }}) // Check the distance through warehouse where product is stored
            if (!product) {
                return res.status(404).send({ status: false, message: `Product with ID ${productId} not found` });
            }

            if (!product.inStock) {
                return res.status(400).send({ status: false, message: `Product with ID ${productId} is out of stock` });
            }
            if (!warehouse.length) {
                return res.status(400).send({ status: false, message: `Product with ID ${productId} is not available in any warehouse` });
            }

            // Check if all warehouses for the product have a location greater than 10
            const allOutOfRange = warehouse.every(warehouse => warehouse.location > 10);    // default taken 10 ; but dynamice value here can be taken through user also
            if (allOutOfRange) {
                return res.status(400).send({ status: false, message: `Product with ID ${productId} is not within range` });
            }

            validProducts.push(new mongoose.Types.ObjectId(productId));
        }
        // Check if there are any valid products to add to the order
        if (validProducts.length === 0) {
            return res.status(400).send({ status: false, message: "No products available within stock and range requirements" });
        }

        // Create the order with valid products
        const newOrder = await orderModel.create({
            userId,
            productIds: validProducts,
        });
        return res.status(201).send({ status: true, message: "Success", data: newOrder })
            }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const createWarehouse = async (req, res) => {
  // Function associated with wareHouse creation with the products given 
    try {
        let data = req.body
        let { name, productIds , location} = data
        if (Object.keys(data).length == 0) {
            return res.status(400).send({ Status: false, message: "Please enter data to create product" })
        }
        //title
        if (!name) { 
            return res.status(400).send({ status: false, message: "Please enter Title" })
        }
        if (!isValid(name)) {
            return res.status(400).send({ status: false, message: "Please enter valid title" })
        }
        let nameInLowerCase= name.toLowerCase()
        let validProducts =[]
        for (const productId of productIds) {
            const product = await productModel.findById(productId);

            if (!product) {
                return res.status(404).send({ status: false, message: `Product with ID ${productId} not found` });
            }
            validProducts.push(new mongoose.Types.ObjectId(productId));
        }
        let WareHouseCreated = await WareHouseModel.create({
            name :nameInLowerCase ,
            productIds :validProducts ,
            location : location
        })
        return res.status(201).send({ status: true, message: "Success", data: WareHouseCreated })

    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { AdminLogin, userList ,statusUpdateByAdmin ,approveAndRejectOrder ,createOrder , createWarehouse};
