exports.handler = async (event) => {
    const val = require(`./${event.headers.filename}`);
    return {
        statusCode: 200,
        body: JSON.stringify(await val(event.headers.Authorization, JSON.parse(event.body)))
    };
};