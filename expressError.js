class ExpressError extends Error {// error ko handle krne k liye classic way 
    constructor(status, message) {
        super();
        this.status = status;
        this.message = message;
    }
}
module.exports = ExpressError;