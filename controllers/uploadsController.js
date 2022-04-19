const path = require("path");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

// Ref - Working code for local image store
const uploadProductImageLocal = async (req, res) => {
  // check if file exists, format, size
  // console.log(req.files);
  if (!req.files) {
    throw new CustomError.BadRequestError("No File uploaded");
  }

  const productImage = req.files.image; // 'image' name from request

  if (!productImage.mimetype.startsWith("image")) {
    throw new CustomError.BadRequestError("Please Upload Image");
  }

  const maxSize = 1024 * 1024; // 1 MB

  if (productImage.size > maxSize) {
    throw new CustomError.BadRequestError(
      "Please upload image smaller than 1 MB"
    );
  }

  // define where we want image to be stored
  const imagePath = path.join(
    __dirname,
    "../public/uploads/" + `${productImage.name}`
  );

  // store image but here we store in our static folder.
  await productImage.mv(imagePath);

  // return image source
  return res
    .status(StatusCodes.OK)
    .json({ image: { src: `/uploads/${productImage.name}` } }); // structure driven by our front-end
};

// Cloudinary.  Still using express-fileupload to parse image file request and set up automatically a tmp directory where temporary image file is created (vs above or use of streams).  We can then access that file to be sent to Cloudinary.
const uploadProductImage = async (req, res) => {
  // console.log(req.files.image); // handled by express-fileupload and stored in tmp folder (instead of our static folder)

  const result = await cloudinary.uploader.upload(
    req.files.image.tempFilePath,
    {
      use_filename: true,
      folder: "file-upload-js-n",
    }
  );

  // clean up
  fs.unlinkSync(req.files.image.tempFilePath);

  return res.status(StatusCodes.OK).json({ image: { src: result.secure_url } });
};

module.exports = {
  uploadProductImage,
};
