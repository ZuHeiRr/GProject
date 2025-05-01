const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiErrors");
const ApiFeatures = require("../utils/apiFeatures");
const productModel = require("../models/productModel");

exports.deleteOne = (Model) =>
    asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const document = await Model.findByIdAndDelete(id);
        if (!document) {
            return next(new ApiError(`No document  for this id ${id}`, 404));
        }
        res.status(204).send();
    });

exports.updateOne = (Model) =>
    asyncHandler(async (req, res, next) => {
        const document = await Model.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
            }
        );
        if (!document) {
            return next(
                new ApiError(`No document  for this id ${req.params.id}`, 404)
            );
        }
        res.status(200).json({ data: document });
    });

exports.creatOne = (Model, name) =>
    asyncHandler(async (req, res) => {
        // ✅ لو الموديل هو Product
        if (name === "Product") {
            if (!req.body.user) {
                req.body.user = req.user; // إضافة الـ user ID من الـ JWT
            }
            if (req.body.details && typeof req.body.details === "string") {
                try {
                    // ✅ نحول details من string إلى object
                    req.body.details = JSON.parse(req.body.details);
                } catch (err) {
                    return res.status(400).json({
                        status: "error",
                        message: "Invalid JSON in details field",
                    });
                }
            }
        }

        // ✅ إنشاء المستند
        const document = await Model.create(req.body);
        res.status(201).json({ data: document });
    });
// exports.creatOne = (Model, name) =>
//   asyncHandler(async (req, res) => {
//     if (name === "product") {
//       const token = req.headers.authorization.split(" ")[1];
//       if (!token) {
//         return res.status(401).json({ msg: "No token provided" });
//       }

//       const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
//       if (!decoded.id) {
//         return res.status(401).json({ msg: "Invalid token" });
//       }

//       // أضف الـ user ID إلى جسم الطلب
//       req.body.user = decoded.id;
//     }

//     const document = await Model.create(req.body);
//     res.status(201).json({ data: document });
//   });

exports.getOne = (Model) =>
    asyncHandler(async (req, res, next) => {
        const { id } = req.params;

        // 🟢 بناء الكويري
        let query = Model.findById(id);

        // ✅ لو الموديل Product نضيف populate للـ user
        if (Model.modelName === "Product") {
            query = query.populate({
                path: "user",
                select: "name phone profileImg _id",
            });
        }
        const document = await query;

        if (!document) {
            return next(new ApiError(`No document  for this id ${id}`, 404));
        }
        res.status(200).json({ data: document });
    });

exports.getAll = (Model, modelName) =>
    asyncHandler(async (req, res) => {
        let filter = {};
        if (req.filterObj) {
            filter = req.filterObj;
        }
        //  فلترة إضافية لو الموديل هو Product
        if (Model.modelName === "Product" && req.query.user) {
            if (!mongoose.isValidObjectId(req.query.user)) {
                return res
                    .status(400)
                    .json({ success: false, message: "Invalid user ID" });
            }
            filter.user = req.query.user;
        }
        //Buils query
        const documentsCounts = await Model.countDocuments();

        const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
            .paginate(documentsCounts)
            .filter()
            .search(modelName)
            .limitFields()
            .sort();
        // ✅ إضافة populate فقط لو الموديل هو Product
        if (Model.modelName === "Product") {
            apiFeatures.mongooseQuery = apiFeatures.mongooseQuery.populate({
                path: "user",
                select: "name phone profileImg _id",
            });
        }
        //execute query
        const { mongooseQuery, paginationResult } = apiFeatures;
        const documents = await mongooseQuery;
        res.status(200).json({
            result: documents.length,
            paginationResult,
            data: documents,
        });
    });
