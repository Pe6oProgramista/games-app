import { NextFunction, Request, Response } from "express";
import { asDict } from "./utils";

const flashFunctions: ((message: any) => void)[] = [
    function flashNotice(this: any, message) {
        this.cookie('notice', message, {encode: String});
    },
    
    function flashError(this: any, message) {
        this.cookie('error', message, {encode: String});
    },

    function flashWarning(this: any, message) {
        this.cookie('warning', message, {encode: String});
    },

    function flashInfo(this: any, message) {
        this.cookie('info', message, {encode: String});
    },

    function flashAlert(this: any, message) {
        this.cookie('alert', message, {encode: String});
    }
]

const flashMessagesTypes: string[] = flashFunctions.map(f => f.name);



function flashAll(req: Request, res: Response, next: NextFunction) {
    flashFunctions.forEach( (f) => asDict(res)[f.name] = f );
    next();
}

let a = {} as {[x:string]: any}

export {
    // notice error warning info alert    
    flashMessagesTypes,
    flashAll
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