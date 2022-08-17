module.exports = {

  // @desc     Google auth callback
  // @route    GET /auth/google/callback
  redirect: (req, res) =>{
    res.redirect('/dashboard');
  },

  // @desc    Logout user
  // @route   /auth/Logout
  logout: (req, res) => {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  }
}
