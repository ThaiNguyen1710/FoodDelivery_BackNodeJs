const expressJwt = require('express-jwt');

function authJwt() {
    const secret = process.env.secret;
    const api = process.env.API_URL;
    return expressJwt({
        secret,
        algorithms: ['HS256'],
        isRevoked: isUser
    }).unless({
        path: [
            // {url: /\/pbl6\/product(.*)/ , methods: ['GET','OPTIONS', 'POST', 'PUT', 'DELETE'] },
            // {url: /\/pbl6\/category(.*)/ , methods: ['GET', 'OPTIONS', 'POST', 'PUT', 'DELETE'] },
            `${api}/user/login`,
            `${api}/user/register`,
            // { url: /\/pbl6\/user(.*)/, methods: ['GET', 'OPTIONS', 'POST', 'PUT', 'DELETE'] },
            // { url: /\/pbl6\/shipper(.*)/, methods: ['GET', 'OPTIONS', 'POST', 'PUT', 'DELETE'] },
            // { url: /\/pbl6\/order(.*)/, methods: ['GET', 'OPTIONS', 'POST', 'PUT', 'DELETE'] },
            // {url: /\/public\/uploads(.*)/ , methods: ['GET','OPTIONS', 'POST', 'PUT', 'DELETE'] },
            {url: /\/(.*)/ , methods: ['GET','OPTIONS', 'POST', 'PUT', 'DELETE'] },
        ]
    })
}

async function isRevoked(req, payload, done) {
    if(!payload.isAdmin) {
        done(null, true)
    }

    done();
}
async function isUser(req, payload, done) {
    if(!payload.userId) {
        done(null, true)
    }

    done();
}



module.exports = authJwt