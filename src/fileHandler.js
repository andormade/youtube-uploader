const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const R = require('ramda');

const SUPPORTED_EXTENSIONS = ['.mov', '.mp4', '.flv', '.mpegps', '.wmv', '.avi', '.mpeg4'];

const isProperFile = function(file) {
	const ext = path.extname(file);

	return (
		SUPPORTED_EXTENSIONS.indexOf(ext) !== -1  &&
		path.basename(file, ext).split('|').length === 2
	);
};

const getAllVideos = function(path) {
	const files = [];
	fs.readdirSync(path).forEach(file => {
		if (isProperFile(file)) {
			files.push(file);
		}
	});
	return files;
};

module.exports.getVideosNotReady = function(path) {
	const allVideos = getAllVideos(path);
	const videosReady = module.exports.getVideosReadyToUpload(path);
	return R.difference(allVideos, videosReady);
};

module.exports.getVideosReadyToUpload = function(path) {
	const now = Date.now();
	const timeout = 180000;

	return getAllVideos(path).filter(file => {
		const mtime = fs.statSync(path + '/' + file).mtime.getTime();
		return mtime < (now - timeout);
	});
};

module.exports.parseVideoInfoFromFileName = function(file) {
	const ext = path.extname(file);
	const basename = path.basename(file, ext);
	const [title, tag] = basename.split('|');
	const tags = [
		...tag.split(','),
		...title.split(' ')
	];
	const md5 = crypto.createHash('md5');
	const hash = md5.update(basename).digest('hex');

	return {
		title       : title,
		tags        : tags,
		hash        : basename
	};
};
