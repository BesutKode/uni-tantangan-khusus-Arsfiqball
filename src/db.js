var mongoose = require('mongoose');
mongoose.Promise = Promise;

exports.connect = () => {
  return mongoose.connect(process.env.MONGODB_CONNECTION || 'mongodb://localhost:27017/besutkode');
};

exports.disconnect = () => {
  return mongoose.disconnect();
};

var DataCreditSchema = new mongoose.Schema({
  contrib: String,
  origin: String,
  name: String,
  timestamp: Date
});

exports.DataCreditSchema = DataCreditSchema;

var DataCreditModel = mongoose.model('DataCredit', DataCreditSchema);

exports.DataCreditModel = DataCreditModel;
