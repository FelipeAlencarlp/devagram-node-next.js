import type { NextApiRequest, NextApiResponse } from 'next';
import { conectarMongoDb } from '../../../middlewares/conectarMongoDb';
import type { RespostaPadraoMsg } from '../../../types/RespostaPadraoMsg';

const endpointLogin = (
    req : NextApiRequest,
    res : NextApiResponse<RespostaPadraoMsg>
) => {
    if(req.method === 'POST') {
        const {login, senha} = req.body;

        if(login === 'admin@admin.com' &&
            senha === 'Admin@123') {
                return res.status(200).json({ msg : 'Usuário autenticado com sucesso.' });
        }
        return res.status(400).json({ erro : 'Usuário ou Senha não encontrado!' });
    }
    return res.status(405).json({ erro : 'Método informado é inválido!'});
}

export default conectarMongoDb(endpointLogin);