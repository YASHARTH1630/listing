module.exports = function asyncWrap(fn) {
    return function(req, res, next) {
        fn(req, res, next).catch((err) => { next(err); })
    }
}; //try & catch ka substitute , async ke problem ko handle k liye