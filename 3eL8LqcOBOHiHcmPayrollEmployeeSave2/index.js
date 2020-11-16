
/**
 * Nome da primitiva : employeeSave
 * Nome do dominio : hcm
 * Nome do serviço : payroll
 * Nome do tenant : trn62785998
 * 
 * Consultor Gabriel Laet
 * 
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
    
    /**
     * Questão SDK 1 
     * 
     * Desafio SDK - 1: Realizar validações na admissão de colaboradores e alteração do cadastro de colaboradores, 
     *  conforme as seguintes regras:
     *      1) Validar o campo "Matrícula", não permitindo que o mesmo fique em branco,  da aba Contrato da Tela de admissão;
     *      2) Não permitir que o campo "Indicativo de Admissão" seja diferente de "Normal";
     *      3) Ao alterar um colaborador não permitir que o Nome do Colaborador seja alterado;
     *      4) Para colaboradores do tipo de contrato "1 - Empregado" deverá obrigar utilizar Escala com código entre 1 a 10 e 
     *  que seja do tipo "Permanente";
     */
    if (!body.sheetContract.registernumber){
      
        return sendRes(400, 'Na aba Contrato, é obrigatório informar manualmente o campo Matrícula do colaborador, verifique!');
    }
    
    if (body.sheetContract.admissionOriginType.value !== "Normal"){
        return sendRes(400, 'Indicativo de Tipo de Admissão em Contrato não deve ser diferente de Normal! Verifique! ');
    }
    
    /*
    * Na alteração da ficha básica não permitir alterar nome do colaborador
    *   Verifica se já existe registro na base, se tiver compara, senão passa direto
    */
    if (body.sheetInitial.person.tableId !== "new"){
        
        let colab = await api.get(`/hcm/payroll/queries/employeeQuery?employeeId=${body.sheetInitial.employee.tableId}`);
        
        if (colab.data.result.sheetInitial.employee){
            if (colab.data.result.sheetInitial.employee.name !== body.sheetInitial.person.name){
                return sendRes(400, 'Não é permitido alterar o nome do colaborador!');
            }
        }
    }
    
    /*
    * Valida se a escala escolhida está entre 1 a 10 e se o tipo é Permanente para contrato de trabalho do tipo 1 - Empregado
    * caso não esteja deverá bloquear a contratação.
    */
    if (body.sheetInitial.contractType.value ==="1 - Empregado"){
        let escala = await api.get(`/hcm/payroll/entities/workshift/${body.sheetWorkSchedule.workshift.tableId}`);
        
        if ((escala.data.code >= 1) && (escala.data.code <= 10)) {
            if(escala.data.workshiftType !== "Permanent") {
                return sendRes(400, `A Escala ${escala.data.code} não é válida! Escolha uma Escala do tipo: Permanente!`);
            }
            
        } else {
            return sendRes(400, 'Para o Tipo de Contrato: 1 - Empregado, na aba Horário o campo Escala está limitado para utilização as escalas de 1 a 10!');
        }
    }
     
    // FIM Atividade 1 SDK
    
      
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
