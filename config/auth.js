module.exports={
    ensureAuthenticated: function(req,res,next){
        if(req.isAuthenticated()){
            return next();
        }
        req.flash('error_message','You need to log in to view that page');
        res.redirect('/users/login')
    }
}