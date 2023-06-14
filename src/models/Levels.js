const mongoose = require('mongoose');

const { Schema } = mongoose;

const levelSchema = new Schema({
  name: String,
  generalDesc: String,
  climate: String,
});

const easyLevelSchema = new Schema(levelSchema);
const mediumLevelSchema = new Schema(levelSchema);
const hardLevelSchema = new Schema(levelSchema);

mongoose.model('EasyLevel', easyLevelSchema);
mongoose.model('MediumLevel', mediumLevelSchema);
mongoose.model('HardLevel', hardLevelSchema);
