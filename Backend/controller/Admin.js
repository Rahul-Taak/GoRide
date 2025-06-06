import { validationResult } from "express-validator";
import { query } from "../Database/db.js";
import md5 from "md5";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

dotenv.config();

// getAllAdmins ======================

export const getAllAdmins = async (req, res) => {
  try {
    const sql =
      "SELECT id, name, status, email, mobile, profile_pic FROM admins";
    const result = await query(sql);

    if (!result.length) {
      return res.status(404).json({
        code: 0,
        status: 404,
        message: "No admins found",
        total: 0,
        data: null,
      });
    }

    const backendUrl = process.env.FREE_BACKEND_URL || "http://localhost:5000";
    const adminsWithImage = result.map((admin) => ({
      ...admin,
      profile_pic_url: admin.profile_pic
        ? `${backendUrl}/uploads/admin/${admin.profile_pic}`
        : null,
    }));

    return res.status(200).json({
      code: 1,
      status: 200,
      message: "Admins fetched successfully",
      total: adminsWithImage.length,
      data: adminsWithImage,
    });
  } catch (err) {
    return res.status(500).json({
      code: 0,
      status: 500,
      message: "Internal Server Error",
      error: err.message,
      total: 0,
      data: null,
    });
  }
};

// loginAdmin ======================

export const loginAdmin = async (req, res) => {
  try {
    // Validations
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        code: 0,
        status: 400,
        message: errors.errors[0].msg,
        data: null,
      });
    }

    const { email, password } = req.body;
    const hashedPassword = md5(password);

    // Fetch admin details
    const sql =
      "SELECT id, name, status, email FROM admins WHERE email = ? AND password = ?";
    const result = await query(sql, [email, hashedPassword]);

    if (!result.length) {
      return res.status(401).json({
        code: 0,
        status: 401,
        message: "Invalid email or password",
        data: null,
      });
    }

    if (result[0].status === "Inactive") {
      return res.status(403).json({
        code: 0,
        status: 403,
        message:
          "Your account is Inactive. Please contact support.",
        data: null,
      });
    }

    if (result[0].status === "Deleted") {
      return res.status(403).json({
        code: 0,
        status: 403,
        message: "Your account has been Deleted.",
        data: null,
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: result[0].id, email: result[0].email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      code: 1,
      status: 200,
      message: "Successfully logged in",
      data: {
        token,
        admin: result[0],
      },
    });
  } catch (err) {
    return res.status(500).json({
      code: 0,
      status: 500,
      message: "Internal Server Error",
      error: err.message,
      data: null,
    });
  }
};

// signupAdmin ======================

export const signupAdmin = async (req, res) => {
  try {
    // Validations
    const errors = validationResult(req.body);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        code: 0,
        status: 400,
        message: errors.errors[0].msg,
        data: null,
      });
    }

    if (req.file === undefined) {
      return res.status(400).json({
        code: 0,
        status: 400,
        message: "Profile Picture is required",
        data: null,
      });
    }

    const { name, email, mobile, password } = req.body;
    const profilePic = req.file ? req.file.filename : null;

    // Check if email or mobile already exists
    const checkUserQuery =
      "SELECT email, mobile FROM admins WHERE email = ? OR mobile = ?";
    const existingUser = await query(checkUserQuery, [email, mobile]);

    if (existingUser.length > 0) {
      const existingEmail = existingUser.some((user) => user.email === email);
      const existingMobile = existingUser.some(
        (user) => user.mobile === mobile
      );

      return res.status(409).json({
        code: 0,
        status: 409,
        message:
          existingEmail && existingMobile
            ? "Email and Mobile number already exist. Please use different credentials."
            : existingEmail
            ? "Email already exists. Please use a different email."
            : "Mobile number already exists. Please use a different mobile number.",
        data: null,
      });
    }

    const hashedPassword = md5(password);

    // Insert new admin
    const sql =
      "INSERT INTO admins (`name`, `email`, `mobile`, `password`, `profile_pic`) VALUES (?, ?, ?, ?, ?)";
    const values = [name, email, mobile, hashedPassword, profilePic];
    const result = await query(sql, values);

    if (result.affectedRows > 0) {
      return res.status(201).json({
        code: 1,
        status: 201,
        message: "Admin registered successfully",
        data: {
          admin_id: result.insertId,
          profile_pic: profilePic ? `/uploads/admin/${profilePic}` : null,
        },
      });
    } else {
      return res.status(500).json({
        code: 0,
        status: 500,
        message: "Failed to register admin",
        data: null,
      });
    }
  } catch (err) {
    return res.status(500).json({
      code: 0,
      status: 500,
      message: "Internal Server Error",
      error: err.message,
      data: null,
    });
  }
};

