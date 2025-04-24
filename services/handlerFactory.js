const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiErrors");
const ApiFeatures = require("../utils/apiFeatures");

exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findByIdAndDelete(id);
    if (!document) {
      return next(new ApiError(`No brand for this id ${id}`, 404));
    }
    res.status(204).send();
  });

exports.updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!document) {
      return next(new ApiError(`No brand for this id ${req.params.id}`, 404));
    }
    res.status(200).json({ data: document });
  });

exports.creatOne = (Model, name) =>
    asyncHandler(async (req, res) => {
        if (name === "Product") {
           if (req.body.details && typeof req.body.details === "string") {
               try {
                   req.body.details = JSON.parse(req.body.details); // هنا نعمل parsing
               } catch (err) {
                   return res
                       .status(400)
                       .json({
                           message: "Invalid JSON format in details field",
                       });
               }
           }
        }
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

exports.getOne = (Model, name) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findById(id);

    if (!document) {
      return next(new ApiError(`No subCategory for this id ${id}`, 404));
    }
    res.status(200).json({ data: document });
  });

exports.getAll = (Model, modelName) =>
  asyncHandler(async (req, res) => {
    let filter = {};
    if (req.filterObj) {
      filter = req.filterObj;
    }
    //Buils query
    const documentsCounts = await Model.countDocuments();
    const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
      .paginate(documentsCounts)
      .filter()
      .search(modelName)
      .limitFields()
      .sort();
    //execute query
    const { mongooseQuery, paginationResult } = apiFeatures;
    const documents = await mongooseQuery;
    res
      .status(200)
      .json({ result: documents.length, paginationResult, data: documents });
  });
