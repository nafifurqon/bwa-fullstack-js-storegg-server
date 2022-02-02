const Player = require("./model");
const Voucher = require("../voucher/model");
const Category = require("../category/model");
const Nominal = require("../nominal/model");
const Payment = require("../payment/model");
const Bank = require("../bank/model");
const Transaction = require("../transaction/model");

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

      if (!vouchers) {
        return res
          .status(404)
          .json({ message: "Voucher game tidak ditemukan" });
      }

      res.status(200).json({ data: vouchers });
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
};
