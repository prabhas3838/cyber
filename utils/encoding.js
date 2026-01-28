exports.encodeBase64 = (data) => {
    return Buffer.from(data).toString("base64");
  };
  
  exports.decodeBase64 = (data) => {
    return Buffer.from(data, "base64").toString("utf8");
  };
  