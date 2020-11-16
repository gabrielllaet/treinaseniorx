
/**
 * Nome da primitiva : enumQuery
 * Nome do dominio : hcm
 * Nome do serviço : payroll
 * Nome do tenant : trn62785998
 **/

exports.handler = async (event) => {
    return sendRes(200, JSON.parse(event.body));
};

const sendRes = (status, body) => {
  body.helloWorld = "Passou por aqui!";

  var response = {
    statusCode: status,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  };

  console.log(body);

  return response;
};
