/* eslint-disable */
/** Reset/create the development environment. */
const fs = require('fs');
const { ncp } = require('ncp');
const rmrf = require('rimraf');

const setup = () => {
	//	Refresh dev. directory.
	fs.mkdirSync('./dist');
	fs.mkdirSync('./dist/static');
	ncp('./static', './dist/static');
}

//	Maybe remove.
if (fs.existsSync('./dist')) rmrf('./dist', setup);
else setup();
