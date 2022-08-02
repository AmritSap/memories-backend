import mongoose from "mongoose";

const mongoClient = async () => {
  const conStr =
    process.env.NODE_ENV === "production"
      ? process.env.MONGO_CLIENT
      : process.env.MONGO_URL;

  try {
    await mongoose
      .connect(conStr, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
      })
      .then((con) => console.log(`MongoDb connected : ${con.connection.host}`))
      .catch((err) => console.log(err));
  } catch (error) {
    console.log(error);
  }
};

export default mongoClient;
