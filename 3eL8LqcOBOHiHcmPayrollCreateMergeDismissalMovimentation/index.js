
/**
 * Nome da primitiva : createMergeDismissalMovimentation
 * Nome do dominio : hcm
 * Nome do serviço : payroll
 * Nome do tenant : trn62785998
 * 
 *        DESAFIO 2  - LAET
 **/

const axios =  require('axios');


exports.handler = async (event) => {
  
  let body = parseBody(event);
  let tokenSeniorX = event.headers['X-Senior-Token'];
  
  const api = axios.create({
      baseURL: 'https://platform-homologx.senior.com.br/t/senior.com.br/bridge/1.0/rest/',
      headers: {
        'Authorization': tokenSeniorX
      }
  });
  
  let colab = await api.get(`/hcm/payroll/entities/employee/${body.employee.id}`);
  
  let userApi = await api.get(`/platform/user/queries/getUser`);
  let userLogado = userApi.data;
  
  //let groupUser = await api.post(`platform//authorization/queries/getUserDetailRoles/${userLogado.username}`);
  
  let groupUser = await api.post('/platform//authorization/queries/getUserDetailRoles', {user: userLogado.username});
  
  let groupRole = groupUser.data;
  
  let colabData = colab.data;
  
  var colabAdmin = "false";
  
  for (let groupRoles of groupRole ){
    if(groupRoles.role.name === 'admin'){
      colabAdmin = "true";
    }
  }
  
  if (colabData.custom){
    if((colabData.custom.usuTrustPosition === 'S') && (colabAdmin === "false")){
      return sendRes(400, 'Não é permitido programar desligamento para colaborador que tem cargo de confiança');
    }
  }
  
  return sendRes(200, JSON.parse(event.body));
};

const parseBody = (event) => {
  return typeof event.body === 'string' ? JSON.parse(event.body) : event.body || {};
};


const sendRes = (status, body) => {

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
