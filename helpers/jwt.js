const expressJwt = require('express-jwt');

function authJwt() {
    const secret = process.env.secret;
    const api = process.env.API_URL;
    return expressJwt({
        secret,
        algorithms: ['HS256'],
        isRevoked: isRevoked
    }).unless({
        path: [
            {url: /\/pbl6\/products(.*)/ , methods: ['GET','OPTIONS', 'POST', 'PUT', 'DELETE'] },
            {url: /\/pbl6\/category(.*)/ , methods: ['GET', 'OPTIONS', 'POST', 'PUT', 'DELETE'] },
            `${api}/users/login`,
            `${api}/users/register`,
            { url: /\/pbl6\/users(.*)/, methods: ['GET', 'OPTIONS', 'POST', 'PUT', 'DELETE'] },
            { url: /\/pbl6\/orders(.*)/, methods: ['GET', 'OPTIONS', 'POST', 'PUT', 'DELETE'] },
            {url: /\/public\/uploads(.*)/ , methods: ['GET','OPTIONS', 'POST', 'PUT', 'DELETE'] },
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



module.exports = authJwt