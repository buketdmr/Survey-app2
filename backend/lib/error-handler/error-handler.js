module.exports = {
  wrapAsync: function(returnAsyncError) {
    return function(req, res, next) {
      fn(req, res, next).catch(next);
    };
  },

  returnAsyncError: async function(req, res) {
    await new Promise(resolve => setTimeout(() => resolve(), 50));
    throw new Error('Something went wrong asynchronously');
  },

  returnError: function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something went wrong synchronously');
  },
};
