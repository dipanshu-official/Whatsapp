  const otpGenerator = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };  
  // Generates a 6-digit OTP
  // Returns a string representation of the OTP
  export default otpGenerator;  