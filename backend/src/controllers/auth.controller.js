const express = require("express");
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken');
const User = require("../models/user.model");

const register = async (req, res, next) => {
  try {
    console.log(req.body);
    const {name, email, password} = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        sucess: false,
        message: "all fileds required"
      });
    }

    const existingUser = await User.find({email});
    if (!existingUser) {
      return res.status(400).json({
        message: "User already Exists",
      });
    }

    const hashedPswd = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPswd,
    });

    res.status(200).json({
      success: true,
      message: "User Registered",
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("All fields required");
    }

    const user = await User.findOne({email});
    if (!user) {
      res.status(400);
      throw new Error("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400);
      throw new Error("invalid Credentials");
    }

    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {
      expiresIn: "1d"
    });
    res.status(200).json({
      success: true,
      token,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {register, login};