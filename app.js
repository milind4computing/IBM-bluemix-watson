var string = require('string'); 
var express 	= require('express'),
	app     	= express(),
	ibmbluemix 	= require('ibmbluemix'),
	config  	= {
		applicationRoute : "https://ibmhack-fashion.mybluemix.net",
		applicationId : "ed3954c8-b107-4959-a7f9-81b66882e564"
	};
var watson = require('watson-developer-cloud');
var fs = require('fs');
var formidable = require('formidable');
var VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');
var visual_recognition = watson.visual_recognition({
  api_key: '550b0f0393dd33f0dcf3ed02f024afbbdc187f3e',
  version: 'v3',
  version_date: '2016-05-20'
});
ibmbluemix.initialize(config);
var logger = ibmbluemix.getLogger();
app.get('/', function(req, res){
	res.sendfile('public/index.html');
});
app.get('/desktop', function(req, res){
	res.sendfile('public/desktop.html');
});
app.post('/uploadpic', function(req, result) {
	console.log('uploadpic');
	var form = new formidable.IncomingForm();
	form.keepExtensions = true;
    form.parse(req, function(err, fields, files) {
		var params = {
			image_file: fs.createReadStream(files.image.path)
		};
		visual_recognition.classify(params, function(err, res) {
		if (err)
			console.log(err);
		else 
		{
			console.log(JSON.stringify(res, null, 2));
			var results = [];
			for(var i=0;i<res.images[0].classifiers[0].classes.length;i++) { results.push(res.images[0].classifiers[0].classes[i].class);
			  console.log('got '+results.length+' labels from Watson');
			   }
			  if(!fields.mode) {
				  result.send(results);
			  } else {				
				result.send("<h2>Results from Watson</h2>"+results.join(', '));  
			  }
		  }
		});
    });
});
app.use(function(req, res, next) {
    req.logger = logger;
    next();
});
app.use(require('./lib/setup'));
var ibmconfig = ibmbluemix.getConfig();
logger.info('mbaas context root: '+ibmconfig.getContextRoot());
app.use(ibmconfig.getContextRoot(), require('./lib/staticfile'));
app.listen(ibmconfig.getPort());
logger.info('Server started at port: '+ibmconfig.getPort());