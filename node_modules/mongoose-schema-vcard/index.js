'use strict';
/**
 * Dependencies
 * --------------------------------------------------------------------------*/

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var BasicStructuredSchema = new Schema({
  type: String,
  value: String
}, {_id: false});
var BasicStructuredSchemaTel = new Schema({
  type: String,
  value: String,
  opflg: String,
  prio: Number,
}, {_id: false});

var vCardSchema = new Schema({
  adr: [new Schema({
    type: String,
    value: [new Schema({
      country: String,
      zip_code: String,
      state: String,
      city: String,
      street: String,
      number: String,
      complement: String
      }, {_id: false})],
    }, {_id: false})],
  agent: String,
  anniversary: Date,
  bday: Date,
  caladruri: String,
  calurl: String,
  categories: [String],
  class: String,
  email: new Schema({
    type : String,
    value : String
  },{_id: false}),
  fburl: String,
  fn: String,
  ssnr:String,
  gender: { type: String, match: /M|F/ },
  geo: new Schema({
    latitude: Number,
    longitude: Number
  }, {_id: false}),
  impp: String,
  key: BasicStructuredSchema,
  label: BasicStructuredSchema,
  lang: String,
  logo: BasicStructuredSchema,
  n: new Schema({
    first: String,
    middle: String,
    last: String
  }, {_id: false}),
  note: String,
  org: String,
  photo: BasicStructuredSchema,
  tel: [BasicStructuredSchemaTel],
  role: String,
  title: String,
  url: String
}, {id: false});

module.exports = vCardSchema;
