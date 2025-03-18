import mongoose, { Schema, Document, Connection } from "mongoose";

const dbUriData = process.env.MONGO_URI_DATA || "";

const dataDbConnection: Connection = mongoose.createConnection(dbUriData);

dataDbConnection.once("open", () => console.log("Connected to Data MongoDB"));
dataDbConnection.on("error", (err) =>
  console.log("Data MongoDB connection error:", err)
);

export interface IData extends Document {
  miner_key: string;
  status: string;
  deviceDataString: object;
  timestamp: Date;
}

const DataSchema: Schema = new Schema({
  miner_key: { type: String, required: true },
  status: { type: String, required: true },
  deviceDataString: Object,
  timestamp: { type: Date, default: Date.now },
});

export const getCollectionByMinerKey = async (minerKey: string) => {
  const prefix = minerKey.split("-")[0]; // Assume prefix is before the first "-"
  return dataDbConnection.model<IData>(`${prefix}_data`, DataSchema); // Use prefix in the collection name
};

// export default dataDbConnection.model<IData>("Data", DataSchema);
