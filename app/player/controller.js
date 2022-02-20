const Player = require("./model");
const Voucher = require("../voucher/model");
const Category = require("../category/model");
const Nominal = require("../nominal/model");
const Payment = require("../payment/model");
const Bank = require("../bank/model");
const Transaction = require("../transaction/model");
const path = require("path");
const fs = require("fs");
const config = require("../../config");
const cloudinary = require("../../helper/image-upload");

module.exports = {
  landingPage: async (req, res) => {
    try {
      const vouchers = await Voucher.find()
        .select("_id name status category thumbnail")
        .populate("category");

      res.status(200).json({ data: vouchers });
    } catch (error) {
      res
        .status(500)
        .json({ message: error.message || "Internal Server Error" });
    }
  },
  detailPage: async (req, res) => {
    try {
      const { id } = req.params;
      const vouchers = await Voucher.findOne({ _id: id })
        .populate("category")
        .populate("nominals")
        .populate("user", "_id name phoneNumber");

      const payment = await Payment.find().populate("banks");

      if (!vouchers) {
        return res
          .status(404)
          .json({ message: "Voucher game tidak ditemukan" });
      }

      res.status(200).json({
        data: {
          detail: vouchers,
          payment,
        },
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: error.message || "Internal Server Error" });
    }
  },
  category: async (req, res) => {
    try {
      const category = await Category.find();

      res.status(200).json({ data: category });
    } catch (error) {
      res
        .status(500)
        .json({ message: error.message || "Internal Server Error" });
    }
  },
  checkout: async (req, res) => {
    try {
      const { accountUser, name, nominal, voucher, payment, bank } = req.body;

      const res_voucher = await Voucher.findOne({ _id: voucher })
        .select("name category _id thumbnail user")
        .populate("category")
        .populate("user");

      if (!res_voucher)
        res.status(404).json({ message: "Voucher game tidak ditemukan." });

      const res_nominal = await Nominal.findOne({ _id: nominal });

      if (!res_nominal)
        res.status(404).json({ message: "Nominal tidak ditemukan." });

      const res_payment = await Payment.findOne({ _id: payment });

      if (!res_payment)
        res.status(404).json({ message: "Payment tidak ditemukan." });

      const res_bank = await Bank.findOne({ _id: bank });

      if (!res_bank) res.status(404).json({ message: "Bank tidak ditemukan." });

      const tax = (10 / 100) * res_nominal._doc.price;
      const value = res_nominal._doc.price - tax;

      const payload = {
        historyVoucherTopup: {
          gameName: res_voucher._doc.name,
          category: res_voucher._doc.category
            ? res_voucher._doc.category.name
            : "",
          thumbnail: res_voucher._doc.thumbnail,
          coinName: res_nominal._doc.coinName,
          coinQuantity: res_nominal._doc.coinQuantity,
          price: res_nominal._doc.price,
        },
        historyPayment: {
          name: res_bank._doc.name,
          type: res_payment._doc.type,
          bankName: res_bank._doc.bankName,
          accountNumber: res_bank._doc.accountNumber,
        },
        name: name,
        accountUser: accountUser,
        tax: tax,
        value: value,
        player: req.player._id,
        historyUser: {
          name: res_voucher._doc.user?.name,
          phoneNumber: res_voucher._doc.user?.phoneNumber,
        },
        category: res_voucher._doc.category?._id,
        user: res_voucher._doc.user?._id,
      };

      const transaction = new Transaction(payload);

      await transaction.save();

      res.status(201).json({ data: transaction });
    } catch (error) {
      res
        .status(500)
        .json({ message: error.message || "Internal Server Error" });
    }
  },
  history: async (req, res) => {
    try {
      const { status = "" } = req.query;

      let criteria = {};

      if (status.length) {
        criteria = {
          ...criteria,
          status: { $regex: `${status}`, $options: "i" },
        };
      }

      if (req.player._id) {
        criteria = {
          ...criteria,
          player: req.player._id,
        };
      }

      const histories = await Transaction.find(criteria);

      let total = await Transaction.aggregate([
        { $match: criteria },
        {
          $group: {
            _id: null,
            value: { $sum: "$value" },
          },
        },
      ]);

      res
        .status(200)
        .json({ data: histories, total: total.length ? total[0].value : 0 });
    } catch (error) {
      res
        .status(500)
        .json({ message: error.message || "Internal Server Error" });
    }
  },
  historyDetail: async (req, res) => {
    try {
      const { id } = req.params;

      const history = await Transaction.findOne({ _id: id });

      if (!history)
        res.status(404).json({ message: "history tidak ditemukan" });

      res.status(200).json({ data: history });
    } catch (error) {
      res
        .status(500)
        .json({ message: error.message || "Internal Server Error" });
    }
  },
  dashboard: async (req, res) => {
    try {
      const counts = await Transaction.aggregate([
        { $match: { player: req.player._id } },
        { $group: { _id: "$category", value: { $sum: "$value" } } },
      ]);

      const categories = await Category.find();

      categories.forEach((category) => {
        counts.forEach((count) => {
          if (count._id.toString() === category._id.toString()) {
            count.name = category.name;
          }
        });
      });

      const history = await Transaction.find({ player: req.player._id })
        .populate("category")
        .sort({ updateAt: -1 });

      res.status(200).json({ data: history, counts: counts });
    } catch (error) {
      res
        .status(500)
        .json({ message: error.message || "Internal Server Error" });
    }
  },
  profile: async (req, res) => {
    try {
      const player = {
        id: req.player._id,
        username: req.player.username,
        email: req.player.email,
        name: req.player.name,
        avatar: req.player.avatar,
        phone_number: req.player.phoneNumber,
      };

      res.status(200).json({ data: player });
    } catch (error) {
      res
        .status(500)
        .json({ message: error.message || "Internal Server Error" });
    }
  },
  editProfile: async (req, res, next) => {
    try {
      console.log("masuk sini");
      const { name = "", phoneNumber = "" } = req.body;

      const payload = {};

      if (name.length) payload.name = name;
      if (phoneNumber.length) payload.phoneNumber = phoneNumber;

      if (req.file) {
        let player = await Player.findOne({ _id: req.player._id });

        let currentImageLocal = `${config.rootPath}/public/uploads/${player.avatar}`;
        if (fs.existsSync(currentImageLocal)) {
          fs.unlinkSync(currentImageLocal);
        }
        console.log("currentImageLocal", currentImageLocal);

        if (player.avatar && player.avatar.includes("cloudinary")) {
          const splittedImagePath = player.avatar.split("/");
          const originalPublicId =
            splittedImagePath[splittedImagePath.length - 1];
          const publicId = originalPublicId.split(".")[0];
          
          const destroyImageResult = await cloudinary.uploader.destroy(
            publicId
          );
        }
        
        const uploadResult = await cloudinary.uploader.upload(req.file.path);

        player = await Player.findOneAndUpdate(
          { _id: req.player._id },
          {
            ...payload,
            avatar: uploadResult.url,
          },
          { new: true, runValidators: true }
        );

        res.status(201).json({
          data: {
            id: player._id,
            name: player.name,
            phoneNumber: player.phoneNumber,
            avatar: player.avatar,
          },
        });
      } else {
        const player = await Player.findOneAndUpdate(
          { _id: req.player._id },
          payload,
          { new: true, runValidators: true }
        );

        res.status(201).json({
          data: {
            id: player._id,
            name: player.name,
            phoneNumber: player.phoneNumber,
            avatar: player.avatar,
          },
        });
      }
    } catch (error) {
      if (error && error.name === "ValidationError") {
        res.status(422).json({
          error: 1,
          message: error.message,
          fields: error.fields,
        });
      }
    }
  },
};
