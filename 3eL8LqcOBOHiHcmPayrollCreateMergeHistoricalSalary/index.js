
/**
 * Nome da primitiva : createMergeHistoricalSalary
 * Nome do dominio : hcm
 * Nome do serviço : payroll
 * Nome do tenant : trn62785998
 * 
 * * 
 * Consultor Gabriel Laet
 * 
 **/
 
const axios =  require('axios');
const momento =  require('moment');

exports.handler = async (event) => {
  
    let body = parseBody(event);
  
    let tokenSeniorX = event.headers['X-Senior-Token'];
    
    const api = axios.create({
        baseURL: 'https://platform-homologx.senior.com.br/t/senior.com.br/bridge/1.0/rest/',
        headers: {
          'Authorization': tokenSeniorX
        }
    });
    
    
    /**
    *
    * Validar se Motivo da alteração é Admissão, se for bloqueia
    * para isso foi usado primitiva autocomplete, que foi a única que identifiquei para conseguir comparar o tableid da movimentationreason
    * 
    */
    let motivoBody = {
        "table" : "Movimentationreason", 
        "fields" : ["MovimentationreasonCode", "MovimentationreasonNameI18n"],
        "order" : ["MovimentationreasonCode"],
        "conditions" : [{"fields": ["MovimentationreasonNameI18n"], 
        "expression": "LIKE", 
        "value" : "Admissão"
        }]
    };
    
    let motivoAlteracao = await api.post('/hcm/payroll/queries/autocomplete',motivoBody);
    
    // aqui compara pelo tableID o tipo de movimentação de alteração salarial, se for igual bloqueia 
    if (motivoAlteracao.data.result[0].tableId === body.movimentationReason.id){
        return sendRes(400, "Para alteração de Salário o campo: Motivo da Alteração não poderá ser 1 - Admissão! Verifique!");
    }
    
    /**
     * Validar data de alteração de salário, se for menor que a data atual bloqueia
     * 
    */
    let dataAtual = new Date().toLocaleDateString('en-US', "YYYY-MM-DD");
    
    if(body.dateWhen < dataAtual) {
        return sendRes(400, "Não é permitido realizar alteração de Salário com data inferior à data atual! Verifique!");
    }
    
        
    /**
     * Validar situação do colaborador, caso seja demitido não permitir gravar alteração de salário
     * 
    */
    let colaborador = await api.get(`/hcm/payroll/entities/employee/${body.employee.id}`);
    let dataAdmissao = colaborador.data.hiredate;
    let situacaoColab = await api.get(`/hcm/payroll/queries/employeeContractQuery?employeeId=${body.employee.id}&referenceDate=${dataAdmissao}`);
    if (situacaoColab.data.result.situation.name === "Demitido") {
        return sendRes(400, "Não é possível registrar novo histórico de Salário para Colaborador na situação - Demitido!");
    }
    
       
    return sendRes(200, JSON.parse(event.body));
};

/*  Função parseia body para JSON caso seja uma string */
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
