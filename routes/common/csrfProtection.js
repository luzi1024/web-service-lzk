var csrf = require('csurf') 
var csrfProtection = csrf({ cookie: true,ignoreMethods:['GET', 'HEAD', 'OPTIONS'] })


module.exports = csrfProtection;
