const mongoose = require('mongoose');

const { Schema } = mongoose;

const rewardSchema = new Schema({
  name: String,
  quantity: Number,
});

const easyRewardSchema = new Schema(rewardSchema);
const mediumRewardSchema = new Schema(rewardSchema);
const hardRewardSchema = new Schema(rewardSchema);

mongoose.model('EasyLevel', easyRewardSchema);
mongoose.model('MediumLevel', mediumRewardSchema);
mongoose.model('HardLevel', hardRewardSchema);
