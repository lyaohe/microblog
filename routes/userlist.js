/*
 * GET userlist.
 */
exports.userlist = function(req, res){
  res.render('userlist', { title: '用户管理',layout:'admin' });
  //res.send("用户管理");
};
