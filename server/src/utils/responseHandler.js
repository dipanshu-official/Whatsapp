 export const responseHandler = (res, statusCode, message, data = null) => {

  if (!res) {
    console.error("Response object is not defined");
    return;
  }

  const resposeObject = {
    status: statusCode < 400 ? "success" : "error",
    message,
    data,
  };

  return res.status(statusCode).json(resposeObject);
  
};

export default responseHandler;