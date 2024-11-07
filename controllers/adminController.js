const userModel = require("../models/userModel");
const mongoose = require("mongoose");
const productModel = require('../models/productModel')
const WareHouseModel = require('../models/wareHouseModel')

const AdminLogin = async (req, res) => {
  try {
    const { email, phoneNumber, password } = req.body;
    const user = await userModel.findOne({ $or: [{ email }, { phoneNumber }] });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const userList = async (req, res) => {
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
    const users = await userModel.find(filter).select("password"); 

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
      });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const statusUpdateByAdmin = async (req, res) => {
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
          data: newOrder,
        });
    } catch (error) {
      return res.status(500).send({ status: false, message: error.message });
    }
  };

  const createOrder = async (req, res) => {
    try {
        const { userId, productIds } = req.body;
        let validProducts =[]
        for (const productId of productIds) {
            const product = await productModel.findById(productId);
           const warehouse = await WareHouseModel.find({productIds:{$in : [productId] }})
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
            const allOutOfRange = warehouse.every(warehouse => warehouse.location > 10);
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
        console.log(validProducts)
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
