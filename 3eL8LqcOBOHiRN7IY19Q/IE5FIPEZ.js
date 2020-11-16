module.exports = async (authorization, parameters) => {
   const msg = 'hello world'
   
    return {
        type: 'HTML',
        text: [`
            <h1> ${msg} </h1>    
        `]
    }
}