// adminForgotPassword ======================

export const adminForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        code: 0,
        status: 400,
        message: "Please provide an email",
        data: null,
      });
    }

    // Check if admin email exists
    const checkEmailQuery = "SELECT id, email FROM admins WHERE email = ?";
    const [admin] = await query(checkEmailQuery, [email]);

    if (!admin) {
      return res.status(404).json({
        code: 0,
        status: 404,
        message: "Admin not found. Please register.",
        data: null,
      });
    }

    // Generate password reset token (valid for 10 minutes)
    const token = jwt.sign({ email }, process.env.JWT_SECRET_KEY, {
      expiresIn: "10m",
    });

    // Email transport setup
    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      auth: {
        user: process.env.MY_GMAIL,
        pass: process.env.MY_APP_PASSWORD,
      },
    });

    // Email template
    const mailOptions = {
      from: process.env.MY_GMAIL,
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="text-align: center; font-family: "Ubuntu", sans-serif;">
          <h2>Password Reset Request for <span style="color: #007bff">GoRide</span> Admin Panel</h2>
          <p>You requested a password reset. Click the button below to reset your password:</p>
          <a href="${process.env.FREE_FRONTEND_URL}/admin/reset-password/${token}" 
             style="display: inline-block; background-color: #007bff; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-size: 16px;">
             Reset Your Password
          </a>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      code: 1,
      status: 200,
      message: "Password reset link sent successfully to your email",
      // data: {
      //   token, // TODO: Only for debugging, remove in production
      // },
      data: null,
    });
  } catch (err) {
    return res.status(500).json({
      code: 0,
      status: 500,
      message: "Internal Server Error",
      error: err.message,
      data: null,
    });
  }
};

// adminResetPassword ======================

export const adminResetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Validations
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        code: 0,
        status: 400,
        message: errors.errors[0].msg,
        data: null,
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (error) {
      return res.status(401).json({
        code: 0,
        status: 401,
        message: "Invalid or expired token",
        data: null,
      });
    }

    const { email } = decoded;

    // Check if admin exists
    const getUserQuery = "SELECT id FROM admins WHERE email = ?";
    const [admin] = await query(getUserQuery, [email]);

    if (!admin) {
      return res.status(404).json({
        code: 0,
        status: 404,
        message: "Admin not found",
        data: null,
      });
    }

    // Hash new password
    const hashedPassword = md5(password);

    // Update password
    const updatePassQuery = "UPDATE admins SET password = ? WHERE email = ?";
    const result = await query(updatePassQuery, [hashedPassword, email]);

    if (result.affectedRows > 0) {
      return res.status(200).json({
        code: 1,
        status: 200,
        message: "Password reset successfully",
        data: null,
      });
    } else {
      return res.status(500).json({
        code: 0,
        status: 500,
        message: "Failed to reset password",
        data: null,
      });
    }
  } catch (err) {
    return res.status(500).json({
      code: 0,
      status: 500,
      message: "Something went wrong",
      error: err.message,
      data: null,
    });
  }
};

// getCustomerProfile =======================

export const getCustomerProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const sql =
      "SELECT id, name, status, email, mobile, created_at, updated_at FROM customers WHERE id = ?";
    const result = await query(sql, [id]);

    if (result.length > 0) {
      return res.status(200).json({
        code: 1,
        status: 200,
        message: "Customer Details fetched successfully",
        total: result.length,
        data: result,
      });
    } else {
      return res.status(404).json({
        code: 0,
        status: 404,
        message: "No customer found",
        total: 0,
        data: null,
      });
    }
  } catch (err) {
    return res.status(500).json({
      code: 0,
      status: 500,
      message: "Internal Server Error",
      error: err.message,
      data: null,
    });
  }
};

