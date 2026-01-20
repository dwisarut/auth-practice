export default function LogoutHandler(req, res) {
    req.session.destroy();
    res.redirect('/');
};