/**
 * @author Hemant Juyal
 */

'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	/*imgCdnUrl = config.aws_cdn_endpoint*/
	//imgCdnUrl = "http://localhost:3000/images/upload/",  //@todo: we have to remove it later
	imgCdnUrl = "http://localhost:3000/images/upload/",
	imgCdnUrlLarge = "http://localhost:3000/images/640/",
	imgCdnUrlSmall = "http://localhost:3000/images/320/",
	imgCdnUrlXSmall = "http://localhost:3000/images/200/";

/**
 * Img Data Schema
 */
var ImgDataSchema = new Schema({
	created: {
		type: Date,
		default: Date.now
	},
	updated: {
		type: Date
	},
	title: {
		type: String,
		default: 'untitled',
		trim: true
	},
	description: {
		type: String,
		trim: true
	},
	imgContent: {
		type: Buffer
	},
	imgModeration:{
		type:Schema.Types.Mixed,
		default:{}
	},
	tipsId:{
		type:String
	},
	imgUrl:{
		type:String,
		default:imgCdnUrl,
		trim:true
	},
	imgUrlLarge: {
		type: String,
		default: imgCdnUrlLarge,
		trim: true
	},
	imgUrlSmall: {
		type: String,
		default: imgCdnUrlSmall,
		trim: true
	},
	imgUrlXSmall: {
		type:String,
		default:imgCdnUrlXSmall,
		trim:true
	},
	imgId: {
		type: String,
		index: {
			unique: true
		}
	},
	imgInfo: {
		type: Schema.Types.Mixed,
		trim: true
	},
	priority: {
		type: Number,
		default: Date.now
	}
});


var ImgData=module.exports=mongoose.model('ImgData', ImgDataSchema);