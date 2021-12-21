var flashFunctions = [
    function flashNotice(message) {
        this.cookie('notice', message, {encode: String});
    },
    
    function flashError(message) {
        this.cookie('error', message, {encode: String});
    },

    function flashWarning(message) {
        this.cookie('warning', message, {encode: String});
    },

    function flashInfo(message) {
        this.cookie('info', message, {encode: String});
    },

    function flashAlert(message) {
        this.cookie('alert', message, {encode: String});
    }
]

module.exports = {
    // notice error warning info alert    
    flashMessagesTypes: flashFunctions.map(f => f.name),

    flashAll(req, res, next) {
        flashFunctions.forEach( (f) => res[f.name] = f );
        next();
    }
}


// var connectFlash = require('connect-flash')();

// /**
//  * Return a middleware function
//  *
//  * @return {Function} middleware function
//  * @api public
//  */
// exports = module.exports = function () {

//   return function (req, res, next) {
//     connectFlash(req, res, function () {
//       // Proxy the render function so that the flash is
//       // retrieved right before the render function is executed
//       var render = res.render;
//       res.render = function () {
//         // attach flash messages to res.locals.messages
//         res.locals.messages = req.flash();
//         render.apply(res, arguments);
//       }
//       next();
//     })
//   };

// };




// for layout .ejs file
// <% if (flashMessages.success) { %>
//     <div class="flash success"><%= flashMessages.success %></div>
//     <% } else if (flashMessages.error) { %>
//     <div class="flash error"><%= flashMessages.error %></div>
// <% } %>