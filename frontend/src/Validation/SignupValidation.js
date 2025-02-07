function Validation(values) {
  let error = {};
  const email_pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const password_pattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  // Validations for Name ===============

  if (values.name === "") {
    error.name = "Name should not be empty";
  } else {
    error.name = "";
  }

  // Validations for Mobile ===============

  if (values.mobile === "") {
    error.mobile = "Mobile should not be empty";
  } else {
    error.mobile = "";
  }

  // Validations for Email ===============

  if (values.email === "") {
    error.email = "Email should not be empty";
  } else if (!email_pattern.test(values.email)) {
    error.email = "Email Didn't match";
  } else {
    error.email = "";
  }

  // Validations for Password ===============

  if (values.password === "") {
    error.password = "Password should not be empty";
  } else if (!password_pattern.test(values.password)) {
    error.password = "Password Didn't match the conditions";
  } else {
    error.password = "";
  }

  // Validations for Confirm Password ===============

  if (values.cpassword === "") {
    error.cpassword = "Confirm Password should not be empty";
  } else if (values.cpassword[0] != values.password[0]) {
    error.cpassword = "Password and Confirm password Didn't match";
  } else {
    error.cpassword = "";
  }

  return error;
}

export default Validation;