// updateCustomerProfile ====================================

export const updateCustomerProfile = async (req, res) => {
  try {
    const { id, name, email, mobile, status } = req.body;

    const sql =
      "UPDATE customers SET name = ?, email = ?, mobile = ?, status = ? WHERE id = ?";
    const result = await query(sql, [name, email, mobile, status, id]);

    if (result.affectedRows > 0) {
      return res.status(200).json({
        code: 1,
        status: 200,
        message: "Customer Updated successfully",
        data: null,
      });
    } else {
      return res.status(404).json({
        code: 0,
        status: 404,
        message: "No customer found",
        data: null,
      });
    }
  } catch (err) {
    return res.status(500).json({
      code: 0,
      status: 500,
      message: "Internal Server Error",
      error: err.message,
      data: null,
    });
  }
};

// getDriverProfile =======================

export const getDriverProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const sql =
      "SELECT id, first_name, last_name, status, email, mobile, gender, created_at, updated_at FROM drivers WHERE id = ?";
    const result = await query(sql, [id]);

    if (result.length > 0) {
      return res.status(200).json({
        code: 1,
        status: 200,
        message: "Driver Details fetched successfully",
        total: result.length,
        data: result,
      });
    } else {
      return res.status(404).json({
        code: 0,
        status: 404,
        message: "No driver found",
        total: 0,
        data: null,
      });
    }
  } catch (err) {
    return res.status(500).json({
      code: 0,
      status: 500,
      message: "Internal Server Error",
      error: err.message,
      data: null,
    });
  }
};

// updateDriverProfile ====================================

export const updateDriverProfile = async (req, res) => {
  try {
    const { id, first_name, last_name, email, mobile, status, gender } =
      req.body;

    const sql =
      "UPDATE drivers SET first_name = ?, last_name = ?, email = ?, mobile = ?, status = ?, gender = ? WHERE id = ?";
    const result = await query(sql, [
      first_name,
      last_name,
      email,
      mobile,
      status,
      gender,
      id,
    ]);

    if (result.affectedRows > 0) {
      return res.status(200).json({
        code: 1,
        status: 200,
        message: "Driver Updated successfully",
        data: null,
      });
    } else {
      return res.status(404).json({
        code: 0,
        status: 404,
        message: "No drivers found",
        data: null,
      });
    }
  } catch (err) {
    return res.status(500).json({
      code: 0,
      status: 500,
      message: "Internal Server Error",
      error: err.message,
      data: null,
    });
  }
};

// getTeamProfile =======================

export const getTeamProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const sql =
      "SELECT id, name, status, email, mobile, created_at, updated_at FROM admins WHERE id = ?";
    const result = await query(sql, [id]);

    if (result.length > 0) {
      return res.status(200).json({
        code: 1,
        status: 200,
        message: "Team member Details fetched successfully",
        total: result.length,
        data: result,
      });
    } else {
      return res.status(404).json({
        code: 0,
        status: 404,
        message: "No team member found",
        total: 0,
        data: null,
      });
    }
  } catch (err) {
    return res.status(500).json({
      code: 0,
      status: 500,
      message: "Internal Server Error",
      error: err.message,
      data: null,
    });
  }
};

// updateTeamProfile ====================================

export const updateTeamProfile = async (req, res) => {
  try {
    const { id, name, email, mobile, status } = req.body;

    const sql =
      "UPDATE admins SET name = ?, email = ?, mobile = ?, status = ? WHERE id = ?";
    const result = await query(sql, [name, email, mobile, status, id]);

    if (result.affectedRows > 0) {
      return res.status(200).json({
        code: 1,
        status: 200,
        message: "Team member Updated successfully",
        data: null,
      });
    } else {
      return res.status(404).json({
        code: 0,
        status: 404,
        message: "No team member found",
        data: null,
      });
    }
  } catch (err) {
    return res.status(500).json({
      code: 0,
      status: 500,
      message: "Internal Server Error",
      error: err.message,
      data: null,
    });
  }
};
